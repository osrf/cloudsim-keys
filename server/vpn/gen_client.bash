#!/bin/bash

# $1 is server name, $2 is vpn port
SERVER=$1
CLIENT=$2
SERVER_IP=$3
PORT=$4

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

SCRIPT_DIR=$DIR/../../vpn
KEYS_DIR=$DIR/../../keys/sasc

TMP_DIR=`mktemp -d` && cd $TMP_DIR

# gen key in /opt/sasc-vpn/
sudo $SCRIPT_DIR/create_vpn_client_keys.bash $SERVER $CLIENT

# create bundle
sudo $SCRIPT_DIR/create_vpn_client_bundle.bash $SERVER $CLIENT $SERVER_IP $PORT

# move keys
SRC="$TMP_DIR/client_vpn.tar.gz"
DST="$KEYS_DIR/$SERVER/$CLIENT/client_vpn.tar.gz"

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
