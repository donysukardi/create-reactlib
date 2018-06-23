/* eslint-disable global-require */
/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable import/newline-after-import */
/* eslint-disable import/no-dynamic-require */
/* eslint-disable no-await-in-loop */
const handlebars = require('handlebars')
const execa = require('execa')
const fs = require(`fs-extra`)
const globby = require('globby')
const mkdirp = require('make-dir')
const ora = require('ora')
const path = require('path')
const pEachSeries = require('p-each-series')
const hostedGitInfo = require(`hosted-git-info`)

const {clone, copy} = require('./utils')
const pkg = require('../package')

const copyTemplateFile = async opts => {
  const {file, source, dest, info} = opts

  const fileRelativePath = path.relative(source, file)
  const destFilePath = path.join(dest, fileRelativePath)
  const destFileDir = path.parse(destFilePath).dir
  const template = handlebars.compile(fs.readFileSync(file, 'utf8'))
  const content = template({
    ...info,
    yarn: info.manager === 'yarn',
  })

  await mkdirp(destFileDir)
  if (destFilePath.endsWith('.tmpl')) {
    fs.writeFileSync(destFilePath.replace(/\.tmpl$/, ''), content, 'utf8')
    fs.removeSync(destFilePath)
  } else {
    fs.writeFileSync(destFilePath, content, 'utf8')
  }

  return fileRelativePath
}

const processTemplate = async (rootPath, info) => {
  const source = rootPath
  const files = await globby(source, {
    dot: true,
    ignore: ['**/.DS_Store'],
  })

  const promise = pEachSeries(files, async file =>
    copyTemplateFile({
      file,
      source,
      dest: rootPath,
      info,
    }),
  )

  const licenseFile = path.resolve(
    __dirname,
    'licenses',
    `${info.license}.license`,
  )
  const licenseOutput = path.resolve(rootPath, 'LICENSE')
  if (fs.existsSync(licenseFile)) {
    const template = handlebars.compile(fs.readFileSync(licenseFile, 'utf8'))
    const content = template(info)
    fs.writeFileSync(licenseOutput, content, 'utf8')
  } else {
    fs.writeFileSync(licenseOutput, '', 'utf8')
  }

  await promise
}

const getPackages = (pkgs = {}) =>
  Object.entries(pkgs).map(
    ([pkg, version]) => (version ? `${pkg}@${version}` : pkg),
  )

const getPackagesPath = destPath =>
  [
    path.resolve(destPath, '.template/package.js'),
    path.resolve(destPath, '.template/package.json'),
  ].find(fs.existsSync)

const initPackageManager = async opts => {
  const {dest, info} = opts

  const instalCmd = info.manager === 'yarn' ? 'yarn add' : 'npm install'
  const installDevCmd =
    info.manager === 'yarn' ? 'yarn add --dev' : 'npm install --save-dev'

  const pkgJsonPath = path.resolve(dest, 'package.json')
  const pkgJson = require(pkgJsonPath)

  const packagesPath = info.packages
    ? path.resolve(process.cwd(), info.packages)
    : getPackagesPath(info.dest)

  let packages =
    packagesPath && fs.existsSync(packagesPath) ? require(packagesPath) : {}
  packages = typeof packages === 'function' ? packages(info) : packages

  if (info.install) {
    const corePackages = getPackages(packages.dependencies)
    const devPackages = getPackages(packages.devDependencies)

    const commands = [
      corePackages.length && {
        cmd: `${instalCmd} ${corePackages.join(' ')}`,
        cwd: dest,
      },
      devPackages.length && {
        cmd: `${installDevCmd} ${devPackages.join(' ')}`,
        cwd: dest,
      },
      !corePackages.length &&
        !devPackages.length && {
          cmd: `${info.manager} install`,
          cwd: dest,
        },
    ].filter(Boolean)

    return pEachSeries(commands, async ({cmd, cwd}) => execa.shell(cmd, {cwd}))
  } else {
    const {dependencies = {}, devDependencies = {}} = packages
    const depEntries = Object.entries(dependencies)
    const devDepEntries = Object.entries(devDependencies)

    const newDeps = Object.assign({}, dependencies)
    const newDevDeps = Object.assign({}, devDependencies)

    if (depEntries.length) {
      await pEachSeries(depEntries, async ([pkg, version]) => {
        if (!version) {
          const {stdout: latest} = await execa.shell(
            `npm info ${pkg} dist-tags.latest`,
          )
          newDeps[pkg] = `^${latest}`
        }
      })
    }

    if (devDepEntries.length) {
      await pEachSeries(devDepEntries, async ([pkg, version]) => {
        if (!version) {
          const {stdout: latest} = await execa.shell(
            `npm info ${pkg} dist-tags.latest`,
          )
          newDevDeps[pkg] = `^${latest}`
        }
      })
    }

    const newPkgJson = Object.assign({}, pkgJson, {
      dependencies: Object.assign({}, pkgJson.dependencies || {}, newDeps),
      devDependencies: Object.assign(
        {},
        pkgJson.devDependencies || {},
        newDevDeps,
      ),
    })

    return fs.writeFileSync(
      pkgJsonPath,
      JSON.stringify(newPkgJson, null, 2),
      'utf-8',
    )
  }
}

