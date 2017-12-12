const defunction = require('defunction')
const WebSocket = require('ws')
const Promise = require('bluebird')
const http = require('http')
const directiveTemplate = require('./templates/directive')
const commandTemplate = require('./templates/command')
const responseTemplate = require('./templates/response')
const itemsTemplate = require('./templates/items')
const greetingTemplate = require('./templates/greeting')
const LevelWrapper = require('./LevelWrapper')
const concat = require('./utils/concat')
const Signature = require('./Signature')
const getResponseEncoding = require('./utils/getResponseEncoding')
const getHash = require('./utils/getHash')
const waterfall = require('./utils/waterfall')
const Keypair = require('./Keypair')
const hashcash = require('./utils/hashcash')
const intcoder = require('intcoder')
const _ = require('lodash')
const padLeft = require('./utils/padLeft')
const crypto = require('crypto')

const Server = module.exports = defunction(['number'], '*', function Server(difficulty) {
  _.merge(this, { difficulty })
  this.antireplayNonce = new Uint8Array(crypto.randomBytes(32))
  this.greetingEncoding = greetingTemplate.encode({
    branch: 'v0',
    value: {
      antireplayNonce: this.antireplayNonce,
      difficulty: padLeft(intcoder.encode(this.difficulty), 1)
    }
  })
  this.dropsDb = new LevelWrapper('./db/drops')
})

Server.prototype.listen = defunction(['number'], '=>Server', function listen(port) {
  return new Promise((resolve, reject) => {
    this.port = port
    this.httpServer = http.createServer()
    this.httpServer.listen(port, () => {
      this.webSocketServer = new WebSocket.Server({ server: this.httpServer })
      this.webSocketServer.on('connection', (ws) => {
        ws.send(this.greetingEncoding)
        ws.on('message', (directiveEncodingBuffer) => {

          const directiveEncoding = new Uint8Array(directiveEncodingBuffer)
          const directivePojo = directiveTemplate.decode(directiveEncoding)
          // TODO: spam check
          const prehash = concat([this.antireplayNonce, directivePojo.value.timestamp, directivePojo.value.commandEncoding])
          if (!hashcash.verify(getHash(prehash), this.difficulty, directivePojo.value.nonce)) {
            ws.send(getResponseEncoding(directivePojo.value.nonce, 1, null))
            return
          }
          const commandPojo = commandTemplate.decode(directivePojo.value.commandEncoding)
          switch (commandPojo.branch) {
            case 'addDrop':
              return this.dropsDb.addToList(commandPojo.value.identityPublicKey, commandPojo.value.drop).then(() => {
                ws.send(getResponseEncoding(directivePojo.value.nonce, 0, null))
              })
              break;
            case 'getDrops':
              return this.dropsDb.getList(commandPojo.value).then((drops) => {
                const dropsEncoding = itemsTemplate.encode(drops)
                ws.send(getResponseEncoding(directivePojo.value.nonce, 0, dropsEncoding))
              })
              break;
            default:
              return ws.send(getResponseEncoding(directivePojo.value.nonce, 2, null))
          }
        })
      })
      resolve(this)
    })
  })
})
