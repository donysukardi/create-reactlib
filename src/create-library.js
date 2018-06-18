/* eslint-disable no-console */
/* eslint-disable no-param-reassign */
/* eslint-disable import/newline-after-import */
const handlebars = require('handlebars')
const execa = require('execa')
const fs = require(`fs-extra`)
const globby = require('globby')
const mkdirp = require('make-dir')
const ora = require('ora')
const path = require('path')
const pEachSeries = require('p-each-series')
const hostedGitInfo = require(`hosted-git-info`)

const { clone, copy } = require('./utils')
const pkg = require('../package')

const copyTemplateFile = async (opts) => {
  const {
    file,
    source,
    dest,
    info
  } = opts

  const fileRelativePath = path.relative(source, file)
  const destFilePath = path.join(dest, fileRelativePath)
  const destFileDir = path.parse(destFilePath).dir
  const template = handlebars.compile(fs.readFileSync(file, 'utf8'))
  const content = template({
    ...info,
    yarn: (info.manager === 'yarn')
  })

  await mkdirp(destFileDir)
  fs.writeFileSync(destFilePath, content, 'utf8')

  return fileRelativePath
}

const processTemplate = async (rootPath, info) => {
  const source = rootPath
  const files = await globby(source, {
    dot: true,
    ignore: ['**/.DS_Store']
  })

  const promise = pEachSeries(files, async (file) =>
    copyTemplateFile({
      file,
      source,
      dest: rootPath,
      info
    })
  )
  await promise
}

const initPackageManager = async (opts) => {
  const {
    dest,
    info
  } = opts

  const stories = path.join(dest, 'stories')
  const instalCmd = info.manager === 'yarn' ? 'yarn add --dev' : 'npm install --save-dev'

  const commands = [
    {
      cmd: `${instalCmd} react react-dom prop-types @donysukardi/reactlib-scripts`,
      cwd: dest
    },
    {
      cmd: `${info.manager} install`,
      cwd: stories
    }
  ]

  return pEachSeries(commands, async ({ cmd, cwd }) =>
    execa.shell(cmd, { cwd })
  )
}

const initGitRepo = async (opts) => {
  const {
    dest
  } = opts

  const cmd = `git init && git add . && git commit -m "init ${pkg.name}@${pkg.version}"`
  return execa.shell(cmd, { cwd: dest })
}

const createLibrary = async (info) => {
  const {
    name,
    template
  } = info

  // handle scoped package names
  const parts = name.split('/')
  info.shortName = parts[parts.length - 1]

  const dest = path.join(process.cwd(), info.shortName)
  info.dest = dest

  const hostedInfo = hostedGitInfo.fromUrl(template);

  {
    const isClone = !!hostedInfo;
    const promise = isClone ? clone(hostedInfo, dest) : copy(template, dest)
    ora.promise(promise, `${isClone ? 'Cloning' : 'Copying'} template to ${dest}`)
    await promise
  }

  {
    const promise = processTemplate(dest, info)
    ora.promise(promise, `Processing template`)
    await promise
  }

  {
    const promise = initPackageManager({ dest, info })
    ora.promise(promise, `Installing packages`)
    await promise
  }

  {
    const promise = initGitRepo({ dest })
    ora.promise(promise, 'Initializing git repo')
    await promise
  }

  return dest
}

module.exports = createLibrary