const initGitRepo = async opts => {
  const {dest} = opts

  const cmd = `git init && git add . && git commit -m "init ${pkg.name}@${
    pkg.version
  }"`
  return execa.shell(cmd, {cwd: dest})
}

const cleanUp = async ({dest}) => {
  fs.removeSync(path.resolve(dest, '.template'))
}

const runLifecycle = async (info, lifecycle) => {
  const tools = {
    handlebars,
    execa,
    fs,
    globby,
    mkdirp,
    ora,
    pEachSeries,
    hostedGitInfo,
  }

  return pEachSeries(lifecycle, async current => {
    const scriptsPath = info.scripts
      ? path.resolve(process.cwd(), info.scripts)
      : path.resolve(info.dest, '.template/scripts.js')

    let scripts = fs.existsSync(scriptsPath) ? require(scriptsPath) : {}
    scripts = typeof scripts === 'function' ? scripts(info) : scripts

    const preTitle = `pre${current.title}`
    const postTitle = `post${current.title}`

    const preScript = scripts[preTitle]
    const postScript = scripts[postTitle]

    if (preScript) {
      const prePromiseRes = preScript(info, tools)
      const prePromise = prePromiseRes.promise
        ? prePromiseRes.promise()
        : prePromiseRes
      ora.promise(
        prePromise,
        prePromiseRes.title || `Running ${preTitle} script`,
      )
      await prePromise
    }

    const promise = current.promise(info)
    ora.promise(promise, current.message)
    await promise

    if (postScript) {
      const postPromiseRes = postScript(info, tools)
      const postPromise = postPromiseRes.promise
        ? postPromiseRes.promise()
        : postPromiseRes
      ora.promise(
        postPromise,
        postPromiseRes.title || `Running ${postTitle} script`,
      )
      await postPromise
    }
  })
}

const createLibrary = async info => {
  const {dest, template} = info

  const hostedInfo = hostedGitInfo.fromUrl(template)
  const isClone = !!hostedInfo
  info.isClone = isClone
  info.hostedInfo = hostedInfo

  await runLifecycle(info, [
    {
      title: 'clonecopy',
      message: `${isClone ? 'Cloning' : 'Copying'} template to ${dest}`,
      promise: () => (isClone ? clone(hostedInfo, dest) : copy(template, dest)),
    },
    {
      title: 'template',
      message: `Processing template`,
      promise: () => processTemplate(dest, info),
    },
    {
      title: 'package',
      message: info.install ? `Installing packages` : `Adding packages`,
      promise: () => initPackageManager({dest, info}),
    },
    {
      title: 'cleanup',
      message: 'Cleaning up',
      promise: () => cleanUp({dest}),
    },
    {
      title: 'git',
      message: 'Initializing git repo',
      promise: () => initGitRepo({dest}),
    },
  ])

  return dest
}

module.exports = createLibrary
