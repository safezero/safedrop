const DictionaryTemplate = require('hendricks/lib/Dictionary')
const FixedTemplate = require('hendricks/lib/Fixed')
const DynamicTemplate = require('hendricks/lib/Dynamic')
const SplitTemplate = require('hendricks/lib/Split')

module.exports = new SplitTemplate('gateway', 1, ['ip4', 'ip6', 'tor'], [
  new DictionaryTemplate('ip4', [
    new FixedTemplate('address', 4),
    new FixedTemplate('port', 2),
  ]),
  new DictionaryTemplate('ip6', [
    new FixedTemplate('address', 16),
    new FixedTemplate('port', 2),
  ]),
  new DictionaryTemplate('tor', [
    new FixedTemplate('address', 16),
    new FixedTemplate('port', 2),
  ])
])
