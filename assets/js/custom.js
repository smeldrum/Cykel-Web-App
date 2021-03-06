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
	
	/* email format checker */
	
	$('#email').focus(function() {
		
	});
	
	$('#email').blur(function() {
		if ($('#email').val().length < 1) {
			$('#email_warning').fadeOut('fast');
		} else {
			var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
			var emailAddress = $('#email').val();
			if (!emailRegex.test(emailAddress) || emailAddress.length == 0) {
				$('#email_warning').html("<span style='color: #FF0000;'>Must be format name&#64;domain.thing</span>");
				$('#email_warning').fadeIn('fast');
			} else {
				$('#email_warning').html("<span style='color: #00AA00;'>&#10003;</span>");
				$('#email_warning').fadeIn('fast');
			}
		}
	});
	
	/* password format checker */
	
	$('#password').focus(function() {
		$('#password_warning').fadeIn('fast');
	});
	
	$('#password').keyup(function() {
		if ($('#password').val().length < 8) {
			$('#password_warning').html("<span style='color: #FF0000;'>Must be at least 8 characters</span>");
		} else {
			$('#password_warning').html("<span style='color: #00AA00;'>&#10003;</span>");
		}
	});
	
	$('#password').blur(function() {
		if ($('#password').val().length < 1) {
			$('#password_warning').fadeOut('fast');
		}
	});
	
	/* password_confirm format checker */
	
	$('#password_confirm').focus(function() {
		$('#password_conf_warning').fadeIn('fast');
	});
	
	$('#password_confirm').keyup(function() {
		if ($('#password').val().length == 0) {
			$('#password_conf_warning').html("<span style='color: #FF0000;'>Enter password in the field above</span>");
		} else if ($('#password').val() != $('#password_confirm').val()) {
			$('#password_conf_warning').html("<span style='color: #FF0000;'>Passwords do not match</span>");
		} else {
			$('#password_conf_warning').html("<span style='color: #00AA00;'>&#10003;</span>");
		}
	});
	
	$('#password_confirm').blur(function() {
		if ($('#password').val().length < 1) {
			$('#password_conf_warning').fadeOut('fast');
		}
	});
	
	$('#btn_signup').click(function() {
		$.ajax({
			type: "POST",
			url: "http://infinite-waters-4536.herokuapp.com/adduser.json",
			data: "email=" + $('#email').val() + "&password=" + $('#password').val() +
					"&password_confirm=" + $('#password_confirm').val(),
			success: function (msg) {
				console.log("Success " + msg);
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				if ($('#email').val().length == 0 || $('#password').val().length == 0
					|| $('#password_confirm').val().length == 0) {
					$('#form_warning').text("Please fill in all fields");
				} else {
					$('#form_warning').text("There are some errors in the form. Please see red text");
				}
				$('#form_warning').fadeIn('fast');
			}
		});
	});
});