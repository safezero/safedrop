const defunction = require('defunction')
const crypto = require('crypto')
const Promise = require('bluebird')
const Bn = require('bn.js')

const hashcash = module.exports

hashcash.getThreshold = defunction(['number'], 'Uint8Array', function getThreshold(difficulty) {
  const twoBn = new Bn(2)
  const expBn = new Bn(256 - difficulty)
  const thresholdBn = twoBn.pow(expBn).sub(new Bn(1))
  return thresholdBn.toArrayLike(Uint8Array, 'be', 32)
})

hashcash.solveNonce = defunction(['Uint8Array', 'number'], '=>Uint8Array', function solveNonce(hash, difficulty) {
  const hashBuffer = new Buffer(hash)
  const thresholdBuffer = new Buffer(hashcash.getThreshold(difficulty))

  let nonceBuffer
  let noncedHashBuffer
  let solutionBuffer
  do {
    nonceBuffer = crypto.randomBytes(32)
    noncedHashBuffer = Buffer.concat([nonceBuffer, hashBuffer])
    solutionBuffer = crypto.createHmac('sha256', noncedHashBuffer).digest()
  } while(
    Buffer.compare(thresholdBuffer, solutionBuffer) === -1
  )
  return Promise.resolve(new Uint8Array(nonceBuffer))
})

hashcash.verify = defunction(['Uint8Array', 'number', 'Uint8Array'], 'boolean', function verify(hash, difficulty, nonce) {
  const hashBuffer = new Buffer(hash)
  const thresholdBuffer = new Buffer(hashcash.getThreshold(difficulty))
  const nonceBuffer = new Buffer(nonce)
  const noncedHashBuffer = Buffer.concat([nonceBuffer, hashBuffer])
  const solutionBuffer = crypto.createHmac('sha256', noncedHashBuffer).digest()
  return Buffer.compare(thresholdBuffer, solutionBuffer) > -1
})
