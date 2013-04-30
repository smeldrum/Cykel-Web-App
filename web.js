var express = require("express");
var crypto = require("crypto");
var app = express(express.logger());
var twilio = require('twilio');
app.use(express.bodyParser());
app.set('title', 'nodeapp');
app.use(express.static(__dirname+'/public'));

var check = require('validator').check,
	sanitize = require('validator').sanitize

var mongoUri = process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL ||
	'mongodb://admin:mingchow@alex.mongohq.com:10085/app15350071';
var mongo = require('mongodb');
var db = mongo.Db.connect(mongoUri, function(error, databaseConnection) {
	db = databaseConnection;
});

var client = new twilio.RestClient('ACfc2a602a223995a398db1ac614833449', 'cd620dabe507d714fd00e7f73fa626f1');

app.configure(function() {
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(function(request, response, next) {
		response.header("Access-Control-Allow-Origin", "*");
		response.header("Access-Control-Allow-Headers", "X-Requested-With");
		next();
	});
	app.use(app.router);
});

app.all('/', function(request, response, next) {
	response.header("Access-Control-Allow-Origin", "*");
	response.header("Access-Control-Allow-Headers", "X-Requested-With");
	next();
});

app.get('/userdata.json', function(request, response) {
	response.set('Content-Type', 'text/json');
	db.collection("users", function(er, collection) {
		collection.find({email: request.query["email"]}).toArray(function(err, results) {
			response.send(results);
		});
	});
});

app.post('/sendtext', function(request, response) {
	var destnum = sanitize(request.body.number).xss();
	var message = sanitize(request.body.message).xss();
	client.sms.messages.create({
		to: destnum,
		from:'+19784963121',
		body: message
	}, function (err, message) {
		if (!err) {
			response.send();
		} else {
			console.log("Error");
		}
	});
});

app.post('/recvtext', function(request, response) {
	if (twilio.validateExpressRequest(request, 'cd620dabe507d714fd00e7f73fa626f1')) {
		var from = sanitize(request.body.From).xss();
		var d = new Date();
		var n = d.toString();
		var twiml = '<?xml version="1.0" encoding="UTF-8" ?>
					 <Response>
					 	<Sms>Received at ' + n + '. Thanks</Sms>
					 </Response>';
		console.log("Text received from " + from + " at " + n);
		response.type('text/xml');
		response.send(twiml);
	} else {
		response.send('Invalid sender');
	}
});

app.post('/adduser.json', function(request, response, next) {
	
	var email = sanitize(request.body.email).xss();
	var password = sanitize(request.body.password).xss();
	var password_confirm = sanitize(request.body.password_confirm).xss();
	
	check(request.body.email, 'Improper email format').is(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/);
	check(request.body.password, 'Password too short').len(8, 128);
	check(request.body.password, 'Passwords do not match').equals(request.body.password_confirm);
	
	var passHash = crypto.createHash('sha1');
	var hashedPassword = passHash.digest('hex');
	
	var d = new Date();
	var n = d.toString();
	
	db.collection("users", function(er, collection) {
		collection.insert( {email: email,
							password: hashedPassword,
							user_joined: n 
							}, function(err, inserted) {
							}); 
	});
	
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});
