const defunction = require('defunction')
const _ = require('lodash')

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
