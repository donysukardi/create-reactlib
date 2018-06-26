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
  const {file, source, dest, config} = opts

  const fileRelativePath = path.relative(source, file)
  const destFilePath = path.join(dest, fileRelativePath)
  const destFileDir = path.parse(destFilePath).dir
  const template = handlebars.compile(fs.readFileSync(file, 'utf8'))
  const content = template({
    ...config,
    yarn: config.manager === 'yarn',
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

const processTemplate = async (source, config) => {
  const files = await globby(source, {
    dot: true,
    ignore: ['**/.DS_Store', '**/.template'],
  })

  const promise = pEachSeries(files, async file =>
    copyTemplateFile({
      file,
      source,
      dest: source,
      config,
    }),
  )

  if (config.license !== 'UNLICENSED') {
    const licenseFile = path.resolve(
      __dirname,
      'licenses',
      `${config.license}.license`,
    )

    const licenseOutput = path.resolve(source, 'LICENSE')
    if (fs.existsSync(licenseFile)) {
      const template = handlebars.compile(fs.readFileSync(licenseFile, 'utf8'))
      const content = template(config)
      fs.writeFileSync(licenseOutput, content, 'utf8')
    } else {
      fs.writeFileSync(licenseOutput, '', 'utf8')
    }
  }

  await promise
}

const requireFile = (filePath, ...args) => {
  const exists = fs.existsSync(filePath)
  const scripts = exists ? require(filePath) : {}
  return typeof scripts === 'function' ? scripts(...args) : scripts
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
  const {dest, config} = opts

  const instalCmd = config.manager === 'yarn' ? 'yarn add' : 'npm install'
  const installDevCmd =
    config.manager === 'yarn' ? 'yarn add --dev' : 'npm install --save-dev'

  const pkgJsonPath = path.resolve(dest, 'package.json')
  const pkgJson = require(pkgJsonPath)

  const packagesPath = config.packages
    ? path.resolve(process.cwd(), config.packages)
    : getPackagesPath(config.dest)

  const packages = requireFile(packagesPath, config)

  if (config.install) {
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
          cmd: `${config.manager} install`,
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

const runLifecycle = async (config, lifecycle) => {
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

  let scripts = null

  return pEachSeries(lifecycle, async current => {
    const promise = current.promise(config)
    ora.promise(promise, current.message)
    await promise

    if (!scripts) {
      scripts = Object.assign(
        {},
        requireFile(path.resolve(config.dest, '.template/scripts.js'), config),
        config.scripts
          ? requireFile(path.resolve(process.cwd(), config.scripts), config)
          : {},
      )
    }

    const postScript = scripts[`post${current.title}`]
    if (postScript) {
      await postScript(config, tools)
    }
  })
}

const createLibrary = async config => {
  const {dest, template} = config

  const hostedInfo = hostedGitInfo.fromUrl(template)
  const isClone = !!hostedInfo
  config.isClone = isClone
  config.hostedInfo = hostedInfo

  await runLifecycle(config, [
    {
      title: 'clonecopy',
      message: `${isClone ? 'Cloning' : 'Copying'} template to ${dest}`,
      promise: async () => {
        if (isClone) await clone(hostedInfo, dest)
        else await copy(template, dest)

        const tmplConfig = requireFile(
          path.resolve(config.dest, '.template/config.js'),
          config,
        )

        const configCopy = Object.assign({}, config)
        Object.assign(config, tmplConfig, configCopy) // existing config should override template
      },
    },
    {
      title: 'template',
      message: `Processing template`,
      promise: () => processTemplate(dest, config),
    },
    {
      title: 'package',
      message: config.install ? `Installing packages` : `Adding packages`,
      promise: () => initPackageManager({dest, config}),
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
