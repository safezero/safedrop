const defunction = require('defunction')

//TODO: # defunction
const GatewayConnectionsManager = module.exports = defunction([], '*', function GatewayConnectionsManager () {
  this.gatewayConnections = {}
})

GatewayConnectionsManager.prototype.get = defunction(['Gateway'], 'GatewayConnection', function getGatewayConnection(gateway) {
  if (this.gatewayConnections[gateway.id] === undefined) {
    this.gatewayConnections[gateway.id] = gateway.getConnection()
  }
  return this.gatewayConnections[gateway.id]
})
