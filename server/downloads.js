'use strict'
const csgrant = require('cloudsim-grant')
const fs = require('fs')
var exec = require('child_process').exec

const VPN_KEY_PAIR_COUNT = 2;
let vpnKeyPairIndex = 0;

const VPN_CLIENT_KEY_COUNT = 2;

// Sets the routes for downloading the keys
// app: the express app
// keysFilePath: the full path to the keys.zip file
function setRoutes(app) {

  // create vpn key resource
  app.post('/tap/sasc/key',
    csgrant.authenticate,
    csgrant.ownsResource('vpn_keys', false),
    function (req, res) {

      const error = function(msg) {
        return {operation: op,
          success: false,
          error: msg}
      }

      const op = 'createVpnKey'
      const user = req.user
      const keyName = req.body.name
      const grantee = req.body.user

      console.log('name: ' + keyName)
      console.log('user: ' + user)
      console.log('grantee: ' + grantee)

      if (!keyName || keyName.length === 0) {
        res.jsonp(error('Invalid key: ' + keyName))
        return
      }

      const resourceData = {name: keyName}

      csgrant.getNextResourceId('vpn-' + keyName, (err, resourceName) => {
        if(err) {
          res.jsonp(error(err))
          return
        }
        csgrant.createResource(user, resourceName, resourceData,
          (err, data) => {
            if (err) {
              res.jsonp(error(err))
              return
            }

            // copy pre-generated keys to new path with name=req.body.name
            const keyIndx = vpnKeyPairIndex++ % VPN_KEY_PAIR_COUNT
            const basePath = __dirname + '/vpn/sasc/' + data.data.name
            const cmd = 'bash ' + __dirname + '/vpn/copy_keys.bash ' +
                keyIndx + ' ' + basePath
            exec(cmd, (error, stdout, stderr) => {
              console.log("stdout: " + stdout + "stderr:" + stderr)

              let r = { success: true,
                operation: op,
                result: data,
                id: resourceName,
                requester: req.user
              }

              // share with another user if specified
              if (!grantee || grantee.length === 0) {
                res.jsonp(r)
                return
              }

              csgrant.grantPermission(user, grantee, resourceName, true,
                  (grantErr, result, msg) => {

                if (grantErr) {
                  res.jsonp(error(grantErr))
                  return
                }

                r.success = result
                console.log(r)

                res.jsonp(r)
              })
            })
          })
      })
    })

  app.get('/tap/sasc/server/:resourceId',
    // user must have valid token (in req.query)
    csgrant.authenticate,
    // user must have write access to ':resourceId' resource
    // this middleware will set req.resourceData
    csgrant.ownsResource(':resourceId', false),
    // this middleware sets the file download information from
    // the resource in req.resourceData
    function(req,res, next) {

      // set up key path
      const fileName = 'server.tar.gz'
      const basePath = __dirname + '/vpn/sasc/' + req.resourceData.data.name
      const pathToServerKeysFile = basePath + '/' + fileName
      console.log('pathToServerKeysFile ' + pathToServerKeysFile);

      if (!fs.existsSync(pathToServerKeysFile)) {
        res.status(500).jsonp({success: false, error: 'Key not found'})
        return
      }

      req.fileInfo = { path: pathToServerKeysFile,
                       type: 'application/gzip',
                       name: fileName
                     }
      next()
    },
    // with a req.fileInfo in place, this middleware will
    // download the file from the disk
    csgrant.downloadFilePath)

  app.get('/tap/sasc/client/:resourceId',
    // user must have valid token (in req.query)
    csgrant.authenticate,
    // user must have readOnly access to ':resourceId' resource
    // this middleware will set req.resourceData
    csgrant.ownsResource(':resourceId', true),
    // this middleware sets the file download information from
    // the resource in req.resourceData
    function(req,res, next) {

      const clientId = req.body.id || req.query.id
      const serverIp = req.body.serverIp || req.query.serverIp

      if (!clientId) {
        res.status(500).jsonp({success: false, error: 'Missing client id'})
        return
      }
      else if (clientId >= VPN_CLIENT_KEY_COUNT) {
        res.status(500).jsonp(
            {success: false,
             error: 'Client id exceeds limit of: ' + VPN_CLIENT_KEY_COUNT})
        return
      }

      if (!serverIp) {
        res.status(500).jsonp({success: false, error: 'Missing server IP'})
        return
      }

      const fileName = 'client.tar.gz'
      const basePath = __dirname + '/vpn/sasc/' + req.resourceData.data.name
          + '/clients/' + clientId
      const pathToClientKeysFile = basePath + '/' + fileName
      console.log('pathToClientKeysFile ' + pathToClientKeysFile);

      // run script to update client key conf, compress into tar.gz file,
      const cmd = 'bash ' + __dirname + '/vpn/bundle_client.bash ' + basePath
           + ' ' + serverIp

      exec(cmd, (error, stdout, stderr) => {
        console.log("stdout: " + stdout + "stderr:" + stderr)

        // verify key exists
        if (!fs.existsSync(pathToClientKeysFile)) {
          res.status(500).jsonp({success: false, error: 'Key not found'})
          return
        }
        req.fileInfo = { path: pathToClientKeysFile,
                         type: 'application/gzip',
                         name: fileName
                       }
        next()
      })
    },
    // with a req.fileInfo in place, this middleware will
    // download the file from the disk
    csgrant.downloadFilePath)
}

exports.setRoutes = setRoutes
