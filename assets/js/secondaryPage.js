var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

function getEmail(){
	userEmail = readCookie("email");
	if(userEmail==null){
		window.location.replace(index.html);
	}
	
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function renderMap(){
	$('.row').append('<div id="map_canvas" width="600" height="200"></div>');
	//$('.row').append('<div id="directions" width="300" height="200"></div>');
	initialize();
	//<div id="directions" width="300" height="200"></div>
	$(document).ready(function() {
        document.title = 'blah';
	});   	
}
//initialize() sets the google map canvas, centers it, and calls 
//functions to set markers and create polyline
function initialize(){
  console.log("CALLED");
  mapOptions = {
  center: new google.maps.LatLng(42.330497742, -71.095794678),
  zoom: 12,
  mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map(document.getElementById("map_canvas"),mapOptions);
  try {request = new XMLHttpRequest();}
  catch (IE) {
  	try {request = new ActiveXObject("Msxml2.XMLHTTP");}
	catch (notIE7) {
		try {request = new ActiveXObject("Microsoft.XMLHTTP");}
		catch (ex) { request = null;}
  	}
  }
  if (request == null) {
 		return "Error creating request object --Ajax not supported?";	  		
  }	
  direct();
}
function direct(){
	var emailRequest = $.ajax({
  url: "/userdata.json",
  type: "POST",
  data: {email : userEmail},
  dataType: "json"
});
	var userData = JSON.parse(emailRequest);
 directionsDisplay = new google.maps.DirectionsRenderer();
 directionsDisplay.setMap(map);
 directionsDisplay.setPanel(document.getElementById("directions"));

 
 var start = userData["home"];
 var end = userData["work"];
 var request = {
    origin:start,
    destination:end,
    travelMode: google.maps.TravelMode.BICYCLING,
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: true
 };
 directionsService.route(request, function(result, status) {
 	if (status == google.maps.DirectionsStatus.OK) {
    	directionsDisplay.setDirections(result);
 	}
 });
}
