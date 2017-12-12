const defunction = require('defunction')
const getHash = require('./getHash')
const concat = require('./concat')
const intcoder = require('intcoder')

module.exports = defunction(['Uint8Array', 'number'], 'Uint8Array', function getListIndexKey(key, index) {
  return getHash(concat([key, intcoder.encode(index)]))
})
