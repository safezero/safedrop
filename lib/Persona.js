const defunction = require('defunction')
const _ = require('lodash')
const personaTemplate = require('./templates/persona')
const Gateway = require('./Gateway')

//TODO: always error defunction
const Persona = module.exports = defunction(['Uint8Array', 'Gateway'], '*', function Persona(identityPublicKey, gateway) {
  _.merge(this, { identityPublicKey, gateway })
})

Persona.prototype.getEncoding = defunction([], 'Uint8Array', function getEncoding() {
  return personaTemplate.encode({
    branch: 'v0',
    value: {
      identityPublicKey: this.identityPublicKey,
      gateway: this.gateway.pojo
    }
  })
})

Persona.fromEncoding = defunction(['Uint8Array'], 'Persona', function fromEncoding(encoding) {
  const pojo = personaTemplate.decode(encoding)
  const gateway = new Gateway(pojo.value.gateway)
  return new Persona(pojo.value.identityPublicKey, gateway)
})
