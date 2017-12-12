const ListTemplate = require('hendricks/lib/List')
const DynamicTemplate = require('hendricks/lib/Dynamic')

module.exports = new ListTemplate('items', 1, new DynamicTemplate('item', 2))
