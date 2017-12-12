const SplitTemplate = require('hendricks/lib/Split')
const DictionaryTemplate = require('hendricks/lib/Dictionary')
const FixedTemplate = require('hendricks/lib/Fixed')
const DynamicTemplate = require('hendricks/lib/Dynamic')
const ListTemplate = require('hendricks/lib/List')
const OptionalTemplate = require('hendricks/lib/Optional')

module.exports = new SplitTemplate('greeting', 1, ['v0'],
  [
    new DictionaryTemplate('greeting.v0', [
      new FixedTemplate('antireplayNonce', 32),
      new FixedTemplate('difficulty', 1)
    ])
  ]
)
