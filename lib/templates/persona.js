const DictionaryTemplate = require('hendricks/lib/Dictionary')
const FixedTemplate = require('hendricks/lib/Fixed')
const DynamicTemplate = require('hendricks/lib/Dynamic')
const SplitTemplate = require('hendricks/lib/Split')
const gatewayTemplate = require('./gateway')

module.exports = new SplitTemplate('persona', 1, ['v0'], [
  new DictionaryTemplate('persona.v0', [
    new FixedTemplate('identityPublicKey', 33),
    gatewayTemplate
  ])
])
