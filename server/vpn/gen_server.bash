#!/bin/bash

# $1 is server name, $2 is vpn port
SERVER=$1
PORT=$2

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

SCRIPT_DIR=$DIR/../../vpn
KEYS_DIR=$DIR/../../keys/sasc

TMP_DIR=`mktemp -d` && cd $TMP_DIR

# gen key in /opt/sasc-vpn/
sudo $SCRIPT_DIR/create_vpn_server_keys.bash $SERVER

# create bundle
sudo $SCRIPT_DIR/create_vpn_server_bundle.bash $SERVER $PORT

# move keys
SRC="$TMP_DIR/server_vpn.tar.gz"
DST="$KEYS_DIR/$SERVER/server_vpn.tar.gz"

if [ -f $SRC ]
then
  # create dst path if doesn't exist

  mkdir -p $(dirname "$DST")
  echo "Copying keys to $DST"

  # copy generated server key bundle to dst path
  # rm -fr $DST
  mv $SRC $DST
else
  echo "DIR $SRC does not exist."
fi
