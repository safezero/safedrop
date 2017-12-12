const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const rimraf = require('rimraf')
const fs = require('fs')

chai.should()
chai.use(chaiAsPromised)

rimraf.sync(`${__dirname}/../db/`)
fs.mkdirSync(`${__dirname}/../db/`)

require('./safedrop')
