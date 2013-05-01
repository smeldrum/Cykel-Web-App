var express = require("express");
var crypto = require("crypto");
var app = express(express.logger());
var twilio = require('twilio');
app.use(express.bodyParser());
app.set('title', 'nodeapp');
app.use(express.static(__dirname+'/public'));

var check = require('validator').check,
	sanitize = require('validator').sanitize
	
var client = new twilio.RestClient('ACfc2a602a223995a398db1ac614833449', 'cd620dabe507d714fd00e7f73fa626f1');

var mongoUri = process.env.MONGOLAB_URI ||
	process.env.MONGOHQ_URL ||
	'mongodb://admin:mingchow@alex.mongohq.com:10085/app15350071';
var mongo = require('mongodb');
var mongoose = require('mongoose');
mongoose.connect('mongodb://admin:mingchow@alex.mongohq.com:10085/app15350071');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function callback(){});

var tripSchema = new mongoose.Schema( {
	   start: Date,
	  finish: Date,
	duration: Number,
	calories: Number
});

var trip = mongoose.model('trip', tripSchema);

var userSchema = new mongoose.Schema({
	    email: String,
	 password: String,
	    phone: String,
	     home: String,
	     work: String,
	   joined: Date,
	intransit: Boolean,
	     trips: []
});


var ObjectID = mongoose.Schema.ObjectID;
var user = mongoose.model('user', userSchema);

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

app.post('/adduser.json', function(request, response, next) {
	var email = sanitize(request.body.email).xss();
	var phone = sanitize(request.body.phone).xss();
	var password = sanitize(request.body.password).xss();
	var password_confirm = sanitize(request.body.password_confirm).xss();
	phone = phone.replace(/[^0-9]/g, '');

	check(email, 'Improper email format').is(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/);
	check(phone, 'Phone number has wrong number of digits').len(10,11);
	check(password, 'Password too short').len(8);
	check(password, 'Passwords do not match').equals(password_confirm);
	
	var passHash = crypto.createHash('sha1');
	var hashedPassword = passHash.digest('hex');
	var dateJoined = new Date();
	
	var newuser_data = {
		      email: email,
		   password: hashedPassword,
		      phone: phone,
		     joined: dateJoined,
		  intransit: false
	};
	
	var newuser = new user(newuser_data);
	newuser.save(function(error, data) {
		if (error) response.json(error);
		else       response.json(data);
	});
});

app.get('/userdata.json', function(request, response) {
	response.set('Content-Type', 'text/json');
	user.find({ email: request.query["email"]}, function(err, results) {
		response.send(results);
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
		if (!err) response.send();
		else	  console.log("Error"); response.send();
	});
});

app.post('/recvtext', function(request, response) {
	if (twilio.validateExpressRequest(request, 'cd620dabe507d714fd00e7f73fa626f1')) {
		var from = sanitize(request.body.From).xss();
		console.log("TEXT RECEIVED FROM " + from);
		var d = new Date();
		var n = d.toString();
		var intransit;

		var sender = user.findOne({ phone: from }, function (err, doc) {
			if (doc) {
				if (!doc.intransit) {
					var twiml = '<?xml version="1.0" encoding="UTF-8" ?><Response><Sms>Received at ' + n + '. Good luck.</Sms></Response>';
					var newtrip = new trip;
					newtrip.start = d;
					doc.trips.push({start: d, finish: null, duration: 0, calories: 0});
					doc.intransit = true;
					doc.save(function(err) {
						if (err) console.log(err);
					});
					response.type('text/xml');
					response.send(twiml);
				} else {
					var twiml = '<?xml version="1.0" encoding="UTF-8" ?><Response><Sms>Received at ' + n + '. Congrats you made it.</Sms></Response>';
					doc.intransit = false;
					var start = doc.trips[doc.trips.length-1].start;
					doc.trips.pop();
					var duration = Math.ceil(Math.abs(d.getTime() - start.getTime()) / (1000 * 60));
					doc.trips.push({start: start, finish: d, duration: duration, calories: 0});
					doc.save(function(err) {
						if (err) console.log(err);
					});
					response.type('text/xml');
					response.send(twiml);
				}
			}
		});		
	} else {
		response.send('Invalid sender');
	}
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});
