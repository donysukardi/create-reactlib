const inquirer = require('inquirer')
const validateNpmName = require('validate-npm-package-name')

module.exports = async defaults => {
  const config = await inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Package Name',
      validate: name => name && validateNpmName(name).validForNewPackages,
    },
    {
      type: 'input',
      name: 'description',
      message: 'Package Description',
      default: '',
    },
    {
      type: 'confirm',
      name: 'preact',
      message: 'Include Preact Build',
      default: defaults.preact,
    },
    {
      type: 'input',
      name: 'author',
      message: "Author's GitHub Handle",
      default: defaults.author,
    },
    {
      type: 'input',
      name: 'fullname',
      message: "Author's Fullname",
      default: defaults.fullname,
    },
    {
      type: 'input',
      name: 'repo',
      message: 'GitHub Repo Path',
      default: config => `${config.author}/${config.name}`,
    },
    {
      type: 'list',
      name: 'license',
      message: 'License',
      choices: ['MIT', 'Apache-2.0', 'GPL-3.0-only', 'UNLICENSED', 'Other'],
      default: defaults.license,
    },
    {
      type: 'input',
      name: 'license',
      message: 'Other License',
      when: response => response.license === 'Other',
    },
    {
      type: 'list',
      name: 'manager',
      message: 'Package Manager',
      choices: ['npm', 'yarn'],
      default: defaults.manager,
    },
    {
      type: 'input',
      name: 'template',
      message: 'Template Path / Repository',
      default: defaults.template,
    },
    {
      type: 'confirm',
      name: 'semanticallyReleased',
      message: 'Semantically Released',
      default: defaults.semanticallyReleased,
    },
    {
      type: 'input',
      name: 'scripts',
      message: 'Scripts Path',
    },
    {
      type: 'input',
      name: 'packages',
      message: 'Additional Packages Path',
    },
    {
      type: 'confirm',
      name: 'install',
      message: 'Install Packages',
      default: true,
    },
  ])

  return config
}
