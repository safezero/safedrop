const Promise = require('bluebird')
const defunction = require('defunction')
const levelErrors = require('level-errors')
const getListIndexKey = require('./utils/getListIndexKey')
const level = require('level')
const _ = require('lodash')
const intcoder = require('intcoder')
const waterfall = require('./utils/waterfall')

const LevelWrapper = module.exports = defunction(['string'], 'undefined', function LevelWrapper(path) {
  this.level = Promise.promisifyAll(new level(path))
})

LevelWrapper.prototype.get = defunction(['Uint8Array'], '=>Uint8Array', function get(key) {
  return this.level.getAsync(key, {
    valueEncoding: 'binary'
  }).then((buffer) => {
    return new Uint8Array(buffer)
  })
})

LevelWrapper.prototype.del = defunction(['Uint8Array'], 'Promise', function del(key) {
  return this.level.delAsync(key, {
    valueEncoding: 'binary'
  })
})

LevelWrapper.prototype.set = defunction(['Uint8Array', 'Uint8Array'], 'Promise', function set(key, value) {
  return this.level.putAsync(key, value, {
    valueEncoding: 'binary'
  })
})

LevelWrapper.prototype.addToList = defunction(['Uint8Array', 'Uint8Array'], '=>Uint8Array', function addToList(key, value) {
  return this.getListLength(key).then((listLength) => {
    const nextIndexKey = getListIndexKey(key, listLength)
    return this.set(nextIndexKey, value).then(() => {
      return this.set(key, intcoder.encode(listLength + 1)).then(() => {
        return nextIndexKey
      })
    })
  })
})

LevelWrapper.prototype.getInt = defunction(['Uint8Array'], '=>number', function getInt(key) {
  return this.get(key).then((uint8Array) => {
    return intcoder.decode(uint8Array)
  }).catch((error) => {
    if (error instanceof levelErrors.NotFoundError) {
      return 0
    }
    throw error
  })
})

LevelWrapper.prototype.getListLength = defunction(['Uint8Array'], '=>Number', function getListLength(key) {
  return this.getInt(key)
})

LevelWrapper.prototype.getLastFromList = defunction(['Uint8Array'], '=>Uint8Array', function getLastFromList(key) {
  return this.getListLength(key).then((listLength) => {
    return this.getListAt(key, listLength - 1)
  })
})

LevelWrapper.prototype.getList = defunction(['Uint8Array'], '=>[]Uint8Array', function getList(key) {
  return this.getListLength(key).then((listLength) => {
    const values = []

    let index = 0
    let getListAtWrappers = []

    while (index < listLength) {
      const thisIndex = index // must save pointer before it gets overwritten
      getListAtWrappers.push(() => {
        return this.getListAt(key, thisIndex).then((value) => {
          values.push(value)
        })
      })
      index = index + 1
    }
    return waterfall(getListAtWrappers).then(() => {
      return values
    })
  })
})

LevelWrapper.prototype.getListAt = defunction(['Uint8Array', 'number'], '=>Uint8Array', function getListAt(key, index) {
  const indexKey = getListIndexKey(key, index)
  return this.get(indexKey)
})
