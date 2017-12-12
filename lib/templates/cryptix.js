const DictionaryTemplate = require('hendricks/lib/Dictionary')
const FixedTemplate = require('hendricks/lib/Fixed')
const DynamicTemplate = require('hendricks/lib/Dynamic')
const SplitTemplate = require('hendricks/lib/Split')

module.exports = new SplitTemplate('cryptix', 1, ['v0'], [
  new DictionaryTemplate('cryptix.v0', [
    new FixedTemplate('ephemeralPublicKey', 33),
    new DynamicTemplate('ciphertext', 2) //TODO: remainder template
  ])
])
