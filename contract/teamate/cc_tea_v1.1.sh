#!/bin/bash

if [ $# -ne 2 ]; then
	echo "Arguments are missing. ex) ./cc_tea.sh instantiate 1.0.0"
	exit 1
fi

instruction=$1
version=$2

set -ev

#chaincode install
docker exec cli peer chaincode install -n teamate -v $version -p github.com/teamate
#chaincode instatiate
docker exec cli peer chaincode $instruction -n teamate -v $version -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
sleep 5
#chaincode invoke user1
docker exec cli peer chaincode invoke -n teamate -C mychannel -c '{"Args":["addUser","user2"]}'
sleep 5
#chaincode query user1
docker exec cli peer chaincode query -n teamate -C mychannel -c '{"Args":["readRating","user2"]}'

#chaincode invoke add rating
docker exec cli peer chaincode invoke -n teamate -C mychannel -c '{"Args":["addRating","user2","p1","5.0"]}'
sleep 5

#chaincode query user1
docker exec cli peer chaincode query -n teamate -C mychannel -c '{"Args":["readRating","user2"]}'

#chaincode query user1
docker exec cli peer chaincode query -n teamate -C mychannel -c '{"Args":["getHistory","user2"]}'

echo '-------------------------------------END-------------------------------------'
