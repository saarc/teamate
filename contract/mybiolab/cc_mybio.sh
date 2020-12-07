#!/bin/bash

if [ $# -ne 2 ]; then
	echo "Arguments are missing. ex) ./cc_tea.sh instantiate 1.0.0"
	exit 1
fi

instruction=$1
version=$2

set -ev

#chaincode install
docker exec cli peer chaincode install -n mybiolab -v $version -p github.com/mybiolab
#chaincode instatiate
docker exec cli peer chaincode $instruction -n mybiolab -v $version -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
sleep 3
#chaincode invoke user1
docker exec cli peer chaincode invoke -n mybiolab -C mychannel -c '{"Args":["addProject","project1"]}'
sleep 3
#chaincode invoke add rating
docker exec cli peer chaincode invoke -n mybiolab -C mychannel -c '{"Args":["addMenu","project1","Kimchi"]}'
#chaincode query user1
docker exec cli peer chaincode query -n mybiolab -C mychannel -c '{"Args":["readProject","project1"]}'

docker exec cli peer chaincode query -n mybiolab -C mychannel -c '{"Args":["readTxHistory","project1"]}'


sleep 3

echo '-------------------------------------END-------------------------------------'
