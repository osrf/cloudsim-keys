#!/bin/bash

USAGE="create_vpn_client_keys.bash <servername> <clientname>"

if (( $# != 2)); then
  echo $USAGE
  exit 1
fi

servername=$1
clientname=$2

# This is correct for Ubuntu machines
easy_rsa_dir=/usr/share/easy-rsa

key_root_dir=/tmp/sasc-vpn
key_dir=$key_root_dir/$servername
if [[ ! -d $key_dir ]]; then
  echo "There's no directory $key_dir. Did you first run create_vpn_server_keys.bash?"
  exit 1
fi

# Source the default configuration
cd $easy_rsa_dir
. $easy_rsa_dir/vars

# Override some defaults
export KEY_DIR=$key_dir
export KEY_COUNTRY="US"
export KEY_PROVINCE="CA"
export KEY_CITY="Mountain View"
export KEY_ORG="OSRF"
export KEY_EMAIL="info@osrfoundation.org"
export KEY_OU="Gazebo"

# Create client key
./build-key --batch $clientname

echo "Server-side assets are in $key_dir."
