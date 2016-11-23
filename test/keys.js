'use strict'

const supertest = require('supertest');
const app = require('../server/cloudsim_keys')


describe('<Unit Test>', function() {

  before(function(done) {
    // create superagent
    agent = supertest.agent(app)
    done()
  })

  describe('Keys:', function(){
    done()
  })

  after(function(done) {
    done()
  })
})
