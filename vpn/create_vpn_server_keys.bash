#!/bin/bash

USAGE="create_vpn_server_keys.bash <servername>"

if (( $# != 1)); then
  echo $USAGE
  exit 1
fi

servername=$1

# This is correct for Ubuntu machines
easy_rsa_dir=/usr/share/easy-rsa

key_root_dir=/opt/sasc-vpn
key_dir=$key_root_dir/$servername
mkdir -p $key_dir

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

# Bootstrap PKI
./clean-all
# Create CA
./build-ca --batch
# Create server key
./build-key-server --batch $servername
# Create DH params
./build-dh

echo "Server-side assets are in $key_dir."
