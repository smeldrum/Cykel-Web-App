var express = require("express");
var app = express(express.logger());
app.use(express.bodyParser());
app.set('title', 'nodeapp');

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
		collection.find({username: request.query["username"]}).toArray(function(err, results) {
			response.send(results);
		});
	});
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});
