const SplitTemplate = require('hendricks/lib/Split')
const DictionaryTemplate = require('hendricks/lib/Dictionary')
const FixedTemplate = require('hendricks/lib/Fixed')
const DynamicTemplate = require('hendricks/lib/Dynamic')
const ListTemplate = require('hendricks/lib/List')
const OptionalTemplate = require('hendricks/lib/Optional')

module.exports = new SplitTemplate('command', 1, [
  'addBlurb',
  'getBlurbs',
], [
  new DictionaryTemplate('addBlurb', [
    new FixedTemplate('identityPublicKey', 33),
    new DynamicTemplate('blurb', 2)
  ]),
  new FixedTemplate('identityPublicKey', 33),
])
