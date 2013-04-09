$(document).ready(function() {
	$('#btn_signin').click(function() {
		$('#mainstage').fadeOut('slow', function() {
			$('#signin').fadeIn('slow');
		});
	});
});