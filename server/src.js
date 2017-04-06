'use strict'
const csgrant = require('cloudsim-grant')
const fs = require('fs')
const exec = require('child_process').exec
const spawn = require('child_process').spawn

const VPN_KEYS_DIR = process.env.CLOUDSIM_KEYS_DIR ||
    __dirname + "/../keys/src"

// Sets the routes for downloading the keys
// app: the express app
// keysFilePath: the full path to the keys.zip file
function setRoutes(app) {

  // create vpn key resource
  app.post('/tap/src/key',
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
      const serverPort = req.body.port
      const grantee = req.body.user

      console.log('name: ' + keyName)
      console.log('port: ' + serverPort)
      console.log('user: ' + user)
      console.log('grantee: ' + grantee)

      if (!keyName || keyName.length === 0) {
        res.jsonp(error('Invalid key: ' + keyName))
        return
      }

      const resourceData = {name: keyName, port: serverPort}

      csgrant.createResourceWithType(user, 'vpn', resourceData,
        (err, data, resourceName) => {

          if (err) {
            res.jsonp(error(err))
            return
          }

          // set up key path
          const fileName = 'server_vpn.tar.gz'
          const basePath = VPN_KEYS_DIR +'/' + resourceName
          const pathToServerKeysFile = basePath + '/' + fileName
          console.log('pathToServerKeysFile ' + pathToServerKeysFile);

          // spawn process to gen server keys
          const gen = spawn('bash',
            [__dirname + '/vpn/gen_server.bash',
              data.data.name,
              data.data.port,
              pathToServerKeysFile
            ])

          gen.on('close', (code) => {
            console.log(`child process exited with code ${code}`)
          });

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

          // if grantee has write access already, don't downgrade to read access
          csgrant.isAuthorized(grantee, resourceName, false,
            (authErr, authorized) => {
              if (authErr) {
                res.jsonp(error(authErr))
                return
              }
              let readOnly = !authorized

              // grant the permission
              csgrant.grantPermission(user, grantee, resourceName, readOnly,
                (grantErr, result) => {
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

  app.get('/tap/src/server/:resourceId',
    // user must have valid token (in req.query)
    csgrant.authenticate,
    // user must have write access to ':resourceId' resource
    // this middleware will set req.resourceData
    csgrant.ownsResource(':resourceId', false),
    // this middleware sets the file download information from
    // the resource in req.resourceData
    function(req,res, next) {

      // set up key path
      const fileName = 'server_vpn.tar.gz'
      const basePath = VPN_KEYS_DIR +'/' + req.resourceData.name
      const pathToServerKeysFile = basePath + '/' + fileName
      console.log('pathToServerKeysFile ' + pathToServerKeysFile);

      if (!fs.existsSync(pathToServerKeysFile)) {
        res.status(500).jsonp({success: false, error: 'Key not found'})
        return
      }

      req.fileInfo = {
        path: pathToServerKeysFile,
        type: 'application/gzip',
        name: fileName
      }
      next()
    },
    // with a req.fileInfo in place, this middleware will
    // download the file from the disk
    csgrant.downloadFilePath)

  app.get('/tap/src/client/:resourceId',
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

      if (!serverIp) {
        res.status(500).jsonp({success: false, error: 'Missing server IP'})
        return
      }

      // check if server key exists
      const serverFileName = 'server_vpn.tar.gz'
      const serverBasePath = VPN_KEYS_DIR +'/' + req.resourceData.name
      const pathToServerKeysFile = serverBasePath + '/' + serverFileName
      // serve client keys if already exist
      if (!fs.existsSync(pathToServerKeysFile)) {
        res.status(500).jsonp({success: false, error: 'Server key not ready'})
        return
      }

      // get path to generated client key tar file
      const clientFileName = 'client_vpn.tar.gz'
      const basePath = VPN_KEYS_DIR + '/' + req.resourceData.name
          + '/' + clientId
      const pathToClientKeysFile = basePath + '/' + clientFileName
      console.log('pathToClientKeysFile ' + pathToClientKeysFile)

      const fileInfo = {
        path: pathToClientKeysFile,
        type: 'application/gzip',
        name: clientFileName
      }

      // serve client keys if already exist
      if (fs.existsSync(pathToClientKeysFile)) {
        req.fileInfo = fileInfo
        next()
      }
      else {
        // run script to generate client key and put it in pathToClientKeysFile
        const cmd = 'bash ' + __dirname + '/vpn/gen_client.bash '
            + req.resourceData.data.name + ' ' + clientId + ' ' + serverIp
            + ' ' + req.resourceData.data.port + ' ' + pathToClientKeysFile

        exec(cmd, (error, stdout, stderr) => {
          console.log("stdout: " + stdout + "stderr:" + stderr)

          // verify key exists
          if (!fs.existsSync(pathToClientKeysFile)) {
            res.status(500).jsonp({success: false, error: 'Key not found'})
            return
          }
          req.fileInfo = fileInfo
          next()
        })
      }
    },
    // with a req.fileInfo in place, this middleware will
    // download the file from the disk
    csgrant.downloadFilePath)
}

exports.setRoutes = setRoutes
