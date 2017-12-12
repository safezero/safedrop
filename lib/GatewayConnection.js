const defunction = require('defunction')
const gatewayTemplate = require('./templates/gateway')
const WebSocket = require('ws')
const intcoder = require('intcoder')
const greetingTemplate = require('./templates/greeting')

// TODO: # defunction
const GatewayConnection = module.exports = defunction(['Gateway'], '*', function GatewayConnection(gateway) {
  this.gateway = gateway
  this.isConnected = false

  const address = this.gateway.pojo.value.address.join('.')
  const port = intcoder.decode(this.gateway.pojo.value.port)

  this.connectionPromise = new Promise((resolve, reject) => {
    this.webSocket = new WebSocket(`ws://${address}:${port}`)
    this.webSocket.once('message', (greetingEncodingBuffer) => {
      this.greetingPojo = greetingTemplate.decode(new Uint8Array(greetingEncodingBuffer))
      resolve(this)
    })
    this.webSocket.once('open', () => {
      this.isConnected = true
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

GatewayConnection.prototype.send = defunction(['Uint8Array'], '=>Uint8Array', function send(uint8Array) {
  return new Promise((resolve, reject) => {
    return this.onceConnected().then(() => {
      this.webSocket.once('message', (message) => {
        resolve(new Uint8Array(message))
      })
      this.webSocket.send(uint8Array)
    })
  })
})
