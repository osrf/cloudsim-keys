#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

USAGE="create_vpn_server_bundle.bash <servername> <portnumber>"

if (( $# != 2)); then
  echo $USAGE
  exit 1
fi

servername=$1
portnumber=$2
outdir=`pwd`

key_root_dir=/tmp/sasc-vpn
key_dir=$key_root_dir/$servername
if [[ ! -d $key_dir ]]; then
  echo "There's no directory $key_dir. Did you first run create_vpn_server_keys.bash?"
  exit 1
fi

tmpdir=`mktemp -d`
sed "s/SERVER/$servername/" $DIR/server_openvpn_tap.conf | sed "s/PORT/$portnumber/" > $tmpdir/openvpn.conf
cp $key_dir/ca.crt $tmpdir
cp $key_dir/ca.key $tmpdir
cp $key_dir/dh2048.pem $tmpdir
cp $key_dir/$servername.crt $tmpdir
cp $key_dir/$servername.csr $tmpdir
cp $key_dir/$servername.key $tmpdir
cp $DIR/start_vpn.bash $tmpdir
cp $DIR/stop_vpn.bash $tmpdir
cp -a $DIR/staticclients $tmpdir

rm -f $outdir/server_vpn.tar.gz
cd $tmpdir
tar -zcvf $outdir/server_vpn.tar.gz *
rm -rf $tmpdir

echo "Your bundle is at $outdir/server_vpn.tar.gz" 
