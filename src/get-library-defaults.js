const getGitConfigPath = require('git-config-path')
const githubUsername = require('github-username')
const parseGitConfig = require('parse-git-config')
const which = require('which')
const path = require('path')
const config = require('./config')

const defaultBool = (bool, defaultVal) =>
  typeof bool !== 'undefined' ? bool : defaultVal

const getInfoWithDefaults = (info, defaults) => {
  // handle scoped package names
  const parts = info.name.split('/')
  const shortName = parts[parts.length - 1]
  const cwd = process.cwd()

  const dest = info.dest
    ? path.resolve(cwd, info.dest)
    : path.join(cwd, shortName)

  return Object.assign({}, info, {
    name: info.name,
    description: info.desc || defaults.description,
    author: info.author || defaults.author,
    repo: info.repo || `${defaults.author}/${info.name}`,
    license: info.license || defaults.license,
    // eslint-disable-next-line
    manager: info.manager || defaults.manager,
    semanticallyReleased: defaultBool(
      info.semanticallyReleased,
      defaults.semanticallyReleased,
    ),
    template: info.template || defaults.template,
    year: new Date().getFullYear(),
    fullname: info.fullname || defaults.fullname,
    install: defaultBool(info.install, defaults.install),
    _dest: info.dest,
    dest,
    shortName,
    cwd,
  })
}

const getLibraryDefaults = async () => {
  const defaults = {
    author: config.get('author'),
    manager: config.get('manager', 'npm'),
    license: config.get('license', 'MIT'),
    semanticallyReleased: config.get('semanticallyReleased', true),
    description: '[[DESCRIPTION]]',
    template: 'donysukardi/reactlib-template',
    fullname: config.get('fullname', '[[FULLNAME]]'),
    install: true,
  }

  try {
    if (!config.get('author') || !config.get('fullname')) {
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
        config.set('author', defaults.author)
      }

      if (defaults.fullname) {
        config.set('fullname', defaults.fullname)
      }
    }

    if (!config.get('manager')) {
      if (which.sync('yarn', {nothrow: true})) {
        defaults.manager = 'yarn'
      }

      config.set('manager', defaults.manager)
    }
    /* eslint-disable-next-line */
  } catch (err) {}

  return defaults
}

module.exports = {
  getLibraryDefaults,
  getInfoWithDefaults,
}
