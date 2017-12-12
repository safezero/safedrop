const defunction = require('defunction')
const cryptixPayloadTemplate = require('./templates/cryptixPayload')
const _ = require('lodash')
const elliptic = require('elliptic')
const aesjs = require('aes-js')
const Keypair = require('./Keypair')
const Signature = require('./Signature')

const Manilla = module.exports = defunction([
  'Uint8Array', 'Uint8Array', 'Signature'
], '*', function Manilla(
  identityPublicKey,
  ciphertext,
  signature
) {
  _.merge(this, { identityPublicKey, ciphertext, signature })
})

Manilla.prototype.getEncoding = defunction([], 'Uint8Array', function getEncoding() {
  return cryptixPayloadTemplate.encode(this.getPojo())
})

Manilla.prototype.getPojo = defunction([], 'Object', function getPojo() {
  return {
    branch: 'manilla',
    value: {
      identityPublicKey: this.identityPublicKey,
      ciphertext: this.ciphertext,
      r: this.signature.r,
      s: this.signature.s
    }
  }
})

Manilla.fromEncoding = defunction(['Uint8Array'], 'Manilla', function fromEncoding(encoding) {
  return Manilla.fromPojo(cryptixPayloadTemplate.decode(encoding))
})

Manilla.fromPojo = defunction(['Object'], 'Manilla', function fromPojo(pojo) {
  const signature = new Signature(pojo.value.r, pojo.value.s)
  return new Manilla(pojo.value.identityPublicKey, pojo.value.ciphertext, signature)
})

Manilla.prototype.getPlaintext = defunction(['Keypair'], 'Uint8Array', function getPlaintext(keypair) {
  // TODO: verify signature
  return keypair.getAesCbc(this.identityPublicKey).getPlaintext(this.ciphertext)
})
