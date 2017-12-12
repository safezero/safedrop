const SplitTemplate = require('hendricks/lib/Split')
const DictionaryTemplate = require('hendricks/lib/Dictionary')
const FixedTemplate = require('hendricks/lib/Fixed')
const DynamicTemplate = require('hendricks/lib/Dynamic')
const OptionalTemplate = require('hendricks/lib/Optional')

module.exports = new SplitTemplate('response', 1, ['v0'], [
  new DictionaryTemplate('response.v0', [
    new FixedTemplate('nonce', 32),
    new FixedTemplate('code', 1),
    new DynamicTemplate('valueEncoding', 2)
  ])
])
