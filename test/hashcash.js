const hashcash = require('../lib/utils/hashcash')
const crypto = require('crypto')
const _ = require('lodash')
const waterfall = require('promise-waterfall')

describe('hashcash', () => {
  const hash = new Uint8Array(crypto.randomBytes(32))
  let nonce
  it('should solve nonce', () => {
    return hashcash.solveNonce(hash, 8).then((_nonce) => {
      nonce = _nonce
    })
  })
  it('should verify nonce', () => {
    return hashcash.verify(hash, 8, nonce).should.equal(true)
  })
  describe('timers', () => {
    _.range(16).map((difficulty) => {
      it(`difficulty: ${difficulty}`, () => {
        return getAverageTime(hash, difficulty, 10).then((averageTime) => {
          console.log(averageTime)
        })
      })
    })
  })
})

function getSample(hash, difficulty) {
  let startedAt = Date.now()
  return hashcash.solveNonce(hash, difficulty).then(() => {
    endedAt = Date.now()
    return endedAt - startedAt
  })
}

function getSamples(hash, diffuculty, count) {
  const times = []
  return waterfall(_.range(count).map(() => {
    return () => {
      return getSample(hash, diffuculty).then((time) => {
        times.push(time)
      })
    }
  })).then(() => {
    return times
  })
}

function getAverageTime(hash, difficulty, count) {
  return getSamples(hash, difficulty, count).then((times) => {
    return _.sum(times) / count
  })
}
