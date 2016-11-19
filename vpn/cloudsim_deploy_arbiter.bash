#!/bin/bash

# To be executed after the machine is created. It can read from cloudsim-options.json.

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Helper to parse options from cloudsim-options.json 
get_option(){
  echo `node -pe "var f = \"$1\"; var query = \"$2\"; var j=require(f); j[query] "`
}

# This file is created by cloudsim when the machine is launched
optionsfile=$DIR/cloudsim-options.json

# Get options
blue_route=`get_option $optionsfile blue_route`
gold_route=`get_option $optionsfile gold_route`
blue_subnet=`get_option $optionsfile blue_subnet`
gold_subnet=`get_option $optionsfile gold_subnet`
token=`get_option $optionsfile token`

# Fetch bundles
mkdir -p $DIR/blue $DIR/gold
curl -X GET --header 'Accept: application/json' --header "authorization: $token" $blue_route > $DIR/blue/bundle.tgz
curl -X GET --header 'Accept: application/json' --header "authorization: $token" $gold_route > $DIR/gold/bundle.tgz

# Unpack bundles
cd $DIR/blue
tar xf bundle.tgz
cd $DIR/gold
tar xf bundle.tgz

# Start servers
cd $DIR/blue
$DIR/blue/start_vpn.bash blue $blue_subnet openvpn.conf
cd $DIR/gold
$DIR/gold/start_vpn.bash blue $gold_subnet openvpn.conf