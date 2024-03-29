#!/bin/bash

if [ $# -ne 2 ]; then
   echo "Arguments are missing. ex) ./cc_cap.sh instantiate 1.0.0"
   exit 1
fi

instruction=$1
version=$2

set -ev

#chaincode install
docker exec cli peer chaincode install -n cap -v $version -p github.com/pet
#chaincode instatiate
docker exec cli peer chaincode $instruction -n cap -v $version -C mychannel -c '{"Args":[]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
sleep 3
#chaincode invoke user1
docker exec cli peer chaincode invoke -n cap -C mychannel -c '{"Args":["addPet","pet1"]}'
sleep 3
#chaincode query user1
docker exec cli peer chaincode invoke -n cap -C mychannel -c '{"Args":["addPetInfo","pet1","owner", "ikjae","junji"]}'
sleep 3

#chaincode invoke add rating
docker exec cli peer chaincode query -n cap -C mychannel -c '{"Args":["readPet","pet1"]}'
sleep 3

#chaincode query user1
docker exec cli peer chaincode query -n cap -C mychannel -c '{"Args":["readTxHistory","pet1"]}'

echo '-------------------------------------END-------------------------------------'
