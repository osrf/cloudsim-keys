'use strict';

console.log('test/machinetypes.js');

const util = require('util');
const should = require('should');
const supertest = require('supertest');
const csgrant = require('cloudsim-grant')
const token = csgrant.token


// current dir: cloudsim_keys/test
const app = require('../server/cloudsim_keys')
const agent = supertest.agent(app)

// we need fresh keys for this test
const keys = csgrant.token.generateKeys()
token.initKeys(keys.public, keys.private)

const adminTokenData = {username:'admin'}
let adminToken

const bobTokenData = {username:'bob'}
let bobToken



describe('<Unit test Machine types>', function() {

  before(function(done) {
    console.log('before before')
    done()
  })

  before(function(done) {
    csgrant.model.clearDb()
    token.signToken(adminTokenData, (e, tok)=>{
      console.log('token signed for user "admin"')
      if(e) {
        console.log('sign error: ' + e)
      }
      adminToken = tok
      token.signToken(bobTokenData, (e, tok)=>{
        console.log('token signed for user "bob"')
        if(e) {
          console.log('sign error: ' + e)
        }
        bobToken = tok
        done()
      })
    })
  })

  describe('Create machine type', function() {
    it('should be possible to create a machine type'), function(done) {
      agent
      .post('/machinetypes')
      .set('Accept', 'application/json')
      .set('authorization', adminToken)
      .send({

       })
      .enf

    }
  })

  // get all resources
  describe('Get all machine types', function() {
    it('should be possible for admin to get all resources', function(done) {
      agent
      .get('/machinetypes')
      .set('Acccept', 'application/json')
      .set('authorization', adminToken)
      .send({})
      .end(function(err,res){
        res.status.should.be.equal(200)
        res.redirect.should.equal(false)
        var response = JSON.parse(res.text)
// console.trace('XXXXX', JSON.stringify(response, null, 2 ))
        response.success.should.equal(true)
        response.requester.should.equal('admin')
        response.result.length.should.equal(0)
//        response.result[0].name.should.equal('')
//        response.result[1].name.should.equal('')
//        response.result[2].name.should.equal('')

        done()
      })
    })
  })

/*
  // get resource
  describe('Get resource', function() {
    it('should not be possible for bob to get sim-1 anymore', function(done) {
      agent
      .get('/simulations/mt-1')
      .set('Acccept', 'application/json')
      .set('authorization', bobToken)
      .send({})
      .end(function(err,res){
        res.status.should.be.equal(401)
        var response = JSON.parse(res.text)
        response.success.should.equal(false)
        should.exist(response.error)
        done()
      })
    })
  })
*/
})
