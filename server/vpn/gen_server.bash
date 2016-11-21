#!/bin/bash

USAGE="gen_server.bash <servername> <serverport> <dstpath>"

 if (( $# != 3)); then
   echo $USAGE
   exit 1
 fi

SERVER=$1
PORT=$2
DST=$3

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

SCRIPT_DIR=$DIR/../../vpn

TMP_DIR=`mktemp -d` && cd $TMP_DIR

# gen key in /opt/sasc-vpn/
sudo $SCRIPT_DIR/create_vpn_server_keys.bash $SERVER

# create bundle
sudo $SCRIPT_DIR/create_vpn_server_bundle.bash $SERVER $PORT

# move keys
SRC="$TMP_DIR/server_vpn.tar.gz"

if [ -f $SRC ]
then
  # create dst path if doesn't exist
  mkdir -p $(dirname "$DST")
  echo "Moving keys to $DST"

  # move generated server key bundle to dst path
  mv $SRC $DST
else
  echo "DIR $SRC does not exist."
fi
