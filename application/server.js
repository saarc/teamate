// 모듈추가
const express = require('express');
const app = express();
var bodyParser = require('body-parser');
// 하이퍼레저 모듈추가+연결속성파일로드
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', 'network' ,'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
// 서버속성
const PORT = 8080;
const HOST = '0.0.0.0';
// app.use
app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// 라우팅
// 1. 페이지라우팅
app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/index.html');
})
app.get('/create', (req, res)=>{
    res.sendFile(__dirname + '/create.html');
})
app.get('/modify', (req, res)=>{
    res.sendFile(__dirname + '/modify.html');
})
app.get('/query', (req, res)=>{
    res.sendFile(__dirname + '/query.html');
})
// 2. REST라우팅
app.post('/user', async(req, res)=>{
    const name = req.body.name;

    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('teamate');
    await contract.submitTransaction('addUser', name);
    console.log('Transaction has been submitted');
    await gateway.disconnect();

    res.status(200).send('Transaction has been submitted');

})
app.post('/project', async(req, res)=>{
    const name = req.body.name;
    const project = req.body.project;
    const score = req.body.score;

})
app.get('/user', async(req, res)=>{
    const name = req.query.name;
    
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);
    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('teamate');
    const result = await contract.evaluateTransaction('readRating',name);
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

    var obj = JSON.parse(result);
    res.status(200).json(obj);
    
})
// 서버시작
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);