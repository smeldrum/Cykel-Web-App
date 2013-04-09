var directionsDisplay;
var directionsService = new google.maps.DirectionsService();

//initialize() sets the google map canvas, centers it, and calls 
//functions to set markers and create polyline
function initialize(){
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
 directionsDisplay = new google.maps.DirectionsRenderer();
 directionsDisplay.setMap(map);
 directionsDisplay.setPanel(document.getElementById("directions"));
 var start = "Tufts University, 419 Boston Avenue, Medford, MA, United States";
 var end = "Fresh Pond Parkway, Cambridge, MA";
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
