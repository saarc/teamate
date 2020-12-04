#!/bin/bash

if [ $# -ne 2 ]; then
	echo "Arguments are missing. ex) ./cc_ttucp.sh instantiate 1.0.0"
	exit 1
fi

instruction=$1
version=$2

set -ev

#chaincode install
docker exec cli peer chaincode install -n ttucp -v $version -p github.com/ttucp
#chaincode instatiate
docker exec cli peer chaincode $instruction -n ttucp -v $version -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
sleep 3
#chaincode invoke user1
docker exec cli peer chaincode invoke -n ttucp -C mychannel -c '{"Args":["registerCar","car1", "{maker:bmw, model:m3}","ckh"]}'
sleep 3
docker exec cli peer chaincode invoke -n ttucp -C mychannel -c '{"Args":["registerCarTrade","car1"]}'
sleep 3
docker exec cli peer chaincode invoke -n ttucp -C mychannel -c '{"Args":["requestCarTrade","car1", "sky"]}'
sleep 3
docker exec cli peer chaincode invoke -n ttucp -C mychannel -c '{"Args":["completeCarTrade","car1", "sky"]}'
sleep 3
#chaincode query user1
docker exec cli peer chaincode query -n ttucp -C mychannel -c '{"Args":["queryCarTrade","car1"]}'
#chaincode query user1
docker exec cli peer chaincode query -n ttucp -C mychannel -c '{"Args":["queryCarHistory","car1"]}'

echo '-------------------------------------END-------------------------------------'
