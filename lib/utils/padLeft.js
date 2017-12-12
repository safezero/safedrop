const defunction = require('defunction')

module.exports = defunction(['Uint8Array', 'number'], 'Uint8Array', function padLeft(uint8Array, length) {
  const paddedUint8Array = new Uint8Array(length)
  paddedUint8Array.fill(0)
  paddedUint8Array.set(uint8Array, length - uint8Array.length)
  return paddedUint8Array
})
