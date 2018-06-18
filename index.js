#!/usr/bin/env node
const compatRequire = require('node-compat-require')

compatRequire('./src', { node: '>= 8' })
