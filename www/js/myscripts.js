jQuery(document).ready(function() {

	jQuery("#save-changes").click(function() {
		var email = jQuery("#user-email").val();
		var nickname = jQuery("#user-nickname").val();
		var password = jQuery("#user-password").val();
		var oldpwd = jQuery("#user-old-password").val();

		jQuery.ajax({
		  url: '../update-user.php',
		  type: 'POST',
		  data: {email: email, password: password, oldpwd: oldpwd, nickname: nickname},
		  success: function(data, textStatus, xhr) {
		  	swal("You have successfully saved all the changes");
		  },
		});
		
	});
});