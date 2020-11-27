// 1.  모듈추가
const express = require('express');
var bodyParser = require('body-parser');

const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
// 2.  패브릭 속성설정
const ccpPath = path.resolve(__dirname, '..', 'network' ,'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

// 3.  웹서버 설정
const app = express();
const PORT = 8080;
const HOST = '0.0.0.0';

app.use(express.static(path.join(__dirname, 'views')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// 4.  웹페이지 라우팅
// 4.1 / GET
app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/index.html');
})
// 4.2 /create.html GET
// 4.3 /query.html GET

// 5.  REST API 라우팅
// 5.1 /asset POST 
app.post('/asset', async(req, res)=>{
    // 클라이언트에서 파라미터 받는부분
    const key = req.body.key;
    const value = req.body.value;

    // user1 인증서 가져오기 및 검사
    const walletPath = path.join(process.cwd(), 'wallet');
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }
    // 체인코드 연결
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
    const network = await gateway.getNetwork('mychannel');
    const contract = network.getContract('sacc');
    await contract.submitTransaction('set', key, value);
    console.log('Transaction has been submitted');
    await gateway.disconnect();

    res.status(200).send('Transaction has been submitted');
})

// 5.2 /asset GET
app.get('/asset', async(req, res)=>{
    const key = req.query.key;
    
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
    const contract = network.getContract('sacc');
    const result = await contract.evaluateTransaction('get',key);
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

    // 클라이언트에 JSON문서 형태로 응답
    var obj = JSON.parse(result);
    
    res.status(200).send(obj);
})

// 5.3 /assets GET
app.get('/assets', async(req, res)=>{
    
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
    const contract = network.getContract('sacc');
    const result = await contract.evaluateTransaction('getAllKeys');
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

    // 클라이언트에 JSON문서 형태로 응답
    var obj = JSON.parse(result);
    res.status(200).json(obj);
})

// 5.4 /assethistory GET
app.get('/assethistory', async(req, res)=>{
    const key = req.query.key;
    
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
    const contract = network.getContract('sacc');
    const result = await contract.evaluateTransaction('getHistoryForKey',key);
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

    // 클라이언트에 JSON문서 형태로 응답
    var obj = JSON.parse(result);
    res.status(200).json(obj);
})


// 6.  서버시작
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);