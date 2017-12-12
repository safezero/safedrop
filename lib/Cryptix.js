const defunction = require('defunction')
const cryptixTemplate = require('./templates/cryptix')
const cryptixPayloadTemplate = require('./templates/cryptixPayload')
const _ = require('lodash')
const elliptic = require('elliptic')
const Keypair = require('./Keypair')
const Manilla = require('./Manilla')
const Memory = require('./Memory')

const Cryptix = module.exports = defunction([
  'Uint8Array', 'Uint8Array'
], '*', function Cryptix(
  ephemeralPublicKey,
  ciphertext
) {
  _.merge(this, { ephemeralPublicKey, ciphertext })
})

Cryptix.prototype.getEncoding = defunction([], 'Uint8Array', function getEncoding() {
  return cryptixTemplate.encode(this.getPojo())
})

Cryptix.prototype.getPojo = defunction([], 'Object', function getPojo() {
  return {
    branch: 'v0',
    value: {
      ephemeralPublicKey: this.ephemeralPublicKey,
      ciphertext: this.ciphertext
    }
  }
})

Cryptix.fromEncoding = defunction(['Uint8Array'], 'Cryptix', function fromEncoding(encoding) {
  return Cryptix.fromPojo(cryptixTemplate.decode(encoding))
})

Cryptix.fromPojo = defunction(['Object'], 'Cryptix', function fromPojo(pojo) {
  return new Cryptix(pojo.value.ephemeralPublicKey, pojo.value.ciphertext)
})

Cryptix.fromPlaintext = defunction(['Uint8Array', 'Uint8Array'], 'Cryptix', function fromPlaintext(identityPublicKey, plaintext) {
  const ephemeralKeypair = Keypair.generate()
  const ciphertext = ephemeralKeypair.getAesCbc(identityPublicKey).getCiphertext(plaintext)
  return new Cryptix(ephemeralKeypair.publicKey, ciphertext)
})

Cryptix.prototype.getPlaintext = defunction(['Keypair'], 'Uint8Array', function getPlaintext(keypair) {
  return keypair.getAesCbc(this.ephemeralPublicKey).getPlaintext(this.ciphertext)
})

//TODO: manilla||memory defunction
Cryptix.prototype.getPayload = defunction(['Keypair'], '*', function getPayload(keypair) {
  const plaintext = this.getPlaintext(keypair)
  const cryptixPayloadPojo = cryptixPayloadTemplate.decode(plaintext)
  switch(cryptixPayloadPojo.branch) {
    case 'manilla':
      return Manilla.fromPojo(cryptixPayloadPojo)
      break;
    case 'memory':
      return Memory.fromPojo(cryptixPayloadPojo)
      break;
  }
})
