var express = require("express");
var crypto = require("crypto");
var app = express(express.logger());
var twilio = require('twilio');
var gm = require('googlemaps');
var util = require('util');
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
	 distance: Number,
	   weight: Number,
	   joined: Date,
	intransit: Boolean,
	  deleted: Boolean,
  dateDeleted: Date,
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

app.post('/adduser', function(request, response, next) {
	var email            = sanitize(request.body.email).xss();
	var phone            = sanitize(request.body.phone).xss();
	var password         = sanitize(request.body.password).xss();
	var password_confirm = sanitize(request.body.password_confirm).xss();
	phone = phone.replace(/[^0-9]/g, '');

	check(email, 'Improper email format').is(/^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/);
	check(phone, 'Invalid phone number').len(10,11);
	check(password, 'Password too short').len(8);
	check(password, 'Passwords do not match').equals(password_confirm);
	
	var hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
	phone = "+1" + phone;
	var dateJoined = new Date();
	
	var newuser_data = {
		      email: email,
		   password: hashedPassword,
		      phone: phone,
		     joined: dateJoined,
		  intransit: false,
		    deleted: false
	};
	
	var newuser = new user(newuser_data);
	newuser.save(function(error, data) {

	});
	response.send();
});

app.post('/addadditional', function(request, response) {
	var email        = sanitize(request.body.email).xss();
	var home_address = sanitize(request.body.home_address).xss();
	var work_address = sanitize(request.body.work_address).xss();
	var weight       = sanitize(request.body.weight).xss();
	
	check(home_address, 'Home address blank').len(1);
	check(work_address, 'Work address blank').len(1);
	check(weight, 'Weight is blank').len(1);
	check(weight, 'Weight has non-numbers').is(/[0-9]+$/);
	
	var userlogin = user.findOne({email: email}, function(err, doc) {
		if (doc) {
			doc.home = home_address;
			doc.work = work_address;
			doc.weight = weight;
			
			var directions = gm.directions(home_address, work_address, function(err, results) {
				if (results) {
					var distance = results.routes[0].legs[0].distance.value; //returned in meters
					doc.distance = distance;			
					doc.save(function(err) {
						if (err) console.log(err);
					});
					response.send();
				} else {
					response.writeHead(400);
					response.send();
				}
			});
		} else {
			console.log("Email not found");
			response.send();
		}
	});
});

app.post('/login', function(request, response) {
	var email    = sanitize(request.body.email).xss();
	var password = sanitize(request.body.password).xss();
	var hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
	
	var userlogin = user.findOne({email: email}, function(err, doc) {
		if (doc) {
			if (doc.password === hashedPassword && !doc.deleted) {
				response.send();
			} else if (doc.deleted) {
				var d = new Date();
				var diff = Math.abs(d.getTime() - doc.dateDeleted.getTime())/(24*60*60*1000);
				if (diff > 30) {
					doc.remove();
					response.writeHead(400);
					response.send();
				}
			} else {
				response.writeHead(400);
				response.send();
			}
		} else {
			response.writeHead(400);
			response.send();
		}
	});
});

app.post('/deleteaccount', function(request, response) {
	var email    = sanitize(request.body.email).xss();
	var password = sanitize(request.body.password).xss();
	var hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
	user.findOne({email: email}, function(err, results) {
		if (!err && hashedPassword === results.password) {
			var d = new Date();
			results.deleted = true;
			results.dateDeleted = d;
			results.save(function (err) {
				if (err) console.log(err);
			});
			response.writeHead(200);
			response.send();
		} else {
			response.writeHead(400);
			response.send();
		}
	});
});

app.post('/resurrect', function(request, response) {
	var email    = sanitize(request.body.email).xss();
	var password = sanitize(request.body.password).xss();
	var hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
	console.log(email);
	user.findOne({email: email}, function(err, results) {
		if (results) {
			var d = new Date();
			var diff = Math.abs(d.getTime() - results.dateDeleted.getTime())/(24*60*60*1000);
			console.log(diff);
			if (diff <= 30) {
				if (!err && hashedPassword === results.password && results.deleted) {
					results.deleted = false;
					results.save(function (err) {
						if (err) console.log(err);
					});
					response.send();
				} else {
					console.log("Wrong password or wasn't deleted");
					response.writeHead(400);
					response.send();
				}
			} else {
				console.log("Too old");
				results.remove();
				response.writeHead(400);
				response.send();
			}
		} else {
			console.log("Result not found");
			response.writeHead(400);
			response.send();
		}
	});
});

