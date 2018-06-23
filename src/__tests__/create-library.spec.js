const execa = require('execa')
const path = require('path')
const rimraf = require('rimraf')

const createLibrary = require('../create-library')
const {
  getInfoWithDefaults,
  getLibraryDefaults,
} = require('../get-library-defaults')

const tests = [
  {
    name: 'react-liblib',
    author: 'dsds',
    description: 'this is a auto-generated test module. please ignore.',
    repo: 'dsds/react-liblib',
    license: 'MIT',
    manager: 'yarn',
    semanticallyReleased: false,
    template: 'donysukardi/reactlib-template',
  },
  {
    name: '@donysukardi/react-lib',
    author: 'dsds',
    description: 'this is a auto-generated test module. please ignore.',
    repo: 'donysukardi/react-lib',
    license: 'GPL',
    manager: 'yarn',
    semanticallyReleased: true,
    template: 'donysukardi/reactlib-template',
  },
]

const removeDir = dir =>
  new Promise(resolve => {
    rimraf(dir, {}, () => {
      resolve()
    })
  })

beforeAll(async () => {
  global.process.env.CYPRESS_INSTALL_BINARY = 0
  global.process.env.CI = true
  return Promise.all(
    tests.map(x => {
      const parts = x.name.split('/')
      const dir = parts[parts.length - 1]
      return removeDir(path.resolve(process.cwd(), dir))
    }),
  )
})

tests.forEach(_info => {
  describe(`creating "${_info.name}" using ${_info.manager}`, () => {
    it(
      'creates successfully',
      async () => {
        let ret
        // ensure library is created successfully
        const info = getInfoWithDefaults(_info, getLibraryDefaults())

        const root = await createLibrary(info)
        expect(root.indexOf(info.shortName) >= 0).toBeTruthy()

        // ensure yarn runs successfully in src/
        ret = await execa.shell('yarn', {cwd: root})
        expect(ret.code).toBe(0)

        // ensure jest tests pass
        ret = await execa.shell('yarn test --watch=0', {cwd: root})
        expect(ret.code).toBe(0)

        // ensure git is initialized properly
        ret = await execa.shell('git status', {cwd: root})
        expect(ret.code).toBe(0)

        await removeDir(root)
      },
      10000000,
    )
  })
})
