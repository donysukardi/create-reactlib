# @donysukardi/create-reactlib

[![Build Status][build-badge]][build]
[![downloads][downloads-badge]][npmcharts] [![version][version-badge]][package]
[![MIT License][license-badge]][license]

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)
[![PRs Welcome][prs-badge]][prs]

[![Supports React and Preact][react-badge]][react]

CLI to create React libraries with custom template support

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [Introduction](#introduction)
- [Features](#features)
- [Usage](#usage)
- [Configuration](#configuration)
- [Lifecycle Scripts](#lifecycle-scripts)
  - [API](#api)
- [Custom Packages](#custom-packages)
  - [Format](#format)
- [Contributors](#contributors)
- [License](#license)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Introduction

This CLI aims to speed up the developemnt and maintenance of React libraries. It is based on [@donysukardi/reactlib-template](https://github.com/donysukardi/reactlib-template) and installs [@donysukardi/reactlib-scripts](https://github.com/donysukardi/reactlib-scripts) as dependency.

## Features

- Easy to use CLI
- Overridable configuration via [kcd-scripts]([https://github.com/kentcdodds/kcd-scripts)
- [Rollup](https://rollupjs.org/) for build process
- [Babel](https://babeljs.io/) for transpilation
- [Jest](https://facebook.github.io/jest/) for testing
- [Storybook](https://storybook.js.org/) for component development and testing
- [Cypress](https://www.cypress.io/) for integration testing

## Usage

```bash
npm install --global @donysukardi/create-reactlib
```

and run the following command for guided mode

```bash
create-reactlib
```

or pass in arguments with the CLI.

```bash
create-reactlib --help
```

Alternatively, you could use npx without having to install this CLI package manually

```bash
npx @donysukardi/create-reactlib
```

## Configuration

The only compulsory parameter is `name`, which is the name of your new package.

| parameter               | type    | default                           | description                                                                      |
| ----------------------- | ------- | --------------------------------- | -------------------------------------------------------------------------------- |
| `preact`                | boolean | false                             | Flag to include preact build                                                     |
| `description`           | string  | ""                                | Description of the new package                                                   |
| `author`                | string  | "<github-username>"               | Author for package.json and README.md                                            |
| `repo`                  | string  | "<author>/<name>"                 | Repository for package.json                                                      |
| `license`               | string  | "MIT"                             | License for package.json and README.md                                           |
| `manager`               | string  | "npm"                             | Package manager to use for installation                                          |
| `semanticallyReleased`. | boolean | true                              | Flag to indicate whether package version should be 0.0.0-semantically-released   |
| `template`              | string  | "donysukardi/reactlib-template"   | Git repository or local path of template to copy/clone and initialize            |
| `scripts`               | string  | "<dest>/.template/scripts.js"     | Path to lifecycle scripts. Ref: [Lifecycle Scripts](#lifecycle-scripts)          |
| `packages`              | string  | "<dest>/.template/package.js[on]" | Path to additional packages to install. Ref: [Custom Packages](#custom-packages) |
| `install`               | boolean | true                              | Flag indicating whether package installation should be performed                 |

CLI flags

| parameter               | short | long                    |
| ----------------------- | ----- | ----------------------- |
| `preact`                | -p    | --preact.               |
| `description`           | -d    | --desc <value>          |
| `author`                | -a    | --author <value>        |
| `repo`                  | -r    | --repo <value>          |
| `license`               | -l    | --license <value>       |
| `manager`               |       | --npm or --yarn         |
| `semanticallyReleased`. | -s    | --semantically-released |
| `template`              | -t    | --template <value>      |
| `scripts`               | -S    | --scripts <value>       |
| `packages`              | -P    | --packages <value>      |
| `install`               | -x    | --no-install            |

## Lifecycle Scripts

This library provides `pre` and `post` hooks for the following lifecycles,

- `clonecopy`: Copying/Cloning template
- `template`: Processing template
- `package`: Installing packages
- `cleanup`: Cleaning up template artefacts
- `git`: Initializing git repository

You will need to export a JSON with the lifecycle names as the keys, e.g. `pretemplate`, `posttemplate`, in the script file.

By default, the library will look for the file in `.template/scripts.js` inside the destination path.

Caveat: When using default scripts, `preclonecopy` will not be executed as the file does not exist in the destination path yet.

### API

Each lifecycle script receives `info` and `tools` as arguments

**Tools**

Object containing library helpers,

```javascript
{
  handlebars,
  execa,
  fs, // fs-extra
  globby,
  mkdirp, // make-dir
  ora,
  pEachSeries, // p-each-series
  hostedGitInfo, // hosted-git-info
}
```

Lifecycle script should return either:

1.  Object with `title` - custom string to display with spinner and `promise` - function that returns promise to resolve
1.  Promise

**Example**

```javascript
// my-reactlib-template/.template/scripts.js

const preTemplate = (info, tools) => {
  // do something
  return {
    title: 'Doing something pre template',
    promise: () => {
      // do something
      return new Promise(resolve => setTimeout(() => resolve(), 2000))
    },
  }
}

const postTemplate = (info, tools) => {
  // do something
  return new Promise(resolve => setTimeout(() => resolve(), 2000))
}

module.exports = {
  pretemplate: preTemplate,
  posttemplate: postTemplate,
}
```

## Custom Packages

The library provides API to include dependencies outside those specified in the template.

You will need to export a JSON with `dependencies` and/or `devDependencies` keys, just like in `package.json`

By default, the library will look for the file in `.template/package.js` or `.template/package.json` inside the destination path.

If you use a js file, you're expected to export a function that will receive info as argument.

### Format

You can leave the version blank to let the library install the latest version for respective package.

```json
{
  "devDependencies": {
    "react": "",
    "react-dom": "",
    "prop-types": ""
  },
  "dependencies": {
    "some-package": "^1.4.0"
  }
}
```

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
| [<img src="https://avatars0.githubusercontent.com/u/410792?v=4" width="100px;"/><br /><sub><b>Dony Sukardi</b></sub>](http://dsds.io)<br />[💻](https://github.com/donysukardi/reheaded/commits?author=donysukardi "Code") [📖](https://github.com/donysukardi/reheaded/commits?author=donysukardi "Documentation") [💡](#example-donysukardi "Examples") [🤔](#ideas-donysukardi "Ideas, Planning, & Feedback") [👀](#review-donysukardi "Reviewed Pull Requests") [⚠️](https://github.com/donysukardi/reheaded/commits?author=donysukardi "Tests") |
| :---: |

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

## License

MIT © [donysukardi](https://github.com/donysukardi)

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[build-badge]: https://img.shields.io/travis/donysukardi/create-reactlib.svg?style=flat-square
[build]: https://travis-ci.org/donysukardi/create-reactlib
[version-badge]: https://img.shields.io/npm/v/@donysukardi/create-reactlib.svg?style=flat-square
[package]: https://www.npmjs.com/package/@donysukardi/create-reactlib
[downloads-badge]: https://img.shields.io/npm/dm/@donysukardi/create-reactlib.svg?style=flat-square
[npmcharts]: http://npmcharts.com/compare/@donysukardi/create-reactlib
[license-badge]: https://img.shields.io/npm/l/@donysukardi/create-reactlib.svg?style=flat-square
[license]: https://github.com/donysukardi/create-reactlib/blob/master/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[react-badge]: https://img.shields.io/badge/%E2%9A%9B%EF%B8%8F-(p)react-00d8ff.svg?style=flat-square
[react]: https://facebook.github.io/react/
[gzip-badge]: http://img.badgesize.io/https://unpkg.com/create-reactlibcreate-reactlib.umd.min.js?compression=gzip&label=gzip%20size&style=flat-square
[unpkg-dist]: https://unpkg.com/@donysukardi/create-reactlib
[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key
[all-contributors]: https://github.com/kentcdodds/all-contributors