app.get('/userdata.json', function(request, response) {
	var email = sanitize(request.query["email"]).xss();
	user.find({ email: email}, function(err, results) {
		if (!err) {
			response.set('Content-Type', 'text/json');
			response.send(results);
		} else {
			response.writeHead(400);
			response.send();
		}
	});
});

app.post('/changedata', function(request, response) {
	var email    = sanitize(request.body.email).xss();
	var home     = sanitize(request.body.home).xss();
	var work     = sanitize(request.body.work).xss();
	var weight   = sanitize(request.body.weight).xss();
	var phone    = sanitize(request.body.phone).xss();
	var currpass = sanitize(request.body.currentpass).xss();
	var newpass  = sanitize(request.body.newpass).xss();
	
	user.findOne({email: email}, function(err, results) {
		if (results) {
			/* change password */
			if (currpass != '') {
				if (newpass != '') {
					var currpasshash = crypto.createHash('sha1').update(currpass).digest('hex');
					if (currpasshash === results.password) {
						newpasshash = crypto.createHash('sha1').update(newpass).digest('hex');
						results.password = newpasshash;
						response.send()
					} else {
						response.writeHead(400);
						response.send();
					}
				} else {
					response.writeHead(400);
					response.send();
				}
			}
			/* change other data */
			if (home != '') results.home = home;
			if (work != '') results.work = work;
			if (weight != '') results.weight = weight;
			if (phone != '') results.phone = phone;
			results.save(function(err) {
				if (err) console.log(err);
			});
			response.send();
			
		} else {
			response.writeHead(400);
			response.send();
		}
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
	response.send();
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
					var quotes = [
					"\"Life is like riding a bicycle. To keep your balance you must keep moving\" - Albert Einstein. Good luck", 
					"\"I thought of that while riding my bicycle\" - Albert Einstein re: the Theory of Relativity. Good luck",
					"\"Whenever I see an adult on a bicycle, I have hope for the human race\" - H.G. Wells. Good luck", 
					"\"Cycle tracks will abound in Utopia\" - H.G. Wells. Good luck",
					"\"The bicycle is a curious vehicle. Its passenger is its engine.\" - John Howard. Good luck",
					"\"If constellations had been named in the 20th century, I suppose we would see bicycles\" - Carl Sagan. Good luck",
					"\"When man invented the bicycle, he reached the peak of his attainments\" - Elizabeth West. Good luck",
					"\"Bicycling is a big part of the future. It has to be\" - Bill Nye the Science Guy. Good luck",
					"\"There's something wrong with a society that drives a car to workout in a gym.\" - Bill Nye the Science Guy. Good luck",
					"\"I finally concluded that all failure was from a wobbling will rather than a wobbling wheel\" - Frances Willard. Good luck",
					"\"It never gets easier, you just go faster\" - Greg LeMond, Tour de France. Good luck",
					"\"When my legs hurt, I say: \'Shut up legs! Do what I tell you to do!\'\" - Jens Voigt. Good luck",
					"\"Melancholy is incompatible with bicycling\" - James E. Starrs. Good luck",
					"\"Nothing compares to the simple pleasure of riding a bike\" - John F. Kennedy. Good luck",
					"\"Think of bicycles as rideable art that can just about save the world\" - Grant Petersen. Good luck",
					"\"Whoever invented the bicycle deserves the thanks of humanity\" - Grant Petersen. Good luck",
					"\"There's a certain amount of romance to bikes. They're both beautiful and utilitarian\" - Dave Eggers. Good luck",
					"\"The difference between me and Lance Armstrong is I still have a chance to win the Tour de France\" - Anyone. Good luck"
					]
					var quotenum = Math.floor((Math.random()*quotes.length)+1);
					var twiml = '<?xml version="1.0" encoding="UTF-8" ?><Response><Sms>' + quotes[quotenum] + '</Sms></Response>';
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
					doc.intransit = false;
					var start = doc.trips[doc.trips.length-1].start;
					doc.trips.pop();
					var distance = doc.distance;
					var duration = Math.abs(d.getTime() - start.getTime()) / (1000 * 60);
					var speed = distance/(duration / 60);
					var weight = doc.weight;
					var calories = ((speed * weight*(.0053)+.0083*speed^3)*7.2)/10;
					var twiml = '<?xml version="1.0" encoding="UTF-8" ?><Response><Sms>Congrats, you made it! You burned ' + Math.ceil(calories) + ' calories on that trip!</Sms></Response>';
					doc.trips.push({start: start, finish: d, duration: duration, calories: calories});
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
