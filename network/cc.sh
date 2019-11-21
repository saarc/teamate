#chaincode insall
docker exec cli peer chaincode install -n sacc -v 1.0 -p github.com/sacc
#chaincode instatiate
docker exec cli peer chaincode instantiate -n sacc -v 1.0 -C mychannel -c '{"Args":["a","100"]}' -P 'OR ("Org1MSP.member", "Org2MSP.member","Org3MSP.member")'
sleep 5
#chaincode query a
docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args":["get","a"]}'
#chaincode invoke b
docker exec cli peer chaincode invoke -n sacc -C mychannel -c '{"Args":["set","b","200"]}'
sleep 5
#chaincode query b
docker exec cli peer chaincode query -n sacc -C mychannel -c '{"Args":["get","b"]}'

echo '-------------------------------------END-------------------------------------'
