function initMap() {
	centerOfMap = new google.maps.LatLng(42.330497742, -71.095794678);
		myOptions = {
			zoom: 10,
			center: centerOfMap,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};
				
		// Create the map in the "map_canvas" <div>
	bostonMap = new google.maps.Map(document.getElementById("main_canvas"), myOptions);
}