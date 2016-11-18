#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

USAGE="create_vpn_client_bundle.bash <servername> <clientname> <serverip> <serverport>"

if (( $# != 4)); then
  echo $USAGE
  exit 1
fi

servername=$1
clientname=$2
serverip=$3
portnumber=$4
outdir=`pwd`

key_root_dir=/opt/sasc-vpn
key_dir=$key_root_dir/$servername
if [[ ! -d $key_dir ]]; then
  echo "There's no directory $key_dir. Did you first run create_vpn_server_keys.bash?"
  exit 1
fi

tmpdir=`mktemp -d`
sed "s/SERVER_IP/$serverip/" $DIR/client_openvpn_tap.conf | sed "s/PORT/$portnumber/" > $tmpdir/openvpn.conf
cp $key_dir/ca.crt $tmpdir
cp $key_dir/$clientname.crt $tmpdir
cp $key_dir/$clientname.csr $tmpdir
cp $key_dir/$clientname.key $tmpdir

tarbomb=$outdir/client_vpn.tar.gz
rm -f $tarbomb
cd $tmpdir
tar -zcvf $tarbomb *
rm -rf $tmpdir

echo "Your bundle is at $tarbomb."
