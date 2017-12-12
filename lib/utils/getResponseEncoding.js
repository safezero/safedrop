const defunction = require('defunction')
const responseTemplate = require('../templates/response')

module.exports = defunction(['Uint8Array', 'number', '*'], 'Uint8Array', function getResponseEncoding(nonce, code, _valueEncoding) {
  const valueEncoding = _valueEncoding || new Uint8Array(0)
  return responseTemplate.encode({
    branch: 'v0',
    value: {
      nonce,
      code: new Uint8Array([code]),
      valueEncoding
    }
  })
})
