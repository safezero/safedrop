const defunction = require('defunction')
const Promise = require('bluebird')
const _waterfall = require('promise-waterfall')

module.exports = defunction(['[]Function'], 'Promise', function waterfall(wrappers) {
  if (wrappers.length === 0) {
    return Promise.resolve()
  }
  return _waterfall(wrappers)
})
