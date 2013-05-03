var directionsDisplay;
var lastrendered;
var directionsService = new google.maps.DirectionsService();

function getEmail(){
	userEmail = readCookie("email");
	console.log(userEmail);
	if(userEmail==null){
		window.location.replace("index.html");
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
 var data = '';
 $.ajax({
 	url: "/userdata.json",
 	type: "GET",
    data: {email : userEmail},
    dataType: "json",
    success: function(data) {
  		console.log(data);
  	    $('#info').append("<table><tr><th>Home: </th><td>"+data[0]['home']+"</td></tr><tr><th>Work: </th><td>"+data[0]['work']+"</td></tr><tr><th>Weight: </th><td>"+data[0]['weight']+" lbs</td></tr><tr><th>Email: </th><td>"+data[0]['email']+"</td></tr></table>");
  	}
 });
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
	$.ajax({
 		url: "/userdata.json",
 		type: "GET",
    	data: {email : userEmail},
   		dataType: "json",
   	    success: function(data) {
  			initGraph(data);
  		}
 	});
}
//renders the calorie burning graph to the page
function initGraph(data){
	 var calarray = new Array();
	 var k;
	 calarray[0] = data[0].trips[0].calories;
	 for(k = 1; k < data[0].trips.length; k++){
	 	calarray[k] = calarray[k - 1];
	 	calarray[k] += data[0].trips[k].calories;	
	 	calarray[k] =  Math.round( calarray[k] * 10 ) / 10;
	 }
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
                valueSuffix: 'cal'
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
                data: calarray
            }]
     	});
 	 });
 	 $('#stats').append("<h3>YOUR STATS<h3> <hr>");
 	 var totalcal =  0;
 	 for(i = 0; i < data[0].trips.length ;i++){
 	 	totalcal += data[0].trips[i].calories;
 	 }
 	 $('#stats').append("<table><tr><th>Total Miles Ridden: </th><td>"+ data[0]['distance'] +"</td></tr><tr><th>Total Calories Burned: </th><td>"+ totalcal.toFixed(1) +"</td></tr><tr><th>McDonald French Fries Burned: </th><td>"+ (totalcal/5).toFixed(1) +"</td></tr><tr><th>Approx. Pounds Lost: </th><td>"+(totalcal/3500).toFixed(1)+"</td></tr></table>");  	 
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
	$.ajax({
 		url: "/userdata.json",
 		type: "GET",
    	data: {email : userEmail},
   		dataType: "json",
   	    success: function(data) {
  			direct(data);
  		}
 	});
}


//initialize() sets the google map canvas, centers it, and calls 
//functions to set markers and create polyline
function initMap(){
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
}

function direct(data){
 directionsDisplay = new google.maps.DirectionsRenderer();
 directionsDisplay.setMap(map);
 directionsDisplay.setPanel(document.getElementById("directions"));
 var start = data[0]['home'];
 var end = data[0]['work'];
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
   