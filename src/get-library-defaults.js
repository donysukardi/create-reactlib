const getGitConfigPath = require('git-config-path')
const githubUsername = require('github-username')
const parseGitConfig = require('parse-git-config')
const which = require('which')
const path = require('path')
const defaultConfig = require('./config')

const defaultBool = (bool, defaultVal) =>
  typeof bool !== 'undefined' ? bool : defaultVal

const getConfigWithDefaults = (config, defaults) => {
  // handle scoped package names
  const parts = config.name.split('/')
  const shortName = parts[parts.length - 1]
  const cwd = process.cwd()

  const dest = config.dest
    ? path.resolve(cwd, config.dest)
    : path.join(cwd, shortName)

  return Object.assign({}, config, {
    name: config.name,
    description: config.desc || defaults.description,
    author: config.author || defaults.author,
    repo: config.repo || `${defaults.author}/${config.name}`,
    license: config.license || defaults.license,
    // eslint-disable-next-line
    manager: config.manager || defaults.manager,
    semanticallyReleased: defaultBool(
      config.semanticallyReleased,
      defaults.semanticallyReleased,
    ),
    template: config.template || defaults.template,
    year: new Date().getFullYear(),
    fullname: config.fullname || defaults.fullname,
    install: defaultBool(config.install, defaults.install),
    _dest: config.dest,
    dest,
    shortName,
    cwd,
  })
}

const getLibraryDefaults = async () => {
  const defaults = {
    author: defaultConfig.get('author'),
    manager: defaultConfig.get('manager', 'npm'),
    license: defaultConfig.get('license', 'MIT'),
    semanticallyReleased: defaultConfig.get('semanticallyReleased', true),
    description: '[[DESCRIPTION]]',
    template: 'donysukardi/reactlib-template',
    fullname: defaultConfig.get('fullname', '[[FULLNAME]]'),
    install: true,
  }

  try {
    if (!defaultConfig.get('author') || !defaultConfig.get('fullname')) {
      const gitConfigPath = getGitConfigPath('global')

      if (gitConfigPath) {
        const gitConfig = parseGitConfig.sync({path: gitConfigPath})

        if (gitConfig.github && gitConfig.github.user) {
          defaults.author = gitConfig.github.user
        } else if (gitConfig.user && gitConfig.user.email) {
          defaults.author = await githubUsername(gitConfig.user.email)
        }

        if (gitConfig.user) {
          defaults.fullname = gitConfig.user.name
        }
      }

      if (defaults.author) {
        defaultConfig.set('author', defaults.author)
      }

      if (defaults.fullname) {
        defaultConfig.set('fullname', defaults.fullname)
      }
    }

    if (!defaultConfig.get('manager')) {
      if (which.sync('yarn', {nothrow: true})) {
        defaults.manager = 'yarn'
      }

      defaultConfig.set('manager', defaults.manager)
    }
    /* eslint-disable-next-line */
  } catch (err) {}

  return defaults
}

module.exports = {
  getLibraryDefaults,
  getConfigWithDefaults,
}
