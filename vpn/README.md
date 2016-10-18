
# SRC and vpn

Used to generate the vpn keys for simulation server and "ocu" (onboard) computer, from
your machine (field computer).

The server where the keys are generated id the "keygen" computer.

These script generate tunneling (tun device) OpenVpn configurations that support multiple clients
per server. The script make file bundles for the server and the clients installs, and contain
routing and ip configuration instructions.

## keygen server machine setup

install.bash has instructions to setup the packages on the keygen computer
download and install cloudsimk and nodejs.


keys files are zipped in tar files and sent to simulation computers and ocu computers.

# Generate keys on the Keygen computer

## install.bash ##

install.bash has instructions to setup the packages on the keygen computer
setup.bash must be sourced to generate the keys.

You can install easy_rsa in any directory. By default, this document assumes
~/src_vpn_keys

## setup.bash ##

Once installed, you should use the setup.bash script to configure the machine.

You must point the EASY_RSA
variable (line 20) to the directory of your easy-rsa program. The default
is ../src_vpn_keys.

# generate server keys #

For server key names, use src-01, src-02 ... src-xx.

Each server needs multiple files: ca cert, server key, dh, etc... Those are
generated in the EASY_RSA keys directory. Some are shared between the client and the server.

From the src_vpnkeys (your easy_rsa install):
./build-ca --batch
./build-key-server --batch $server_name
./build-key --batch scr-01
./build-dh

cd $keys_directory (the keys directory inside the easy_rsa install)
openvpn --genkey --secret ta.key

# generate client keys #

For client key names (you can generate multiple keys per server), use  names like src-01-01, src-01-02 (add -xx to
the server number). Concurrent connections of clients with different keys are supported.

./build-key $client_name

## Generate openvpn configs for the simulation server ##

use server.bash to generate a server_vpn.tar.gz file that contains openvpn files for the simulation server.
You must pass in the server key name.

`server.bash src-01`

The template for the server configuration is server_openvpn.conf

The server_vpn.tar.gz file must be sent to the aws simulation server, in the following location:
/home/ubuntu/code/aws/server_vpn.tar.gz

This is done with the push_server_key.bash (with the aws private key, remote ip and keys tar file)

ex: push_server_key.bash ~/.ssh/id_rsa 54.32.32.34 server_vpn.tar.gz

## Generate the openvpn bundle for the client ##

User client.bash to generate a openvpn-client.tar.gz file that contains the /etc/openvpn files for the client.
You must pass in the name of the client (the key must exist) and the ip of the server (which you have to know)

`client.bash src-01-01 72.17.0.1`

The template for the client configuration is client_openvpn.conf.


## Run simulation container and field computer

on the server, go to
/home/ubuntu/code/src_cloud_simulator/docker

  ./build_all.bash

and to run

  ./run_simulator.bash

  ./run_robot.bash


## Generate key for the OCU and run an OCU in docker

use client.bash to generate an ocu vpn tar file. You must specify the client key name and
the ip address of the server.

  client.bash src-01-01 54.32.32.34

the resulting openvpn.tar.gz file can be placed in the docker location:
  cd ../docker
  mv ../vpn/openvpn.tar.gz ../docker/ocu/openvpn.tar.gz

And a container can be created with:
  cd ./build_ocu.bash

TODO: build different ocu for each server.

The ocu can be run with:

  ./run_ocu.bash


## Log in the field computer from the ocu

Start OpenVpn. You should be able to ping the OCU from your field computer.

