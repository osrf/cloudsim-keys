#!/bin/bash

USAGE="gen_client.bash <servername> <clientname> <serverip> <serverport> <dstpath>"

 if (( $# != 5)); then
   echo $USAGE
   exit 1
 fi

SERVER=$1
CLIENT=$2
SERVER_IP=$3
PORT=$4
DST=$5

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

SCRIPT_DIR=$DIR/../../vpn

TMP_DIR=`mktemp -d` && cd $TMP_DIR

# gen key in /opt/sasc-vpn/
$SCRIPT_DIR/create_vpn_client_keys.bash $SERVER $CLIENT

# create bundle
$SCRIPT_DIR/create_vpn_client_bundle.bash $SERVER $CLIENT $SERVER_IP $PORT

# move keys
SRC="$TMP_DIR/client_vpn.tar.gz"

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
