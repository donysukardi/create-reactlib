/* eslint-disable no-console */
const program = require('commander')
const chalk = require('chalk')

const {
  getLibraryDefaults,
  getInfoWithDefaults,
} = require('./get-library-defaults')
const createLibrary = require('./create-library')
const promptLibraryInfo = require('./prompt-library-info')
const config = require('./config')
const pkg = require('../package.json')

const getInfoFromCmd = () => {
  let name
  let dest
  program
    .version(pkg.version)
    .usage('[options] <library-name>')
    .arguments('<name> [dest]')
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

  const info = {
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
  }

  return info
}

module.exports = async () => {
  const defaults = await getLibraryDefaults()
  let _info
  if (process.argv.length <= 2) {
    _info = await promptLibraryInfo(defaults)
  } else {
    _info = getInfoFromCmd(defaults)
  }

  const info = getInfoWithDefaults(_info, defaults)

  config.set('author', info.author)
  config.set('fullname', info.fullname)
  config.set('manager', info.manager)
  config.set('license', info.license)
  config.set('semanticallyReleased', info.semanticallyReleased)

  await createLibrary(info)

  return info
}

module
  .exports()
  .then(info => {
    console.log(`
Success! Created ${info.name} at ${info.dest}
We suggest that you begin by typing:
  ${chalk.cyan('cd')} ${info._dest ? info._dest : info.shortName}
  ${chalk.cyan(`${info.manager} start`)}
`)

    process.exit(0)
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
