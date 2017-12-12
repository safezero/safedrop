const defunction = require('defunction')

module.exports = defunction(['[]Uint8Array'], 'Uint8Array', function concat(uint8Arrays) {
  const length = uint8Arrays.reduce((sum, uint8Array) => {
    return sum + uint8Array.length
  }, 0)
  const uint8Array = new Uint8Array(length)
  let offset = 0
  uint8Arrays.forEach((_uint8Array) => {
    uint8Array.set(_uint8Array, offset)
    offset += _uint8Array.length
  })
  return uint8Array
})
