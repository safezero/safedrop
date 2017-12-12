const DictionaryTemplate = require('hendricks/lib/Dictionary')
const FixedTemplate = require('hendricks/lib/Fixed')
const DynamicTemplate = require('hendricks/lib/Dynamic')
const SplitTemplate = require('hendricks/lib/Split')
const memoryTemplate = require('./cryptix')

module.exports = new SplitTemplate('cryptixPayload', 1, ['manilla', 'memory'], [
  new DictionaryTemplate('manilla', [
    new FixedTemplate('identityPublicKey', 33),
    new DynamicTemplate('ciphertext', 2), //TODO: remainder template
    new FixedTemplate('r', 32),
    new FixedTemplate('s', 32)
  ]),
  new DictionaryTemplate('memory', [
    new FixedTemplate('nonce', 32),
    new DynamicTemplate('ciphertext', 2) //TODO: remainder template
  ])
])
