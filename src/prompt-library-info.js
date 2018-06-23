const inquirer = require('inquirer')
const validateNpmName = require('validate-npm-package-name')

module.exports = async defaults => {
  const info = await inquirer.prompt([
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
      type: 'input',
      name: 'author',
      message: "Author's GitHub Handle",
      default: defaults.author,
    },
    {
      type: 'input',
      name: 'repo',
      message: 'GitHub Repo Path',
      default: info => `${info.author}/${info.name}`,
    },
    {
      type: 'input',
      name: 'license',
      message: 'License',
      default: defaults.license,
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
  ])

  return info
}
