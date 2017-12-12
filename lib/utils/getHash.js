const defunction = require('defunction')
const crypto = require('crypto')

module.exports = defunction(['Uint8Array'], 'Uint8Array', function getHash(prehash) {
  const hashBuffer = crypto.createHash('sha256').update(prehash).digest()
  return new Uint8Array(hashBuffer)
})
