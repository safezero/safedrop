const defunction = require('defunction')
const cryptixPayloadTemplate = require('./templates/cryptixPayload')
const _ = require('lodash')
const elliptic = require('elliptic')
const aesjs = require('aes-js')
const Keypair = require('./Keypair')
const AesCbc = require('./AesCbc')
const getHash = require('./utils/getHash')
const concat = require('./utils/concat')

const Memory = module.exports = defunction([
  'Uint8Array', 'Uint8Array'
], '*', function Memory(
  nonce,
  ciphertext
) {
  _.merge(this, { nonce, ciphertext })
})

Memory.prototype.getEncoding = defunction([], 'Uint8Array', function getEncoding() {
  return cryptixPayloadTemplate.encode(this.getPojo())
})

Memory.prototype.getPojo = defunction([], 'Object', function getPojo() {
  return {
    branch: 'memory',
    value: {
      nonce: this.nonce,
      ciphertext: this.ciphertext
    }
  }
})

Memory.fromEncoding = defunction(['Uint8Array'], 'Memory', function fromEncoding(encoding) {
  return Memory.fromPojo(cryptixPayloadTemplate.decode(encoding))
})

Memory.fromPojo = defunction(['Object'], 'Memory', function fromPojo(pojo) {
  return new Memory(pojo.value.nonce, pojo.value.ciphertext)
})

Memory.prototype.getPlaintext = defunction(['Uint8Array'], 'Uint8Array', function getPlaintext(memoryRootKey) {
  const memoryKey = getHash(concat([memoryRootKey, this.nonce]))
  const aesCbc = new AesCbc(memoryKey.slice(0, 16), memoryKey.slice(16, 32))
  return aesCbc.getPlaintext(this.ciphertext)
})
