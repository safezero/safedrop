const SplitTemplate = require('hendricks/lib/Split')
const DictionaryTemplate = require('hendricks/lib/Dictionary')
const DynamicTemplate = require('hendricks/lib/Dynamic')
const FixedTemplate = require('hendricks/lib/Fixed')

module.exports = new SplitTemplate('directive', 1, ['v0'], [
  new DictionaryTemplate('v0', [
    new FixedTemplate('nonce', 32),
    new FixedTemplate('timestamp', 5),
    new DynamicTemplate('commandEncoding', 2)
  ])
])
