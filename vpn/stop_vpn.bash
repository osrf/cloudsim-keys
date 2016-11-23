#!/bin/bash
#################################
# Set up Ethernet bridge on Linux
# Requires: bridge-utils
#################################

USAGE=$'stop_vpn_server_with_bridge.bash <name>\nFor example:\n  sudo ./stop_vpn_server_with_bridge.bash blue'

if (( $# != 1)); then
  echo "$USAGE"
  exit 1
fi

# Define physical ethernet interface to be bridged
# with TAP interface(s) above.
name=$1
eth="eth-$name"

if [[ -f /tmp/openvpn-$name.pid ]]; then
  kill `cat /tmp/openvpn-$name.pid` 
fi

####################################
# Tear Down Ethernet bridge on Linux
####################################

# Define Bridge Interface
br="br-$name"

# Define list of TAP interfaces to be bridged together
tap="tap-$name"

ifconfig $br down
brctl delbr $br

for t in $tap; do
  openvpn --rmtun --dev $t
done

# Delete the dummy ethernet interface
ip link delete $eth type dummy
