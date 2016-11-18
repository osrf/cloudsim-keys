#!/bin/bash
#################################
# Set up Ethernet bridge on Linux
# Requires: bridge-utils
#################################

USAGE=$'start_vpn_server_with_bridge.bash <name> <subnet> <configfile>\nFor example:\n  sudo ./start_vpn_server_with_bridge.bash team-blue 192.168.2 server.conf'

if (( $# != 3)); then
  echo "$USAGE"
  exit 1
fi

# Define physical ethernet interface to be bridged
# with TAP interface(s) above.
name=$1
subnet=$2
conffile=$3
eth="eth-$name"

# Create a dummy ethernet interface that we'll use for bridging
modprobe dummy
ip link add $eth type dummy

# Define Bridge Interface
br="br-$name"

# Define list of TAP interfaces to be bridged,
# for example tap="tap0 tap1 tap2".
tap="tap-$name"

eth_ip="${subnet}.1"
eth_netmask="255.255.255.0"
eth_broadcast="${subnet}.255"

for t in $tap; do
    openvpn --mktun --dev $t
done

brctl addbr $br
echo "brctl addif $br $eth"
brctl addif $br $eth

for t in $tap; do
    echo "brctl addif $br $t"
    brctl addif $br $t
done

for t in $tap; do
    ifconfig $t 0.0.0.0 promisc up
done

ifconfig $eth 0.0.0.0 promisc up

ifconfig $br $eth_ip netmask $eth_netmask broadcast $eth_broadcast

openvpn --config $conffile --dev $tap --server-bridge ${subnet}.1 255.255.255.0 ${subnet}.150 ${subnet}.200 --writepid /tmp/openvpn-$name.pid --daemon
