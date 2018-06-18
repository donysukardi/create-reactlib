# @donysukardi/create-reactlib

[![travis build](https://img.shields.io/travis/donysukardi/create-reactlib.svg?style=flat-square)](https://travis-ci.org/donysukardi/create-reactlib)
[![version](https://img.shields.io/npm/v/@donysukardi/create-reactlib.svg?style=flat-square)](http://npm.im/@donysukardi/create-reactlib)
[![downloads](https://img.shields.io/npm/dm/@donysukardi/create-reactlib.svg?style=flat-square)](http://npm-stat.com/charts.html?package=@donysukardi/create-reactlib&from=2015-08-01)
[![MIT License](https://img.shields.io/npm/l/@donysukardi/create-reactlib.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)

CLI to create React libraries with custom template support

## Table of Contents

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Introduction](#introduction)
- [Features](#features)
- [Usage](#usage)
- [Configuration](#configuration)
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

| parameter               | type    | default                          | description                                                                    |
| ----------------------- | --------| -------------------------------- | ------------------------------------------------------------------------------ |
| `description`           | string  | ""                               | Description of the new package                                                 |
| `author`                | string  | \<github-username>                | Author for package.json and README.md                                         |
| `repo`                  | string  | \<author>/\<name>                  | Repository for package.json                                                  |
| `license`               | string  | "MIT"                            | License for package.json and README.md                                         |
| `manager`               | string  | "npm"                            | Package manager to use for installation                                        |
| `semanticallyReleased`. | boolean | true                             | Flag to indicate whether package version should be 0.0.0-semantically-released |
| `template`              | string  | "donysukardi/reactlib-template"  | Git repository or local path of template to copy/clone and initialize          |

CLI flags

| parameter               | short   | long                             |
| ----------------------- | --------| -------------------------------- |
| `description`           | -d      | --desc <value>                   |
| `author`                | -a      | --author <value>                 |
| `repo`                  | -r      | --repo <value>                   |
| `license`               | -l      | --license <value>                |
| `manager`               |         | --npm or --yarn                  |
| `semanticallyReleased`. | -s      | --semantically-released          |
| `template`              | -t      | --template <value>               |

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
