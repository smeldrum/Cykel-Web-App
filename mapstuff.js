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






function appendfound(name, dist){
	var para=document.createElement("p");
	var node=document.createTextNode("You are " + dist + " miles from " + name);
	para.appendChild(node);
	var element=document.getElementById("found");
    element.appendChild(para);
}

//finds user position and calls createUserMarker
//if Waldo or Carmen were found, also calls appendfound()
function userposition(position){
    userlat = position.coords.latitude;
    userlng = position.coords.longitude;
    createUserMarker(userlat, userlng);
    if(carmlat != undefined && carmlng != undefined){
    	dist = finddistance(carmlat,carmlng, userlat, userlng); 				 
   	    appendfound("Carmen", dist);
   	 }
   	 if(wallat != undefined && wallng != undefined){
    	dist = finddistance(wallat,wallng, userlat, userlng); 				 
   	    appendfound("Waldo", dist);
   	 }		
}
Number.prototype.toRad = function() {
   		return this * Math.PI / 180;
	}
function finddistance(lat1, lng1, lat2, lng2){
	var R = 3958.76 //miles
	//var R = 6371; // km
	var x1 = lat1 - lat2;
	var dLat = x1.toRad();
	var x2 = lng1 - lng2;
	var dLon = x2.toRad();
	var lat2 = lat2.toRad();
	var lat1 = lat1.toRad();
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	return d;
}
function carmandwaldo(){
	request.onreadystatechange = function(){
    	if (request.readyState==4 && request.status==200)
	   	{
	   		var hidingPlaces = JSON.parse(request.responseText);
	   	    for(i = 0; i < hidingPlaces.length; i++)
	   	    {
	   	        	        
	   	        if(hidingPlaces[i]["name"] == "Waldo"){
	   	        	ident = "Waldo";
	   	        	pic = "waldo.png";
	   	        	wallat = hidingPlaces[i]["loc"]["latitude"];
	   	        	wallng = hidingPlaces[i]["loc"]["longitude"];
	   	        }
	   	        else
	   	        {
	   	          	ident = "Carmen"; 
	   	        	pic = "carmen.png";	
	   	        	carmlat = hidingPlaces[i]["loc"]["latitude"];
	   	        	carmlng = hidingPlaces[i]["loc"]["longitude"]; 
	   	        }
	   	 		var marker = new google.maps.Marker({
        			position : new google.maps.LatLng(hidingPlaces[i]["loc"]["latitude"], 
        			           hidingPlaces[i]["loc"]["longitude"]),
        			map: map,
        			title: ident,
        			icon: pic
   				 });
	   	    }
        }
    }
 	url = "http://messagehub.herokuapp.com/a3.json";
 	request.open("GET",url,true);
   	request.send();
}

function createUserMarker(latit, longit){
	var marker = new google.maps.Marker({
        position : new google.maps.LatLng(latit, longit),
        map: map,
        title: "You Are Here"
    });
    infowindow = new google.maps.InfoWindow();
	request.onreadystatechange = function(){
    	if (request.readyState==4 && request.status==200)
	   	{
	   		var nearestStat = JSON.parse(request.responseText);
	   		var distInfo = "<h2>You are here</h2>";
	   		var closeststation;
	   		var disttostation = 99999;
	   		for(i = 0; i < iter; i++)
	   		{
	   	     	var dist = finddistance(stations[i].getPosition().lat(),stations[i].getPosition().lng(),userlat,userlng)
	   			if(dist < disttostation)
	   			{
	   				disttostation = dist;
	   				closeststation = stations[i].getTitle();
	   			}
	   		}
			distInfo += "<p>The closest station to you is <strong>" + closeststation + "</strong> which is approximately " + disttostation + " miles away from you.";	
    		infowindow.setContent(distInfo);		
    	}
    }
 	url = "http://mbtamap-cedar.herokuapp.com/mapper/find_closest_stations?lat=" + latit + "&lon=" + longit;
 	request.open("GET",url,true);
   	request.send();
   	infowindow.open(map, marker);
}


