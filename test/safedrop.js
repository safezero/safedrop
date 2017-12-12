const Keypair = require('../lib/Keypair')
const Server = require('../lib/Server')
const Client = require('../lib/Client')
const intcoder = require('intcoder')
const _ = require('lodash')
const crypto = require('crypto')
const Manilla = require('../lib/Manilla')
const Memory = require('../lib/Memory')
const Persona = require('../lib/Persona')
const Gateway = require('../lib/Gateway')

let users
let server

const drop0 = new Uint8Array([1, 2, 3, 4])
const drop1 = new Uint8Array([5, 6, 7, 8])
const drop2 = new Uint8Array([9])

const plaintext0 = new Uint8Array([10, 11])
const plaintext1 = new Uint8Array([11, 12, 13])

describe('safedrop-protocol', () => {
  it('should generate users', () => {
    users = {
      alice: generateUser(),
      bob: generateUser(),
      charlie: generateUser()
    }
  })
  it('should wait for connections', () => {
    return Promise.all(_.values(users).map((user) => {
      return (user) => {
        return user.client.gateway.getConnection().onceConnected()
      }
    }))
  })
  it('should be connected', () => {
    return Promise.all(_.values(users).map((user) => {
      return () => {
        return user.client.gateway.getConnection().isConnected.should.equal(true)
      }
    }))
  })
  describe('add drop', () => {
    it('alice=>alice', () => {
      return users.alice.client.addDrop(users.alice.persona, drop0)
    })
    it('alice=>bob', () => {
      return users.alice.client.addDrop(users.bob.persona, drop1)
    })
    it('alice=>charlie', () => {
      return users.alice.client.addDrop(users.charlie.persona, drop2)
    })
  })
  describe('getDrops', () => {
    it('alice', () => {
      return users.alice.client.getDrops().then((drops) => {
        drops.length.should.equal(1)
        drops[0].should.deep.equal(drop0)
      })
    })
    it('bob', () => {
      return users.bob.client.getDrops().then((drops) => {
        drops.length.should.equal(1)
        drops[0].should.deep.equal(drop1)
      })
    })
    it('charlie', () => {
      return users.charlie.client.getDrops().then((drops) => {
        drops.length.should.equal(1)
        drops[0].should.deep.equal(drop2)
      })
    })
  })
  describe('addPlaintext', () => {
    it('bob => alice', () => {
      return users.bob.client.addPlaintext(users.alice.persona, plaintext0)
    })
    it('bob => charlie', () => {
      return users.bob.client.addPlaintext(users.charlie.persona, plaintext1)
    })
  })
  describe('getCryptixes', () => {
    it('alice', () => {
      return users.alice.client.getCryptixes().should.eventually.have.length(1)
    })
    it('bob', () => {
      return users.bob.client.getCryptixes().should.eventually.have.length(2)
    })
    it('charlie', () => {
      return users.charlie.client.getCryptixes().should.eventually.have.length(1)
    })
  })
  describe('getCryptixPayloads', () => {
    it('alice', () => {
      return users.alice.client.getCryptixPayloads().then((payloads) => {
        payloads.should.have.length(1)
        payloads[0].should.be.instanceof(Manilla)
      })
    })
    it('bob', () => {
      return users.bob.client.getCryptixPayloads().then((payloads) => {
        payloads.should.have.length(2)
        payloads[0].should.be.instanceof(Memory)
        payloads[1].should.be.instanceof(Memory)
      })
    })
    it('charlie', () => {
      return users.charlie.client.getCryptixPayloads().then((payloads) => {
        payloads.should.have.length(1)
        payloads[0].should.be.instanceof(Manilla)
      })
    })
  })
  describe('getCryptixPayloadPlaintexts', () => {
    it('alice', () => {
      return users.alice.client.getCryptixPayloadPlaintexts().then((plaintexts) => {
        plaintexts.length.should.equal(1)
        plaintexts[0].should.deep.equal(plaintext0)
      })
    })
    it('bob', () => {
      return users.bob.client.getCryptixPayloadPlaintexts().then((plaintexts) => {
        plaintexts.length.should.equal(2)
        plaintexts[0].should.deep.equal(plaintext0)
        plaintexts[1].should.deep.equal(plaintext1)
      })
    })
    it('charlie', () => {
      return users.charlie.client.getCryptixPayloadPlaintexts().then((plaintexts) => {
        plaintexts.length.should.equal(1)
        plaintexts[0].should.deep.equal(plaintext1)
      })
    })
  })
})

let port = 9000
let difficulty = 16

function generateUser() {
  const server = new Server(difficulty)
  server.listen(port)
  const identityKeypair = Keypair.generate()
  const identityPublicKey = identityKeypair.publicKey
  const memoryRootKey = new Uint8Array(crypto.randomBytes(32))
  const gateway = new Gateway({
    branch: 'ip4',
    value: {
      address: new Uint8Array([127, 0, 0, 1]),
      port: intcoder.encode(port)
    }
  })
  const persona = new Persona(identityPublicKey, gateway)
  const client = new Client(identityKeypair, memoryRootKey, gateway)
  return {
    server,
    identityKeypair,
    identityPublicKey,
    gateway,
    persona,
    client
  }

  port ++
  difficulty ++
}

function shouldBeRecent(timestamp) {
  const time = Date.now()
  ;(intcoder.decode(timestamp) * 1000).should.be.within(time - 5000, time)
}
