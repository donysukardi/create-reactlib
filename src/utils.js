const fs = require(`fs-extra`)
const path = require('path')
const execa = require('execa')

const ignored = _path => !/^\.(git|hg)$/.test(path.basename(_path))

const spawn = cmd => {
  const [file, ...args] = cmd.split(/\s+/)
  return execa(file, args, { stdio: `inherit` })
}

// Clones starter from URI.
const clone = async (hostInfo, rootPath) => {
  let url
  // Let people use private repos accessed over SSH.
  if (hostInfo.getDefaultRepresentation() === `sshurl`) {
    url = hostInfo.ssh({ noCommittish: true })
    // Otherwise default to normal git syntax.
  } else {
    url = hostInfo.https({ noCommittish: true, noGitPlus: true })
  }

  const branch = hostInfo.committish ? `-b ${hostInfo.committish}` : ``

  await spawn(`git clone ${branch} ${url} ${rootPath} --single-branch --quiet`)

  await fs.remove(path.join(rootPath, `.git`))
}

// Copy starter from file system.
const copy = async (starterPath, rootPath) => {
  // Chmod with 755.
  // 493 = parseInt('755', 8)
  await fs.mkdirp(rootPath, { mode: 493 })

  if (!fs.existsSync(starterPath)) {
    throw new Error(`template ${starterPath} doesn't exist`)
  }

  if (starterPath === `.`) {
    throw new Error(
      `You can't create a starter from the existing directory. If you want to
      create a new site in the current directory, the trailing dot isn't
      necessary. If you want to create a new site from a local starter, run
      something like "create-reactlib my-lib --template=../my-react-template"`
    )
  }

  await fs.copy(starterPath, rootPath, { filter: ignored })
}

module.exports.clone = clone;
module.exports.copy = copy;
