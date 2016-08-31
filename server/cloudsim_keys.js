'use strict'

const express = require('express')
const app = express()
const fs = require('fs')
const pack = require('../package')
const bodyParser = require("body-parser")
const cors = require('cors')
const morgan = require('morgan')
const util = require('util')
const machinetypes = require('./machinetypes')

let httpServer = null
const useHttps = true
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
app.use(morgan('combined'))

const dotenv = require('dotenv')

const spawn = require('child_process').spawn
const csgrant = require('cloudsim-grant')

// the configuration values are set in the local .env file
// this loads the .env content and puts it in the process environment.
dotenv.load()

// the port of the server
const port = process.env.CLOUDSIM_PORT || 4000

const adminUser = process.env.ADMIN_USER || 'admin'
console.log('admin user: ' + process.env.ADMIN_USER)

// we create 2 initial resources
csgrant.init(adminUser, {'vpn_keys': {},
                         'machine_types': {}
                        },
                        'cloudsim-keys',
                        (err)=> {
    if(err)
      console.log('Error loading resources: ' + err)
    else
      console.log('resources loaded')
})
// app.use(express.static(__dirname + '../public'));

app.get('/', function (req, res) {
  // res.sendFile(__dirname + '/../public/index.html')
  const date = new Date()
  let s = `
    <h1>${pack.name}</h1>
    repo: <a href="${pack.repository.url}" >${pack.repository.url}</a>
    <br>version: ${pack.version}
    <br>Server is running: ${date}
`
  res.end(s)
})

// setup the routes
app.get('/permissions',
  csgrant.authenticate,
  csgrant.userResources,
  csgrant.allResources)
app.post('/permissions', csgrant.authenticate, csgrant.grant)
app.delete('/permissions',csgrant.authenticate, csgrant.revoke)
machinetypes.setRoutes(app)

// Expose app
exports = module.exports = app

httpServer.listen(port, function(){
  console.log('ssl: ' + useHttps)
	console.log('listening on *:' + port);
})

