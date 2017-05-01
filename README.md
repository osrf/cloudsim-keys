# Cloudsim keys [ ![Codeship Status for osrf/cloudsim-keys](https://codeship.com/projects/196a88f0-52b2-0134-2889-02adab5d782c/status?branch=production)](https://codeship.com/projects/171619)

This is the cryptographic keys server for [Cloudsim](https://bitbucket.org/osrf/cloudsim)

## What is this repository for? ##

* A web app that distributes keys to authorized servers

## More information ##

See the Cloudsim keys in the wiki

* [Cloudsim wiki](https://bitbucket.org/osrf/cloudsim/wiki/Home)

## Configuration ##

The .env file (not under source code management) should contain:

CLOUDSIM_AUTH_PUB_KEY="-----BEGIN PUBLIC KEY-----\nx  ... QU=\n-----END PUBLIC KEY-----"
ADMIN_USER="admin"

## start the server ##

npm start
