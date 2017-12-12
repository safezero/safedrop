const defunction = require('defunction')
const intcoder = require('intcoder')

module.exports = defunction([], 'Uint8Array', function getTime() {
  const timestamp = new Uint8Array(5)
  timestamp.fill(0)
  const timestampUnpadded = intcoder.encode(Math.floor(Date.now() / 1000))
  timestamp.set(timestampUnpadded, 5 - timestampUnpadded.length)
  return timestamp
})
