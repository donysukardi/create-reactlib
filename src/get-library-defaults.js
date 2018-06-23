const getGitConfigPath = require('git-config-path')
const githubUsername = require('github-username')
const parseGitConfig = require('parse-git-config')
const which = require('which')
const path = require('path')
const config = require('./config')

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
    semanticallyReleased:
      info.semanticallyReleased || defaults.semanticallyReleased,
    template: info.template || defaults.template,
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
    description: '',
    template: 'donysukardi/reactlib-template',
  }

  try {
    if (!config.get('author')) {
      const gitConfigPath = getGitConfigPath('global')

      if (gitConfigPath) {
        const gitConfig = parseGitConfig.sync({path: gitConfigPath})

        if (gitConfig.github && gitConfig.github.user) {
          defaults.author = gitConfig.github.user
        } else if (gitConfig.user && gitConfig.user.email) {
          defaults.author = await githubUsername(gitConfig.user.email)
        }
      }

      if (defaults.author) {
        config.set('author', defaults.author)
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
