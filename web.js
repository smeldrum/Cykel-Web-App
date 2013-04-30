var express = require("express");
var crypto = require("crypto");
var app = express(express.logger());
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
