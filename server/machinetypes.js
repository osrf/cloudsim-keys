'use strict'

const express = require('express')
const router = express.Router()
const csgrant = require('cloudsim-grant')

function setRoutes(app) {

csgrant.showLog = true

  console.log('MACHINE TYPES setRoutes')

  // list all resources
  app.get('/machinetypes',
    csgrant.authenticate,
    csgrant.ownsResource('machine_types', true),
    csgrant.allResources)

  app.get('/machinetypes/:mt',
    csgrant.authenticate,
    csgrant.ownsResource(':mt', false),
    csgrant.resource)

  // create a new simulation
  app.post('/machinetypes',
           csgrant.authenticate,
           csgrant.ownsResource('machine_types', false),
           function(req, res) {

    console.log('create machine type:')
    console.log('  body:' +  JSON.stringify(req.body))

    const data = req.body
    const resourceData = data

    const op = 'create machine type'
    const error = function(msg) {
      return {operation: op,
              success: false,
              error: msg}
    }

    const user = req.user
    const r = {success: false}
    csgrant.getNextResourceId('mt', (err, resourceName) => {
      if(err) {
        res.jsonp(error(err))
        return
      }
      // step 4. add machine type
      csgrant.createResource(user, resourceName, resourceData,
                            (err, data) => {
        if(err) {
          res.jsonp(error(err))
          return
        }
        // step 5. success!
        const r = { success: true,
                    operation: op,
                    result: data,
                    id: resourceName}
        res.jsonp(r)
      })
    })
  })

  // Update a simulation
  app.put('/machinetypes/:mt',
          csgrant.authenticate,
          csgrant.ownsResource(':mt', true),
          function(req, res) {

    const resourceName = req.mt
    const newData = req.query
    console.log(' Update machine type: ' + resourceName)
    console.log(' new data: ' + JSON.stringify(newData))
    const user = req.user

    const r = {success: false}

    if (!newData.region) {
       return res.jsonp({success: false, error: 'invalid new machine type: missing cmd'})
    }
    if (!newData.auto) {
       return res.jsonp({success: false, error: 'invalid new simulation: missing auto'})
    }

    csgrant.readResource(user, resourceName, function(err, oldData) {
      if(err)
        return res.jsonp({success: false, error: 'error trying to read existing data: ' + err})
      const futureData = oldData.data
      // merge with existing fields of the newData... thus keeping old fields intact
      for (var attrname in newData) { futureData[attrname] = newData[attrname] }
      csgrant.updateResource(user, resourceName, futureData, (err, data) => {
        if(err) {
          return res.jsonp({success: false, error: err})
        }
        r.success = true
        r.result = data
        // success
        res.jsonp(r)
      })
    })
  })

  // Delete a simulation
  app.delete('/machinetypes/:mt',
             csgrant.authenticate,
             csgrant.ownsResource(':mt', false),
             function(req, res) {
    console.log('delete machine type ' + req.mt)
    const resourceName = req.mt
    const r = {success: false}
    const user = req.user  // from previous middleware
    const resource = req.mt // from app.param (see below)
    csgrant.deleteResource(user, resource, (err, data) => {
      if(err) {
        return res.jsonp({success: false, error: err})
      }
      r.success = true
      r.result = data
      // success
      res.jsonp(r)
    })
  })

  // machine type route parameter
  app.param('mt', function( req, res, next, id) {
    req.mt = id
    next()
  })
}

exports.setRoutes = setRoutes
