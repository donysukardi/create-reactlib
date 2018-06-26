/*
eslint-disable
no-console,
global-require,
import/no-dynamic-require
*/

const fs = require(`fs-extra`)
const path = require('path')
const program = require('commander')
const chalk = require('chalk')

const {
  getLibraryDefaults,
  getConfigWithDefaults,
} = require('./get-library-defaults')
const createLibrary = require('./create-library')
const promptLibraryConfig = require('./prompt-library-config')
const defaultConfig = require('./config')
const pkg = require('../package.json')

const getConfigFromCmd = () => {
  let name
  let dest
  program
    .version(pkg.version)
    .usage('[options] <library-name>')
    .arguments('<name> [dest]')
    .option('-c, --config <value>', 'Path to config file')
    .option('-d, --desc <value>', 'Library description')
    .option('-a, --author <value>', "Library author's git username")
    .option('-f, --fullname <value>', "Library author's fullname")
    .option('-r, --repo <value>', 'Github repository')
    .option('-l, --license <value>', 'License')
    .option('-n, --npm', 'Use npm as package manager')
    .option('-y, --yarn', 'Use yarn as package manager')
    .option('-s, --semantically-released', 'Semantically release the library')
    .option('-t, --template <value>', 'Template to use for the library')
    .option('-p, --preact', 'Include preact build')
    .option('-x, --no-install', 'Skip package installation')
    .option(
      '-S, --scripts <value>',
      'Path to scripts to execute during lifecycle',
    )
    .option('-P, --packages <value>', 'Path to additional packages to install')
    .action((packageName, destination) => {
      name = packageName
      dest = destination
    })
    .parse(process.argv)

  if (typeof name === 'undefined') {
    console.error('Please specify the project directory:')
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green('<library-name>')}`,
    )
    console.log()
    console.log('For example:')
    console.log(
      `  ${chalk.cyan(program.name())} ${chalk.green('my-react-lib')}`,
    )
    console.log()
    console.log(
      `Run ${chalk.cyan(`${program.name()} --help`)} to see all options.`,
    )
    process.exit(1)
  }

  let cliConfig = {}
  const configPath = program.config
    ? path.resolve(process.cwd(), program.config)
    : null
  if (fs.existsSync(configPath)) {
    cliConfig = require(configPath)
  }

  const config = Object.assign({}, cliConfig, {
    name,
    dest,
    preact: program.preact,
    description: program.desc,
    author: program.author,
    repo: program.repo,
    license: program.license,
    // eslint-disable-next-line
    manager: program.yarn ? 'yarn' : program.npm ? 'npm' : undefined,
    semanticallyReleased: program.semanticallyReleased,
    template: program.template,
    scripts: program.scripts,
    packages: program.packages,
    fullname: program.fullname,
    install: program.install,
  })

  return config
}

module.exports = async () => {
  const defaults = await getLibraryDefaults()
  let _config
  if (process.argv.length <= 2) {
    _config = await promptLibraryConfig(defaults)
  } else {
    _config = getConfigFromCmd(defaults)
  }

  const config = getConfigWithDefaults(_config, defaults)

  defaultConfig.set('author', config.author)
  defaultConfig.set('fullname', config.fullname)
  defaultConfig.set('manager', config.manager)
  defaultConfig.set('license', config.license)
  defaultConfig.set('semanticallyReleased', config.semanticallyReleased)

  await createLibrary(config)

  return config
}

module
  .exports()
  .then(config => {
    console.log(`
Success! Created ${config.name} at ${config.dest}
We suggest that you begin by typing:
  ${chalk.cyan('cd')} ${config._dest ? config._dest : config.shortName}
  ${chalk.cyan(`${config.manager} start`)}
`)

    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
