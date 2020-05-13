# teamate

# hyperledger fabric sample 

## pre-condition
* curl, docker, docker-compose, go, nodejs, python 
* hyperledger fabric-docker images are installed
* GOPATH are configured
* hyperledger bineries are installed (cryptogen, configtxgen ... etcs)

# -network
## 1. generating crypto-config directory, genesis.block, channel and anchor peer transactions
cd network

./generate.sh

## 2. starting the network, create channel and join 
./start.sh

# -chaincode
## 3. chaincode install, instsantiate and test(invoke, query, invoke)
./cc_tea.sh instantiate v1.0

# -prototype
cd ../prototype

## 4. nodejs module install
npm install

## 5. certification works
node enrollAdmin.js

node registerUser.js

## 6. server start
node server.js

## 7. open web browser and connect to localhost:8080


