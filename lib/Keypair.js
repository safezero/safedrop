const secp256k1 = require('secp256k1')
const crypto = require('crypto')
const defunction = require('defunction')
const _ = require('lodash')
const Signature = require('./Signature')
const AesCbc = require('./AesCbc')
const getHash = require('./utils/getHash')

const Keypair = module.exports = defunction(['Uint8Array'], '*', function Keypair(privateKey) {
  this.privateKey = privateKey
  this.publicKey = new Uint8Array(secp256k1.publicKeyCreate(new Buffer(privateKey)))
})

Keypair.generate = defunction([], 'Keypair', function generate() {
  const privateKey = crypto.randomBytes(32)

  if(!secp256k1.privateKeyVerify(privateKey)) {
    return Keypair.generate()
  }

  return new Keypair(new Uint8Array(privateKey))
})

Keypair.prototype.getSignature = defunction(['Uint8Array'], 'Signature', function getSignature(prehash) {
  const hash = getHash(prehash)
  const secp256k1Signature = new Uint8Array(secp256k1.sign(new Buffer(hash), new Buffer(this.privateKey)).signature)
  return new Signature(
    new Uint8Array(secp256k1Signature.slice(0, 32)),
    new Uint8Array(secp256k1Signature.slice(32, 64))
  )
})

Keypair.prototype.getEcdhSharedKey = defunction(['Uint8Array'], 'Uint8Array', function getEcdhSharedKey(publicKey) {
  return new Uint8Array(secp256k1.ecdh(new Buffer(publicKey), new Buffer(this.privateKey)))
})

Keypair.prototype.getAesKey = defunction(['Uint8Array'], '*', function getAesCbc(publicKey) {
  const sharedKey = this.getEcdhSharedKey(publicKey)
  return sharedKey.slice(0, 16)
})

Keypair.prototype.getAesCbc = defunction(['Uint8Array'], '*', function getAesCbc(publicKey) {
  const sharedKey = this.getEcdhSharedKey(publicKey)
  const aesKey = sharedKey.slice(0, 16)
  const aesIv = sharedKey.slice(16, 32)
  return new AesCbc(aesKey, aesIv)
})
