#!/bin/bash

if [ $# -ne 2 ]; then
	echo "Arguments are missing. ex) ./cc_kick.sh instantiate 1.0.0"
	exit 1
fi

instruction=$1
version=$2

set -ev

#chaincode install
docker exec cli peer chaincode install -n kick -v $version -p github.com/kick
#chaincode instatiate
docker exec cli peer chaincode $instruction -n kick -v $version -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
sleep 5
#chaincode invoke user1
docker exec cli peer chaincode invoke -n kick -C mychannel -c '{"Args":["enroll","dev1", "{maker:xiaomy, model:ninebot}"]}'
sleep 5
#chaincode query user1
docker exec cli peer chaincode query -n kick -C mychannel -c '{"Args":["query","dev1"]}'

#chaincode invoke add rating
docker exec cli peer chaincode invoke -n kick -C mychannel -c '{"Args":["rent","dev1","uid1"]}'
sleep 5

#chaincode query user1
docker exec cli peer chaincode query -n kick -C mychannel -c '{"Args":["queryHistory","dev1"]}'

echo '-------------------------------------END-------------------------------------'
