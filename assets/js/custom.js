$(document).ready(function() {
	$('#btn_signin').click(function() {
		$('#mainstage, #btn_signin').fadeOut('slow', function() {
			$('#signin, #btn_register').fadeIn('slow');
		});
	});
	
	$('#btn_register').click(function() {
		$('#signin, #btn_register').fadeOut('slow', function() {
			$('#mainstage, #btn_signin').fadeIn('slow');
		});
	});
});