function redlinemarkers(){
    createMarker(42.395704, -71.141099, 'Alewife Station', 'RALEN', 'RALES');
    createMarker(42.396197, -71.121926, 'Davis Station', 'RDAVN', 'RDAVS');
    createMarker(42.388505, -71.119148, 'Porter Square Station', 'RPORN', 'RPORS');
    createMarker(42.373653, -71.118954, 'Harvard Square Station', 'RHARN','RHARS');
    createMarker(42.365457, -71.103644, 'Central Square Station', 'RCENN', 'RCENS');
    createMarker(42.362413, -71.086382, 'Kendall/MIT Station', 'RKENN', 'RKENS');
    createMarker(42.361255, -71.070825, 'Charles/MGH Station', 'RMGHN','RMGHS');
    createMarker(42.356332, -71.061952, 'Park St. Station','RPRKN','RPRKS');
	createMarker(42.355518, -71.060225, 'Downtown Crossing Station', 'RDTCN','RDTCS');
	createMarker(42.351971, -71.056008, 'South Station','RSOUN','RSOUS');
	createMarker(42.342884, -71.057349, 'Broadway Station','RBRON','RBROS');
	createMarker(42.329362, -71.056845, 'Andrew Station', 'RANDN', 'RANDS');
    createMarker(42.320732, -71.051717, 'JFK/UMass Station', 'RJFKN', 'RJFKS');
    //Braintree Fork
    createMarker(42.275275,-71.029583, 'North Quincy Station','RNQUN','RNQUS');
    createMarker(42.266514,-71.020337, 'Wollaston Station','RWOLN','RWOLS');
    createMarker(42.251809,-71.005409, 'Quincy Center Station','RQUCN','RQUCS');
    createMarker(42.233391,-71.007153, 'Quincy Adams Station','RQUAN','RQUAS');
    createMarker(42.207854,-71.001138, 'Braintree Station', 'RBRAN','RBRAS');
    //Ashmont Fork
	createMarker(42.31129,-71.053331, 'Savin Hill Station', 'RSAVN','RSAVS');
	createMarker(42.300093,-71.061667, 'Fields Corner Station', 'RFIEN', 'RFIES');
	createMarker(42.293126,-71.065738, 'Shawmut Station', 'RSHAN','RSHAS');
	createMarker(42.284652,-71.064489, 'Ashmont Station', 'RASHN', 'RASHS');
}
function createLine(){
	var redlinecoords1 = [new google.maps.LatLng(42.395704, -71.141099), new google.maps.LatLng(42.396197, -71.121926), new google.maps.LatLng(42.388505, -71.119148), new google.maps.LatLng(42.373653, -71.118954), new google.maps.LatLng(42.365457, -71.103644), new google.maps.LatLng(42.362413, -71.086382), new google.maps.LatLng(42.361255, -71.070825), new google.maps.LatLng(42.356332, -71.061952), new google.maps.LatLng(42.355518, -71.060225), new google.maps.LatLng(42.351971, -71.056008), new google.maps.LatLng(42.342884, -71.057349), new google.maps.LatLng(42.329362, -71.056845), new google.maps.LatLng(42.320732, -71.051717)];
  	var redlinecoords2 = [new google.maps.LatLng(42.320732, -71.051717), new google.maps.LatLng(42.275275,-71.029583), new google.maps.LatLng(42.266514,-71.020337), new google.maps.LatLng(42.251809,-71.005409), new google.maps.LatLng(42.233391,-71.007153), new google.maps.LatLng(42.207854,-71.001138)]
  	var redlinecoords3 = [new google.maps.LatLng(42.320732, -71.051717), new google.maps.LatLng(42.31129,-71.053331),new google.maps.LatLng(42.300093,-71.061667), new google.maps.LatLng(42.293126,-71.065738),new google.maps.LatLng(42.284652,-71.064489)]
	var redline1 = new google.maps.Polyline({
    	path: redlinecoords1,
    	strokeColor: "#FF0000",
    });
    var redline2 = new google.maps.Polyline({
   		path: redlinecoords2,
   		strokeColor: "#FF0000",
    });
    var redline3 = new google.maps.Polyline({
    	path: redlinecoords3,
    	strokeColor: "#FF0000",
    });
    redline1.setMap(map);
    redline2.setMap(map);
    redline3.setMap(map);
}
function createMarker(latit, longit, station, north, south){
    var image = 'mbtaicon.png';
	var marker = new google.maps.Marker({
        position : new google.maps.LatLng(latit, longit),
        map: map,
        icon: image,
        title: station
    });
   
    marker.nabbrev = north;
    marker.sabbrev = south;
    stations[iter] = marker;
    iter ++;
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.close();		
      infowindow = new google.maps.InfoWindow();
	  request.onreadystatechange = function(){
    		if (request.readyState==4 && request.status==200)
	   		{
    			var arrinfo = '<h3>' + marker.getTitle() + '</h3>';
    			arrinfo += '<table id="arrivals" border = "1"><tr><th>Direction</th><th>Time Remaining</th></tr>';
				trainfo = JSON.parse(request.responseText); 
				for(i = 0; i < trainfo.length; i++)
				{  
				    if(trainfo[i]["InformationType"] != "Predicted")continue;
					if( trainfo[i]["PlatformKey"] == marker.nabbrev)
				    {
				    	arrinfo += ('<tr><td>' + "Northbound" +'</td> <td>' + 
					            	trainfo[i]['TimeRemaining']+ '</td></tr>');
				    }
				    if( trainfo[i]["PlatformKey"] == marker.sabbrev)
				    {
				    	arrinfo += ('<tr><td>' + "Southbound" +'</td> <td>' + 
					            	trainfo[i]['TimeRemaining']+ '</td></tr>');
				    }
				}    	
				arrinfo += '</table>';
				infowindow.setContent(arrinfo);			
    		}
      }
 	  url = "http://mbtamap-cedar.herokuapp.com/mapper/redline.json";
 	  request.open("GET",url,true);
   	  request.send();
   	  infowindow.open(map, marker);
	});
}