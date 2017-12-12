const defunction = require('defunction')
const secp256k1 = require('secp256k1')
const _ = require('lodash')
const crypto = require('crypto')
const concat = require('./utils/concat')
const getHash = require('./utils/getHash')

const Signature = module.exports = defunction(['Uint8Array', 'Uint8Array'], 'undefined', function Signature(r, s) {
  _.merge(this, { r, s })
  this.encoding = concat([r, s])
})

Signature.prototype.verifyPrehash = defunction(['Uint8Array', 'Uint8Array'], 'boolean', function verifyPrehash(prehash, publicKey) {
  const hash = getHash(prehash)
  return this.verifyHash(hash, publicKey)
})

Signature.prototype.verifyHash = defunction(['Uint8Array', 'Uint8Array'], 'boolean', function verifyHash(hash, publicKey) {
  return secp256k1.verify(hash, this.encoding, publicKey)
})


Signature.prototype.getPojo = defunction([], 'Object', function getPojo() {
  return {
    r: this.r,
    s: this.s
  }
})

Signature.fromPojo = defunction(['Object'], 'Signature', function fromPojo(pojo) {
  return new Signature(pojo.r, pojo.s)
})
