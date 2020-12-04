#!/bin/bash

if [ $# -ne 2 ]; then
	echo "Arguments are missing. ex) ./cc_like.sh instantiate 1.0.0"
	exit 1
fi

instruction=$1
version=$2

set -ev

#chaincode install
docker exec cli peer chaincode install -n like2stamp -v $version -p github.com/like2stamp
#chaincode instatiate
docker exec cli peer chaincode $instruction -n like2stamp -v $version -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
sleep 3
#chaincode invoke user1
docker exec cli peer chaincode invoke -n like2stamp -C mychannel -c '{"Args":["addVisitor","user1"]}'
sleep 3
#chaincode query user1
docker exec cli peer chaincode invoke -n like2stamp -C mychannel -c '{"Args":["addPlace","user1", "namwon"]}'
sleep 3
#chaincode invoke add rating
docker exec cli peer chaincode query -n like2stamp -C mychannel -c '{"Args":["queryVisitor","user1"]}'
docker exec cli peer chaincode query -n like2stamp -C mychannel -c '{"Args":["queryHistoryForKey","user1"]}'

echo '-------------------------------------END-------------------------------------'
