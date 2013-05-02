var directionsDisplay;
var lastrendered;
var directionsService = new google.maps.DirectionsService();

function cleardiv(name){
	switch(name){
		case "map":
		    $('#map_canvas').remove();
		    $('#directions').remove();
			break;
		case "stat":
			$('#graph').remove();
		    $('#stats').remove();
			break;
		case "account":
			$('#eva').remove();
		    $('#info').remove();
			break;
	}
}
function renderAcc(){
	 if(lastrendered!=null){
    	$('#' + lastrendered).attr('class', null);   
    	cleardiv(lastrendered);
    }
    $('#account').attr('class', 'active'); 
    $('.container.marketing').before('<div id="eva" style="min-width: 400px; height: 400px; margin: 0 auto"></div>');
	$('.container.marketing').before('<div id="info" width="300" height="200"></div>');
    lastrendered = "account";
    initAccInfo();
}

function initAccInfo(){
 //$('#eva').append("<img src= 'http://www.getoutdoors.com/goblog/uploads/eva_longoria_bebe_bicycle.jpg' width= '266' height= '400'>").fadeIn("slow");
 $("<img src= 'http://www.getoutdoors.com/goblog/uploads/eva_longoria_bebe_bicycle.jpg' width= '266' height= '400'>").hide().appendTo("#eva").fadeIn(1000);
 $('#info').append("<h2>Well Hello Kelly...</h2><hr>");
 $('#info').append("<table><tr><th>Home: </th><td>Tufts University, 419 Boston Avenue, Medford, MA, United States</td></tr><tr><th>Work: </th><td> Fresh Pond Parkway, Cambridge, MA</td></tr><tr><th>Weight: </th><td> 346 lbs</td></tr><tr><th>Email: </th><td> fakey.mcfake@hotmail.com</td></tr></table>");
}

function renderStats(){
    if(lastrendered!=null){
    	$('#' + lastrendered).attr('class', null);   
    	cleardiv(lastrendered);
    }
    $('#stat').attr('class', 'active'); 
	$('.container.marketing').before('<div id="graph" style="min-width: 400px; height: 400px; margin: 0 auto"></div>');
	$('.container.marketing').before('<div id="stats" width="300" height="200"></div>');
	lastrendered = "stat";
	initGraph();
}
//renders the calorie burning graph to the page
function initGraph(){
	 var chart1;
     $(document).ready(function () {
     chart1 = new Highcharts.Chart({
         chart: {
             renderTo: 'graph',
             type: 'line',
       		 marginRight: 130,
             marginBottom: 25
            },
            title: {
                text: 'Cumulative Calories Burned',
                x: -20 //center
            },
            subtitle: {
                text: 'Your Personal Information',
                x: -20
            },
            xAxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
            },
            yAxis: {
                title: {
                    text: 'Calories'
                },
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            tooltip: {
                valueSuffix: '°C'
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -10,
                y: 100,
                borderWidth: 0
            },
            series: [{
                name: 'Total Calories',
                data: [100, 150, 230, 305, 376]
            }]
     });
 	 });
 	 $('#stats').append("<h3>YOUR STATS<h3> <hr>");
 	 $('#stats').append("<table><tr><th>Total Miles Ridden: </th><td> 100</td></tr><tr><th>Total Calories Burned: </th><td> 5,000</td></tr><tr><th>Approx. Pounds Lost: </th><td> 15</td></tr><tr><th>Money Saved on Gas: </th><td> $900</td></tr></table>");
 	   
 	 
}


//prepares page for divs, adds two divs, and calls initMap()
function renderMap(){
 	if(lastrendered!=null){
 		$('#' + lastrendered).attr('class', null);   
 		cleardiv(lastrendered);
 	}
    $('#map').attr('class', 'active'); 
	$('.container.marketing').before('<div id="map_canvas" width="600" height="200"></div>');
	$('.container.marketing').before('<div id="directions" width="300" height="200"></div>');
	lastrendered = "map";
	initMap();
}


//initialize() sets the google map canvas, centers it, and calls 
//functions to set markers and create polyline
function initMap(){
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
 // homeandwork();
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
//homeandwork is meant to retrieve the user's home and work data from mongo to
//be used by direct() as start and end points
function homeandwork(){
	$.getJSON('/userdata.json', function(data) {
  		var home;
  		var work;
 		$.each(data, function(key, val) {
    		if(key="home") home = val;
    		if(key="work") work = val;
 		}); 
 		console.log(home);
 		console.log(work);
 	}); 
}
   