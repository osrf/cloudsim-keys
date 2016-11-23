# Cloudsim keys [ ![Codeship Status for osrf/cloudsim-keys](https://codeship.com/projects/915a1070-0a4d-0134-bce0-06f29080c625/status)](https://codeship.com/projects/155557)

This is the cryptographic keys server for Cloudsim

## What is this repository for? ##

* A web app that distributes keys to authorized servers

## More information ##

See the Cloudsim portal

* [Cloudsim portal](https://bitbucket.org/osrf/cloudsim/wiki/Home)

## Configuration ##

The .env file (not under source code management) should contain:

CLOUDSIM_AUTH_PUB_KEY="-----BEGIN PUBLIC KEY-----\nx  ... QU=\n-----END PUBLIC KEY-----"
ADMIN_USER="admin"

## start the server ##

npm start
