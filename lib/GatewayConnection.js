const defunction = require('defunction')
const gatewayTemplate = require('./templates/gateway')
const WebSocketClient = require('safedrop-websocket-client')
const intcoder = require('intcoder')
const greetingTemplate = require('./templates/greeting')

// TODO: # defunction
const GatewayConnection = module.exports = defunction(['Gateway'], '*', function GatewayConnection(gateway) {
  this.gateway = gateway
  this.isConnected = false

  const address = this.gateway.pojo.value.address.join('.')
  const port = intcoder.decode(this.gateway.pojo.value.port)

  this.connectionPromise = new Promise((resolve, reject) => {
    this.webSocketClient = new WebSocketClient(`ws://${address}:${port}`)
    this.webSocketClient.emitter.once('message', (greetingEncoding) => {
      this.isConnected = true
      this.greetingPojo = greetingTemplate.decode(greetingEncoding)
      resolve(this)
    })
  })
})

GatewayConnection.prototype.onceConnected = defunction([], '=>GatewayConnection', function onceConnected() {
  return new Promise((resolve, reject) => {
    if (this.isConnected) {
      return resolve(this)
    }
    if (this.connectionPromise) {
      return this.connectionPromise.then(resolve)
    }
  })
})

GatewayConnection.prototype.send = defunction(['Uint8Array'], '=>Uint8Array', function send(message) {
  return new Promise((resolve, reject) => {
    return this.onceConnected().then(() => {
      this.webSocketClient.emitter.once('message', (message) => {
        resolve(message)
      })
      this.webSocketClient.send(message)
    })
  })
})
