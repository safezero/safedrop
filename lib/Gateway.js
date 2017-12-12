const defunction = require('defunction')
const gatewayTemplate = require('./templates/gateway')
const GatewayConnection = require('./GatewayConnection')

// TODO: # defunction
const Gateway = module.exports = defunction(['Object'], '*', function Gateway(pojo) {
  this.pojo = pojo
  this.encoding = gatewayTemplate.encode(pojo)
  this.id = (new Buffer(this.encoding)).toString('hex')
})

Gateway.prototype.getConnection = defunction([], 'GatewayConnection', function getConnection() {
  if (this.connection) {
    return this.connection
  }
  this.connection = new GatewayConnection(this)
  return this.connection
})
