// ExpressJS Setup
const express = require('express');
const app = express();
var bodyParser = require('body-parser');

// Hyperledger Bridge
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..', 'network' ,'connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

// Constants
const PORT = 8800;
const HOST = '0.0.0.0';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// use static file
app.use(express.static(path.join(__dirname, 'public')));

// configure app to use body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


// DB
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://localhost:27017/web_template', { useNewUrlParser: true,  useUnifiedTopology: true  })
var db = mongoose.connection
autoIncrement.initialize(db);

db.on('error', function(){
    console.log('MongoDB connection failed!')
})
db.once('open', function(){
    console.log('MongoDB connection success!')
})


// Passport
var passport = require('passport')
var session = require('express-session')
// flash는 session이 필요하므로 반드시 session 아래에 정의해야 함
var flash = require('connect-flash');
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

// Router
var indexRouter = require('./router/index');
var loginRouter = require('./router/login');
var joinRouter = require('./router/join');
var logoutRouter = require('./router/logout');
var itemsRouter = require('./router/items');
var newRouter = require('./router/new');
var testRouter = require('./router/test');
var mypageRouter = require('./router/mypage');


app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/join', joinRouter);
app.use('/logout', logoutRouter);
app.use('/items', itemsRouter);
app.use('/new', newRouter);
app.use('/test', testRouter);
app.use('/mypage', mypageRouter);

// Qeury all cars page
app.get('/api/query', async function (req, res) {
		// create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('teamate');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
        const result = await contract.evaluateTransaction('readRating','user1');
        // console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        var obj = JSON.parse(result);

        console.log(obj.average);
	    res.status(200).json(obj);
});

app.get('/api/querykey/', function (req, res) {
    fs.readFile('./querykey.html', function (error, data) {
        res.send(data.toString());
    });
});

// Query car handle
// localhost:8080/api/querycar?carno=CAR5
app.get('/api/querykey/:id', async function (req, res) {
                // create the key value store as defined in the fabric-client/config/default.json 'key-value-store' setting
    try {

    var key = req.params.id;
	console.log(key);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('sacc');

        // Evaluate the specified transaction.
        // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
        const result = await contract.evaluateTransaction('get', key);

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        var obj = JSON.parse(result)
        res.status(200).json(obj);

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        res.status(400).json(`{response: ${error}`);
    }
});

// Create car page
app.get('/api/createkey', function (req, res) {
  fs.readFile('./createkey.html', function (error, data) {
              res.send(data.toString());
  });
});
// Create car handle
app.post('/api/createkey/', async function (req, res) {
    try {
	var key = req.body.key;
	var value = req.body.value;


        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }
        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } }); 

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('sacc');

        // Submit the specified transaction.
        // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
        // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR10', 'Dave')
//        await contract.submitTransaction('createCar', 'CAR11', 'Hnda', 'Aord', 'Bla', 'Tom');
        await contract.submitTransaction('set', key, value);
        console.log('Transaction has been submitted');

        // Disconnect from the gateway.
        await gateway.disconnect();

        res.status(200).json({response: 'Transaction has been submitted'});

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        res.status(400).json(error);
    }   

});
// server start
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
