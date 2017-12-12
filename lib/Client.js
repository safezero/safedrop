const defunction = require('defunction')
const Emitter = require('events')
const directiveTemplate = require('./templates/directive')
const commandTemplate = require('./templates/command')
const responseTemplate = require('./templates/response')
const itemsTemplate = require('./templates/items')
const crypto = require('crypto')
const secp256k1 = require('secp256k1')
const getTimestamp = require('./utils/getTimestamp')
const concat = require('./utils/concat')
const _ = require('lodash')
const intcoder = require('intcoder')
const padLeft = require('./utils/padLeft')
const Cryptix = require('./Cryptix')
const Manilla = require('./Manilla')
const waterfall = require('./utils/waterfall')
const getHash = require('./utils/getHash')
const AesCbc = require('./AesCbc')
const Memory = require('./Memory')
const GatewayConnectionsManager = require('./GatewayConnectionsManager')
const Persona = require('./Persona')
const hashcash = require('./utils/hashcash')

const Client = module.exports = defunction(['Keypair', 'Uint8Array', 'Gateway'], '*', function Client(identityKeypair, memoryRootKey, gateway) {
  this.identityKeypair = identityKeypair
  this.memoryRootKey = memoryRootKey
  this.gateway = gateway
  this.persona = new Persona(this.identityKeypair.publicKey, this.gateway)
  this.gatewayConnectionsManager = new GatewayConnectionsManager
})

Client.prototype.send = defunction(['Gateway', 'Uint8Array'], 'Promise', function send(gateway, message) {
  return this.gatewayConnectionsManager.get(gateway).send(message)
})

Client.prototype.sendCommandEncoding = defunction(['Gateway', 'Uint8Array'], 'Promise', function sendCommandEncoding(gateway, commandEncoding) {
  return this.gatewayConnectionsManager.get(gateway).onceConnected().then((gatewayConnection) => {
    const timestamp = getTimestamp()
    const greetingPojo = gatewayConnection.greetingPojo
    const antireplayNonce = greetingPojo.value.antireplayNonce
    const prehash = concat([antireplayNonce, timestamp, commandEncoding])
    return hashcash.solveNonce(getHash(prehash), intcoder.decode(greetingPojo.value.difficulty)).then((nonce) => {
      const directiveEncoding = directiveTemplate.encode({
        branch: 'v0',
        value: {
          nonce,
          timestamp,
          commandEncoding
        }
      })
      return gatewayConnection.send(directiveEncoding).then((responseEncoding) => {
        const responsePojo = responseTemplate.decode(responseEncoding)
        if (!_.isEqual(nonce, responsePojo.value.nonce)) {
          throw new Error('Invalid Nonce')
        }
        if (responsePojo.value.code[0] != 0) {
          throw new Error(`Error Code ${responsePojo.value.code[0]}`)
        }
        return responsePojo.value.valueEncoding
      })
    })
  })
})

//TODO: option defunction tag
Client.prototype.addDrop = defunction(['Persona', 'Uint8Array'], '=>Uint8Array', function addDrop(persona, drop) {
  const commandEncoding = commandTemplate.encode({
    branch: 'addDrop',
    value: {
      identityPublicKey: persona.identityPublicKey,
      drop: drop
    }
  })
  return this.sendCommandEncoding(persona.gateway, commandEncoding)
})

Client.prototype.getDrops = defunction([], '=>[]Uint8Array', function getDrops() {
  const commandEncoding = commandTemplate.encode({
    branch: 'getDrops',
    value: this.identityKeypair.publicKey
  })
  return this.sendCommandEncoding(this.gateway, commandEncoding).then((dropsEncoding) => {
    return itemsTemplate.decode(dropsEncoding)
  })
})

Client.prototype.addPlaintext = defunction(['Persona', 'Uint8Array'], 'Promise', function addPlaintext(persona, plaintext) {
  const ciphertext = this.identityKeypair.getAesCbc(persona.identityPublicKey).getCiphertext(plaintext)
  const signature = this.identityKeypair.getSignature(persona.identityPublicKey)
  const manilla = new Manilla(this.identityKeypair.publicKey, ciphertext, signature)
  const cryptix = Cryptix.fromPlaintext(persona.identityPublicKey, manilla.getEncoding())

  return this.addDrop(persona, cryptix.getEncoding()).then(() => {
    const memoryNonce = new Uint8Array(crypto.randomBytes(32))
    const memoryKey = getHash(concat([this.memoryRootKey, memoryNonce]))
    const aesCbc = new AesCbc(memoryKey.slice(0, 16), memoryKey.slice(16, 32))
    const ciphertext = aesCbc.getCiphertext(plaintext)
    const memory = new Memory(memoryNonce, ciphertext)
    const cryptix = Cryptix.fromPlaintext(this.identityKeypair.publicKey, memory.getEncoding())
    return this.addDrop(this.persona, cryptix.getEncoding())
  })
})

Client.prototype.getCryptixes = defunction([], '=>[]Cryptix', function getCryptixes() {
  return this.getDrops().then((drops) => {
    return drops.map((drop) => {
      try {
        return Cryptix.fromEncoding(drop)
      } catch (err) {
        return undefined
      }
    }).filter((cryptix) => {
      return cryptix !== undefined
    })
  })
})

//TODO: manilla||memory defunction
Client.prototype.getCryptixPayloads = defunction([], '=>[]*', function getCryptixPayloads() {
  return this.getCryptixes().then((cryptixes) => {
    return cryptixes.map((cryptix) => {
      return cryptix.getPayload(this.identityKeypair)
    })
  })
})

Client.prototype.getCryptixPayloadPlaintexts = defunction([], '=>[]Uint8Array', function getCryptixPayloadPlaintexts() {
  return this.getCryptixPayloads().then((payloads) => {
    return payloads.map((payload) => {
      switch(payload.constructor.name) {
        case 'Manilla':
          return payload.getPlaintext(this.identityKeypair)
          break;
        case 'Memory':
          return payload.getPlaintext(this.memoryRootKey)
          break;
      }
    })
  })
})
