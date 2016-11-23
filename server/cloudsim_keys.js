'use strict'

const express = require('express')
const app = express()
const fs = require('fs')
const bodyParser = require("body-parser")
const cors = require('cors')
const morgan = require('morgan')
const sasc = require('./sasc')
const path = require('path')

let httpServer = null
const useHttps = false
if(useHttps) {
  const privateKey  = fs.readFileSync(__dirname + '/key.pem', 'utf8')
  const certificate = fs.readFileSync(__dirname + '/key-cert.pem', 'utf8')
  httpServer = require('https').Server({
    key: privateKey, cert: certificate
  }, app)
}
else {
  httpServer = require('http').Server(app)
}

app.use(cors())
app.use(bodyParser.json())

// prints all requests to the terminal
app.use(morgan('combined', {
  skip: function (req, res) {
    // skip /api stuff
    const isApi = req.originalUrl.startsWith('/api/')
    if (isApi) {
      return true
    }
    return false
  }
}))

const dotenv = require('dotenv')

const csgrant = require('cloudsim-grant')

// the configuration values are set in the local .env file
// this loads the .env content and puts it in the process environment.
dotenv.load()

// the port of the server
const port = process.env.PORT || 4000

process.env.NODE_ENV = process.env.NODE_ENV || 'development'
process.env.CLOUDSIM_KEYS_DB = process.env.CLOUDSIM_KEYS_DB || 'localhost'

const adminUser = process.env.CLOUDSIM_ADMIN || 'admin'
console.log('admin user: ' + adminUser)


/*// setup
// error if files are not there
const pathToServerKeysFile = __dirname + '/server.zip'
const pathToClientKeysFile = __dirname + '/client.zip'
fs.statSync(pathToServerKeysFile)
fs.statSync(pathToClientKeysFile)*/

const dbName = 'cloudsim-keys' + (process.env.NODE_ENV == 'test'? '-test': '')

// create initial resources
csgrant.init(adminUser,
  {'vpn_keys': {}},
  dbName,
  process.env.CLOUDSIM_KEYS_DB,
  httpServer,
  (err)=> {
    if(err)
      console.log('Error loading resources: ' + err)
    else {
      console.log('resources loaded')
      httpServer.listen(port, function(){
        console.log('ssl: ' + useHttps)
        console.log('listening on *:' + port)
      })
    }
  })

function details() {
  const date = new Date()
  const version = require('../package.json').version
  const csgrantVersion = require('cloudsim-grant/package.json').version
  const env = app.get('env')

  const s = `
============================================
date: ${date}
cloudsim-keys version: ${version}
port: ${port}
cloudsim-grant version: ${csgrantVersion}
admin user: ${adminUser}
environment: ${env}
redis database name: ${dbName}
redis database url: ${process.env.CLOUDSIM_KEYS_DB}
============================================
`
  return s
}

console.log(details())

app.use("/api", express.static(path.join(__dirname, '/../api')));

app.get('/', function (req, res) {
  const info = details()
  const s = `
    <html>
    <body>
    <img src="api/images/cloudsim.svg" style="height: 2em"/>
    <h1>Cloudsim-keys server</h1>
    <div>Cloud service is running</div>
    <pre>
    ${info}
    </pre>
    <a href='/api'>API documentation</a>
    </body>
    </html>
  `
  res.end(s)
})

// setup the /permissions routes
csgrant.setPermissionsRoutes(app)

sasc.setRoutes(app)
// Expose app
exports = module.exports = app
