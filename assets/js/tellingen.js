var Lat = 51.207;
var Lng = 4.413;
var zoom = 12;
var map;
var markers = {};
$(function() {		
	$('.datepicker').datepicker({
	 	dateFormat: 'dd/mm/yy'
	});  	
	$('#register, #login').hide();
	$.event.props.push('dataTransfer');
	$(document).on('click', '.dropzone', function(e){
		$('#uploadFile').trigger('click');
	});
	$(document).on('change', '#uploadFile', function(e){
		e.stopPropagation();
		e.preventDefault();
		processUpload(e);
	}); 
	$(document).on('click', '#gen_password', function(event){
		event.preventDefault();		
		var random_password = randomString(8, 'a');
		$('#generated_password').html(random_password);
		$('input[name=password], input[name=confirmPassword]').val(random_password);
	});
	$('.dropzone').on({
    	'dragover': function(e)	{
			e.preventDefault();
			return false;
		}, 
    	'dragenter': function(e) {
        	 e.preventDefault();
	         e.stopPropagation();        	
        },
        'dragleave': function(e) {
        	 e.preventDefault();
	         e.stopPropagation();     	
        },
        'drop': function(e){
	        processUpload(e);
	    }
    });
	$(document).on('click', '.sign-in', function(event) {
		event.preventDefault();
		$('.first-page-hidden').hide();
		$('#login').css('visibility', 'inherit').show();
	});
	$(document).on('click', '.sign-up', function(event) {
		event.preventDefault();
		$('.first-page-hidden').hide();
		$('#register').css('visibility', 'inherit').show();
	});
	$(document).on('click', '.close-icon, .close_button', function(){
		$('.first-page-hidden').css('visibility', 'hidden');
		$('#crop_overlay').css('display', 'none');	
		$('#choose_pic').css('display', 'inherit');	
		$('#crop_image').html('');
		$('#registerForm').css('display', 'inherit');
		$('#confirmationMail').css('display', 'none');
	});	
	$(document).on('submit', '#registerForm', function(event){
		event.preventDefault();
		var href = $(this).attr('action');
		var data = $(this).serialize();
		if(($(this).children('input[name="email"]').val() == $(this).children('input[name="confirmEmail"]').val()) && ($(this).children('input[name="password"]').val() == $(this).children('input[name="confirmPassword"]').val())){
			$.post(href, data, function(json) {
				console.log(json);
				$('#registerForm').css('display', 'none');
				$('#confirmationMail').css('display', 'inherit');
			});
		} else {
			alert($(this).children('input[name="email"]').val()+' != '+$(this).children('input[name="confirmEmail"]').val());
		}		
	});
	
	$(document).on('submit', '#loginForm', function(event){
		event.preventDefault();
		var href = $(this).attr('action');
		var data = $(this).serialize();
		$.post(href, data, function(json) {
			console.log(json);
			if (json.error == false) {
				window.location = '/lijst';
			}
		});
	});
	$(document).on('keyup', 'input[name="password"]', function(event){
		  compare('password_correct', $(this).val(), $('input[name="confirmPassword"]').val());
	});
	$(document).on('keyup', 'input[name="confirmPassword"]', function(event){
		  compare('password_correct',$('input[name="password"]').val(), $(this).val());
	});
	$(document).on('keyup', 'input[name="email"]', function(event){
		  compare('email_correct', $(this).val(), $('input[name="confirmEmail"]').val());
	});
	$(document).on('keyup', 'input[name="confirmEmail"]', function(event){
		  compare('email_correct',$('input[name="email"]').val(), $(this).val());
	});
	$(document).on('click', '.settingSubmit', function(event){
		event.preventDefault();
		var id = $(this).attr('id');
		var $clicked = $( event.target );
		switch (id){
			case 'basisSettingSubmit':
				var object = {
					'type': 'basis',
					'username': $('input[name="username"]').val(), 
					'organisatie': $('select[name="organisatie"] option:selected').val(), 
					'firstName': $('input[name="firstName"]').val(), 
					'lastName': $('input[name="lastName"]').val()
				};
				$.post('/settings/basis', {data: object}, function (response) {
					if (response.success){
						$('#firstNameUser').parents('a').attr('href', $('input[name="username"]').val());
						$('#firstNameUser').text($('input[name="firstName"]').val());
						$('#lastNameUser').text($('input[name="lastName"]').val());
						$clicked.parents('div.button_container').siblings('.message').html('<div class="alert alert-success" style="padding: 3px 3px; margin: 0 0;">De data werd correct opgeslagen</div>');
						setTimeout(function(){$('.message').children().fadeOut('slow');},4000);
					} else {
						$clicked.parents('div.button_container').siblings('.message').html('<div class="alert alert-danger" style="padding: 3px 3px; margin: 0 0;">Error:'+response.err+'</div>');
					}
				});
			break;
			case 'emailSettingSubmit':
				var object = {
					'type': 'email',
					'email': $('input[name="email"]').val(), 
					'fax': $('input[name="fax"]').val(),  
					'telefoon': $('input[name="telefoon"]').val(), 
					'gsm': $('input[name="gsm"]').val()
				};
				$.post('/settings/email',{
				  data: object
				}, function (response) {
					if (response.success){						
						$clicked.parents('div.button_container').siblings('.message').html('<div class="alert alert-success" style="padding: 3px 3px; margin: 0 0;">De contactgegevens werd correct opgeslagen.</div>');						
					} else {
						$clicked.parents('div.button_container').siblings('.message').html('<div class="alert alert-danger" style="padding: 3px 3px; margin: 0 0;">Error:'+response.err+'</div>');
					}
				});
			break;
			case 'passwordSettingSubmit':
				if ($('#password_correct span').hasClass('glyphicon-ok-sign')){
					var object = {
						'type': 'password',
						'oldPassword': $('input[name="oldPassword"]').val(), 
						'password': $('input[name="password"]').val()
					};
					$.post('/settings/password',{
					  data: object
					}, function (response) {
						if (response.success){
							$('input[name="oldPassword"]').val('');
							$('input[name="password"]').val('');
							$('input[name="confirmPassword"]').val('');
							$('#password_correct').html('');
							$clicked.parents('div.button_container').siblings('.message').html('<div class="alert alert-success" style="padding: 3px 3px; margin: 0 0;">het nieuwe wachtwoord werd correct opgeslagen</div>');
							
						} else {
							$clicked.parents('div.button_container').siblings('.message').html('<div class="alert alert-danger" style="padding: 3px 3px; margin: 0 0;">Error:'+response.err+'</div>');
						}
					});
				} else {
					$clicked.parents('div.button_container').siblings('.message').html('<div class="alert alert-danger" style="padding: 3px 3px; margin: 0 0;">Het nieuw wachtwoord en de bevestiging zijn niet hetzelfde</div>');
					setTimeout(function(){$('.message').children().fadeOut('slow');},4000);
				}
			break;
			
		}
		
	});
	if ($('select[name="type_ingave"] option:selected').val() == 'uploaden'){
		$('#uploadenContainer').css('display', 'block');
		$('#opvraagContainer').css('display', 'none');
	} 
	$(document).on('change', 'select[name="type_ingave"]', function(event){		
		if ($('select[name="type_ingave"] option:selected').val() == 'uploaden'){
			$('#uploadenContainer').css('display', 'block');
			$('#opvraagContainer').css('display', 'none');
		} else {
			$('#uploadenContainer').css('display', 'none');
			$('#opvraagContainer').css('display', 'block');
		}
	});
	$(document).on('click', '#close_overlay', function(event){			
		$('#overlay').css('display', 'none');
	});
	$(document).on('click', '#save_place', function(event){		
		var namen = '';
		var coordinaten = '';
		var place_data = $('#place_data').text();
		place_data = place_data.slice(0, -1);
		var place_array = place_data.split(':');
		$(place_array).each(function(index){
			var place_details = place_array[index].split(';');
			if (coordinaten != ''){
				namen_html  = namen_html + '<br />' + place_details[2];
				namen_form = namen_form + '; ' + place_details[2];
			} else {
				namen = namen_html = namen_form = place_details[2];
			}
			if (coordinaten != ''){
				coordinaten_html = coordinaten_html + '<br />' + place_details[3];
				coordinaten_form = coordinaten_form + '; ' + place_details[3];
			} else{
				coordinaten = coordinaten_html = coordinaten_form = place_details[3];
			}
		});
		$('.add-location, .edit-location').html(namen_html);
		$('.add-location').removeClass('add-location').addClass('edit-location');
		$('#locatie_naam').val(namen_form);
		$('#locatie_coordinaten').html(coordinaten_html);
		$('#locatie_coordinaten_hidden').val(coordinaten_form);
		$('#locaties').val($('#place_data').text());
		
		$('#overlay').css('display', 'none');
	});
	$(document).on('click', '.add-location', function(event){
		event.preventDefault();
		$('#overlay').css('display', 'inherit');		
		var window_h = $('#place').parent('div').height();
		var height = window_h-261;
		$('#place').height(height).width(245).css('position', 'relative').css('overflow', 'hidden');			
		$('#place').perfectScrollbar({'suppressScrollX': false});
		var coordinaten = $('#locatie_coordinaten').val();
		if (coordinaten!==''){
			coordinaten = coordinaten.replace('(','').replace(')', '');
			coordinaten_arr = coordinaten.split(', ');
		} else {
			initialize(Lat, Lng, zoom, false);
		}	
		
	});
	$(document).on('click', '.edit-location', function(event){
		event.preventDefault();
		$('#overlay').css('display', 'inherit');
		var window_h = $('#place').parent('div').height();
		var height = window_h-261;
		$('#place').height(height).width(245).css('position', 'relative').css('overflow', 'hidden');			
		$('#place').perfectScrollbar({'suppressScrollX': false});
		var ids_arr = new Array();
		var coordinaten_arr = new Array();
		var namen_arr = new Array();
		var type_arr = new Array();
		$('.edit_place_id').each(function(id){
			ids_arr.push($(this).text());
		});
		$('.edit_place_coordinaten').each(function(coordinaat){
			coordinaten_arr.push($(this).text());
		});
		$('.edit_place_naam').each(function(naam){
			namen_arr.push($(this).text());
		});
		$('.place .subText .type_locatie').each(function(type){
			type_arr.push($(this).text());
		});		
		initialize2(ids_arr, coordinaten_arr, namen_arr, type_arr, 15, true, '', true, 'map-canvas');
		
	});
	$(document).on('click', '.remove_location', function(event){
		var id = 'place_'+$(this).attr('id');
		$(this).parents('.place').fadeOut(300, 
			function() { 
				marker = markers[id];
				marker.setMap(null);
				$(this).remove();
				$('#place_data').html('');
				$('.place').each(function(index){
					var text = $(this).children('.place_id').text()+';'+$(this).children('p').children('span').children('.type_locatie').text()+';'+$(this).children('.place_naam').text()+';'+$(this).children('.place_coordinaten').text()+':';
					$('#place_data').append(text);
				});
			}
		);		
	});
	
	$(document).on('click', '.setting h3', function(event){
		$('.setting .setting-inner').css('display', 'none');
		$(this).siblings('.setting-inner').show();
		$('.setting h3 span').attr('class', 'glyphicon glyphicon-chevron-down');
		$(this).children('span').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-left');
	});
	$(document).on('submit', '#tellingenIngeven', function(event){
		event.preventDefault();
		var href = $(this).attr('action');
		var data = $(this).serialize();
		$.post(href,data, function (response) {
			$('.content').html(response.html);
			if ($('#map-canvas-telling').data('location') != undefined){
				var ids = $('#map-canvas-telling').data('ids');
				var coordinaten = $('#map-canvas-telling').data('location');
				var content = $('#map-canvas-telling').data('adres');
				var types = $('#map-canvas-telling').data('types');
				var coordinaten_arr = coordinaten.split(' ; ');
				var namen_arr = content.split(' ; ');
				var types_arr = types.split(' ; ');
				
				initialize2(ids, coordinaten_arr, namen_arr, types_arr, 15, true, content, false, 'map-canvas-telling');
			}
		}, 'json');
	});	
	$(document).on('click', '#admin-button, .close-admin', function(event){
		event.preventDefault();
		
		if($('#admin-sidebar').css('left') == '-260px'){
			$('#admin-sidebar').animate({					
			   	left: '+=260px',
			}, 300, function() {
				  // Animation complete.
			});
			$('#admin-button').animate({					
			   	left: '+=260px',
			}, 300, function() {
				  // Animation complete.
			});
			$('#admin-sidebar').css('box-shadow', '3px 0px 6px #888888');
		} else {
			var section_w = $('#admin-sidebar').css('width');
			$('#admin-sidebar').animate({
			   	left: '-='+section_w,
			}, 300, function() {
			    // Animation complete.
			 });
			 $('#admin-button').animate({					
			   	left: '-='+section_w,
			}, 300, function() {
				  // Animation complete.
			});
			$('#admin-sidebar').css('box-shadow', '');
		}
	});
	$(document).on('click', '#admin-sidebar a', function(event){
		event.preventDefault();
		var href = $(this).attr('href');
		$.get(href, function(json){
			$('#admin-overlay-content').html(json.html).parent('div').css('display', 'inherit');					
		}, 'json');
	});
	$(document).on('click', '.close-overlay', function(event){
		$('#admin-overlay-content').html('').parent('div').css('display', 'none');
	});
	$(document).on('click', '#close_infoOverlay', function(event){
		$('#infoOverlayContainer').css('display', 'none');
	});
	$(document).on('click', '#admin-overlay-content a:not(.not_ajax)', function(event){
		event.preventDefault();
		var href = $(this).attr('href');
		$.getJSON(href, function(json){
			$('#admin-overlay-content').html(json.html).parent('div').css('display', 'inherit');			
		});			
		
	});
	$('#example').popover({html:true, placement: 'bottom'});
	/*var filenames = $("#filenames").val();
	
	if (filenames != '' && filenames != undefined) {
		var filenames_arr = filenames.split(', ');
		filenames_arr.forEach(function(filename){
			$('#uploadedFiles').append('<li><a href="/download/'+filename+'" target="_blank"><span class="glyphicon glyphicon-cloud-download"></span> '+filename+'</a></li>');
		})
	};*/
	$('#help_tt').tooltip();
	$(document).on('change', '#selectLog', function(event){
		var filter = $('#selectLog option:selected').val();		
		$.getJSON('/logs/'+filter, function(json){
			$('#logLijst').html(json.html);	
		});
		
	});
	$(window).resize(function(){
	});
	$('#scrollbar2').on('mouseup', '.track', function(event){
		var pos = $('.list-group-item:last-child').position();
		alert(pos);
	});
	/*$(window).on('scroll', function() {
	    var pos = $('.overview').position();
	    var overviewh = $('.overview').height();
	    var scrollbarh = $('#scrollbar2').height();
	    var rest = overviewh - scrollbarh;
	    $('#rest').html(rest);
	    $('#pos').html(Math.abs(pos.top));
	});*/
	$(document).on('click', '#meer_laden', function(event){
		var filter = $('#selectLog option:selected').val();	
		var eerste = $('#logLijst .list-group .list-group-item:last-child').attr('id');	
		$.getJSON('/logs/'+filter+'/'+eerste, function(json){
			$('#logLijst .list-group').append(json.html);
		});
	});	
	$(document).on('click', '.jsonGet', function(event){
		event.preventDefault();
		var href = $(this).attr('href');
		$.getJSON(href, function(json){			
			$('.content').html(json.html);
			history.pushState(json, "Verkeerstellingen telling", href);
			start();						
		}, 'json');
	});
	
	$(document).on('click', '.toOverlay', function(event){
		event.preventDefault();
		var overlayWidth = ($('body').width()*0.79);
		$('#tellingOverlay').css('right', '-'+overlayWidth+'px');
		var href = $(this).attr('href');
		if(href.indexOf("undefined") == -1){	
  		$.getJSON(href, function(json){			
  			$('#tellingOverlay .content').html(json.html);			
  			$('#tellingOverlayContainer, #tellingOverlay').addClass('visible');
  			var width= (($('#tellingOverlayContainer').width()*0.895));						
  			$('#tellingOverlay').animate({
  			    right: '+='+width,
  			}, 400, function() {
  			});	
  			history.pushState(json, "Verkeerstellingen telling", href);
  			start();			
  			$('.place_information').popover({
  				placement: 'bottom',
  				trigger: 'focus',
  				html: true
  			});
  		}, 'json');
  	} else {
  	  alert('Er is een fout opgetreden!');
  	}
	});
	
	$(document).on('click', '#tellingOverlayContainer', function(event){
		var target = $();
		if (event.target.id === 'tellingOverlayContainer'){
			
			var width= (($('body').width()*0.105)+$('#tellingOverlay').width());
			$('#tellingOverlay').animate({
			    right: '-='+width,
			}, 400, function() {
				$('#tellingOverlayContainer, #tellingOverlay').removeClass('visible');
				var overlayWidth = ($('body').width()*0.79);
				$('#tellingOverlay').css('right', '-'+overlayWidth+'px');
			});				
		}
	});
	
	$(document).on('click', '.help-sign', function(event){
		if($(this).siblings('.help').css('display')=='none'){
			$(this).siblings('.help').css('display', 'inherit');
		} else {
			$(this).siblings('.help').css('display', 'none');
		}		
		if (event.target.id === 'locatieHelp'){			
			
		}
	});
	$(document).on('change', '.typeTelling', function(event){
		var icon = $(this).val();
		var getImage = $('#hiddenIcons img.'+icon).attr('src');
		$(this).siblings('.typeIcon').html('<img src="'+getImage+'">');
	});
	$('.place_information').popover({
		placement: 'bottom',
		trigger: 'focus',
		html: true
	});
	$(document).on('click', '.place_information', function(event){
		var id = $(this).attr('id');		
		marker = markers[id];
		var latLng = marker.getPosition(); // returns LatLng object
		map.setCenter(latLng);
		marker.setAnimation(google.maps.Animation.BOUNCE);
		setTimeout(function() {
			marker.setAnimation(null);
		}, 1380);
	});
	$(document).on('click', '.place', function(event){
		var clicked = $(event.target);
		if (!clicked.hasClass('remove_location')){
			var offset = $(this).offset();
			var id = $(this).attr('id');		
			marker = markers[id];
			marker.setAnimation(google.maps.Animation.BOUNCE);
			var latLng = marker.getPosition(); // returns LatLng object
			map.setCenter(latLng);
			var locatieTextOffset = $('#locatieText').offset();
			$("#locatieTextFixed").css('top', offset.top).css('left', offset.left);
			var position = $(this).position();
			var locatieTextposition = $('#locatieText').position();
			var heightD = (locatieTextposition.top - position.top)-56;		
			var text = $(this).children('strong').html();
			var type = $(this).children('.subText').children('.type_locatie').text();
			var info = $(this).children('.place_info').html();
			var id = $(this).attr('id');
			$('#editOpmerkingLocatie').html(info);
			$('#locatieTextFixed').html(text);
			$('#editTypeTelling option[value="'+type+'"]').prop('selected', 'selected');
			if(type!=''){
				var getImage = $('#hiddenIcons').children('img.'+type).attr('src');
				$('.editTypeIcon').html('<img src="'+getImage+'">');
			}		
			$('.fadeIn').hide();
			$('#LocatieInformatieOverlay').css('display', 'inherit');
			$("#locatieText").css('visibility', 'hidden').html(text);
			$('#locatieTextFixed').addClass('visible').data('id', id);
			$('#locatieTextFixed').animate({
				top: '-='+Math.abs(heightD),
				fontSize: '14px',
			}, 400, function() {
				$('.fadeIn').slideDown( "slow");
			});
		}
	});
	$(document).on('click', '#close_informatieOverlay', function(event){
		var id = $('#locatieTextFixed').data('id');
		marker = markers[id];
		marker.setAnimation(null);
		var position = $('#'+id).position();
		var locatieTextposition = $('#locatieText').position();
		var heightD = (locatieTextposition.top - position.top)-56;	
		$('.fadeIn').slideUp( "slow", function(){
			$('#locatieTextFixed').animate({
				top: '+='+Math.abs(heightD),
				fontSize: '12px',
				paddingLeft: '4px',
			}, 400, function() {			
				$('#editOpmerkingLocatie').html('');
				$('#LocatieInformatieOverlay').css('display', 'none');
			});
		});
	});
	$(document).on('click', '#edit_place', function(event){
		var id = $('#locatieTextFixed').data('id');		
		var type = $('#editTypeTelling option:selected').val();
		marker = markers[id];
		var url = getTypeUrl(type);
		marker.setIcon(url);
		var info = $('#editOpmerkingLocatie').text();		
		$('#'+id+' .place_info').text(info);
		$('#'+id+' .subText .type_locatie').text(type);
	  $('#place_data').html('');		    		
	  $('.place').each(function(index){
			var text = $(this).attr('id')+';'+$(this).children('span').children('.type_locatie').text()+';'+$(this).children('.place_naam').text()+';'+$(this).children('.place_coordinaten').text()+';'+$(this).children('.place_info').text()+':';
			$('#place_data').append(text);
		});	
		$('#close_informatieOverlay').trigger('click');
	});
	$(document).on('click', '.editRemove_location', function(event){
		$('#close_informatieOverlay').trigger('click');	
		var id = $('#locatieTextFixed').data('id');		
		marker = markers[id];
		marker.setMap(null);
		$('#'+id).remove();
		$('#place_data').html('');
		$('.place').each(function(index){
			var text = $(this).children('.place_id').text()+';'+$(this).children('p').children('span').children('.type_locatie').text()+';'+$(this).children('.place_naam').text()+';'+$(this).children('.place_coordinaten').text()+':';
			$('#place_data').append(text);
		});	
		
	});
	$(document).on('click', '#tellingOverlay .close', function(event){
		event.preventDefault();
		var width= (($('body').width()*0.105)+$('#tellingOverlay').width());
		$('#tellingOverlay').animate({
		    right: '-='+width		   
		},  400, function() {
			$('#tellingOverlayContainer, #tellingOverlay').removeClass('visible');
			var overlayWidth = ($('body').width()*0.79);
			$('#tellingOverlay').css('right', '-'+overlayWidth+'px');
		});	
	});
	$(document).on('click', '#uploadedFiles a.glyphicon-remove', function(event){
		event.preventDefault();
		if (confirm('Wil je het bestand zeker verwijderen?')){
			var href= $(this).attr('href');
			var li = event.target;
			$.getJSON(href, function(json){
				if (json.error != undefined) {
					alert(json.error);
				} else {
					var filenames = $("#filenames").val();
					var filename = json.filename;
					filenames = filenames.replace(filename+',', '');
					filenames = filenames.replace(filename, '');
					$('#filenames').val(filenames);
					$(li).parents('li').fadeOut();
				}
			});
		}
	});
	$(document).on('change', '#datumType', function(event){
		var id = $('#datumType option:selected').val();
		$('.datums').css('display', 'none');
		$('.'+id).css('display', 'inherit');
	});
	var id = $('#datumType option:selected').val();
		$('.datums').css('display', 'none');
		$('.'+id).css('display', 'inherit');
	$(document).on('click', '#uploadedFiles a.glyphicon-pencil', function(event){
		event.preventDefault();
		var href = $(this).attr('href');
		var filename = $(this).siblings('.download').children('span.filename').text();
		$('#bestandsnaam').val(filename);
		$('#myModal').modal('show');
	});
	if (!!(window.history && history.pushState)) {
		var popped = ('state' in window.history && window.history.state !== null), initialURL = location.href;	 
		$(window).bind('popstate', function (event) {
			// Ignore inital popstate that some browsers fire on page load
			var initialPop = !popped && location.href == initialURL;
			popped = true;
			if (initialPop) return;
			var data = event.originalEvent.state;	
			console.log(data);  
			if (data.html != undefined){
				$('.content').html(data.html);
				start();
			} else if (data === null){
				window.location = location.pathname;
			} 
			
		});
	}
	$(document).on('click', '.file_info', function(event){
		event.preventDefault();
		var id = $(this).attr('id');
		$('.bestanden_clones').css('display', 'none');
		$('#file_'+id).css('display', 'inherit');
		$('.file_info').removeClass('active');
		$(this).addClass('active');
	});
	$(document).on('click', '#save_icon', function(event){
		event.preventDefault;			
		var locatieCoordinaten = $('.locCor').text();
		locatieCoordinaten = locatieCoordinaten.replace('(','').replace(')', '');
		locatieCoordinatenArr = locatieCoordinaten.split(', ');
		var myLatlng = new google.maps.LatLng(locatieCoordinatenArr[0],locatieCoordinatenArr[1]);
		placeMarker(myLatlng);
		$('#infoOverlayContainer').css('display', 'none');
		$('#opmerkingLocatie').text('');
	});	
	$(document).on('click', '#Bestanden_edit_opslaan', function(event){
		
		$('#infoCol .bestanden_clones').each(function(index){
			var data = {};
			var id = $(this).attr('id');
			var _id = id.split('_');
			data.naam = $('#'+id+' div input[name="naam"]').val();
			data.extension = $('#'+id+' div input[name="extension"]').val();
			data.datum = $('#'+id+' div input[name="datumBestand1"]').val();
			data.type = $('#'+id+' div select option:selected').val();
			data.meer_info = $('#'+id+' div textarea').val();
			$.post('/upload/edit/'+_id[1], data, function(json){
			  var uploads = '<li><a href="/download/'+data.naam+'.'+data.extension+'" target="_blank"><span class="glyphicon glyphicon-cloud-download"></span> <span class="filename">'+data.naam+'.'+data.extension+'<span></a><a class="glyphicon glyphicon-remove" href="/remove_file/'+data.filename+'"></a></li>';
				$('#uploadedFiles').prepend(uploads);
				var filenames = $("#filenames").val();
        if (filenames == ''){
          $('#filenames').val(data['naam']+'.'+data['extension']);
        } else {
           $('#filenames').val(filenames + ', ' + data['naam']+'.'+data['extension']);
        }
			});
			var width= (($('body').width()*0.105)+$('#tellingOverlay').width());
			$('#tellingOverlay').animate({
			    right: '-='+width		   
			},  400, function() {
				$('#tellingOverlayContainer').css('display', 'none');
			});			
		});
	});
});
function randomString(length, chars) {
    var mask = 'abcdefghijklmnopqrstuvwxyz';
     var result = '';
    for (var i = length; i > 0; --i) result += mask[Math.round(Math.random() * (mask.length - 1))];
    return result;
}
	function start(){
		setTimeout(function(){
			var id = $('#datumType option:selected').val();
			$('.datums').css('display', 'none');
			$('.'+id).css('display', 'inherit');
			$('.datepicker').datepicker({
			 	dateFormat: 'dd/mm/yy'
			});
			if ($('select[name="type_ingave"] option:selected').val() == 'uploaden'){
				$('#uploadenContainer').css('display', 'block');
				$('#opvraagContainer').css('display', 'none');
			} 
			var filenames = $("#filenames").val();	
			if (filenames != '' && filenames != undefined) {
				var filenames_arr = filenames.split(', ');
				filenames_arr.forEach(function(filename){
					$('#uploadedFiles').prepend('<li><a href="/download/'+filename+'" target="_blank" class="download"><span class="glyphicon glyphicon-cloud-download"></span> <span class="filename">'+filename+'</span></a><a class="glyphicon glyphicon-remove" href="/remove_file/'+filename+'"></a></li>'				);
				});
			};
			
		}, 1);
		var map_id = undefined;
		if ($('#map-canvas').data('location') != undefined){
			var map_id = 'map-canvas';
		} else if ($('#map-canvas-telling').data('location') != undefined){
			var map_id = 'map-canvas-telling';
		}		
		if (map_id != undefined) {
			var ids = $('#'+map_id).data('ids');
			var coordinaten = $('#'+map_id).data('location');
			var content = $('#'+map_id).data('adres');
			var types = $('#'+map_id).data('types');
			var ids_arr = ids.split(' ; ');
			var coordinaten_arr = coordinaten.split(' ; ');
			var namen_arr = content.split(' ; ');
			var types_arr = types.split(' ; ');	
			initialize2(ids_arr, coordinaten_arr, namen_arr, types_arr, 10, true, content, false, map_id);
		}  else {		  	
			loadMarkers();
		}		
	}

	function compare(type, first, confirmfirst){
		if(first != '' && confirmfirst != ''){
			if (first!=confirmfirst){
				$('#'+type).html('<span class="glyphicon glyphicon-remove-sign" style="color: red; font-size: 18px; margin-top:34px;"></span>');
			} else {
				$('#'+type).html('<span class="glyphicon glyphicon-ok-sign" style="color: green; font-size: 18px; margin-top:34px;"></span>');
			}
		} else {
			$('#'+type).html('');
		}
	}

	function processUpload(e) {
		$('#bestanden').html('');
		$('#infoCol').html('');
		var dt = e.dataTransfer || (e.originalEvent && e.originalEvent.dataTransfer);
	    var files = e.target.files || (dt && dt.files);
		if (files) {
		   	e.preventDefault();
		    e.stopPropagation();
		    /*UPLOAD FILES HERE*/  
		    var href = '/upload';	  
		    for (var i = 0; i < files.length; ++i) { 
		    	var formData = new FormData();
		    	var file = files[i];
		    	$('.progress').css('display', 'inherit');
		    	$('.progress-bar').css('width', '0%');
	        	var reader = new FileReader();
	        	reader.readAsDataURL(files[i]); 
	        	formData.append('filename', files[i]);     	
				$.ajax({
					xhr: function()
					{
						var xhr = new window.XMLHttpRequest();
						$('.progress').css('display', 'inherit');
						xhr.upload.addEventListener("progress", function(evt){
							if (evt.lengthComputable) {  
								var percentComplete = (evt.loaded / evt.total)*100;
								$('.progress-bar').css('width', percentComplete.toFixed(0)+'%');
							}
						}, false);
						return xhr; 
					}, 
						url: href,
						data: formData,
						processData: false,
						contentType: false,
						type: 'POST',
						dataType: 'json',
					}).done(function( data ) {						
						var uploads = '<li><a href="/download/'+data.filename+'" id="'+data.id+'" class="file_info""><span class="filename">'+data.filename+'<span></a></li>';
						$('#tellingOverlay .content #bestanden').prepend(uploads);			
						$('#tellingOverlayContainer, #tellingOverlay').addClass('visible');
						if (i == 1){
							var display = 'inherit';
						} else {
							var display = 'none';
						}
						$('#bestand-info-default').clone().appendTo('#infoCol').prop('id', 'file_'+data.id).css('display', display);
						var filename = data.filename.split('.');
						$('.progress').css('display', 'none');
						$('.progress-bar').css('width', '0%');
						/*var uploads = '<li><a href="/download/'+data.filename+'" target="_blank"><span class="glyphicon glyphicon-cloud-download"></span> <span class="filename">'+data.filename+'<span></a><a class="glyphicon glyphicon-remove" href="/remove_file/'+data.filename+'"></a></li>';
						$('#uploadedFiles').prepend(uploads);*/						
            $('#file_'+data.id+' input[name="naam"]').val(filename[0]);
            $('#file_'+data.id+' input[name="extension"]').val(filename[1]);
					});	
	        }  
	        var overlayWidth = $('#contentContainer').width();	 
	        $('#tellingOverlay').css('width', overlayWidth);     
			$('#tellingOverlay').css('right', '-'+$('body').width()+'px');
	        var rightMargin = (($('body').width() - overlayWidth) / 2);			
	        var orignalRightMargin = parseInt($('#tellingOverlay').css('right').replace('px', ""));		
	        var width = (rightMargin + -orignalRightMargin);
				$('#tellingOverlay').animate({
				   right: '+='+width,
				}, 400, function() {
					$('#infoCol .bestanden_clones').last().css('display', 'inherit');
					$('#bestanden li a.file_info').first().addClass('active');
			});			
	    }
	}
	
	
	function initialize(Lat, Lng, zoom, marker_set) {		
		geocoder = new google.maps.Geocoder();
		var infowindow = new google.maps.InfoWindow();
		var myLatlng = new google.maps.LatLng(Lat,Lng);
		var mapOptions = {
	    	center: myLatlng,
	        zoom: zoom,
	        mapTypeId: google.maps.MapTypeId.ROADMAP
	    };
	    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
		var input = /** @type {HTMLInputElement} */(document.getElementById('searchTextField'));
		var autocomplete = new google.maps.places.Autocomplete(input);
	  autocomplete.bindTo('bounds', map);	
	  var type = $('select[name=typeVoertuig] option:selected').val();
	  var url = getTypeUrl(type);	   
		var marker = new google.maps.Marker({
	   	map: map,
	   	draggable: true,
	  	icon: url
	  });
	  if (marker_set){
	  	marker.setPosition(myLatlng);
	  }
	 	$('#place').perfectScrollbar('update');
	  	google.maps.event.addListener(autocomplete, 'place_changed', function() {
	  		var place = autocomplete.getPlace();
		    infowindow.close();
		    input.className = '';	
		    $('.locCor').remove();
		    $('#infoOverlay #locatieNaam').val(place.formatted_address).after('<div style="font-size:smaller; color: #888" class="locCor">'+place.geometry.location+"</div>");
		    $('#infoOverlayContainer').css('display', 'inherit');
		});
		getMapInfo(map);
		google.maps.event.addListener(map, 'click', function(event) {
			geocoder.geocode({
		    	latLng: event.latLng,
		  	}, function(responses) {
		    	if (responses && responses.length > 0) {
			    	var place = responses[0];
			    	$('.locCor').remove();
					$('#infoOverlay #locatieNaam').val(place.formatted_address).after('<div style="font-size:smaller; color: #888" class="locCor">'+place.geometry.location+"</div>");
		    		$('#infoOverlayContainer').css('display', 'inherit');
				}
			});
		});	
		google.maps.event.addListener(map, 'zoom_changed', function(event) {  
      getMapInfo(map, "bewerken");
    });
    google.maps.event.addListener(map, 'dragend', function(event) { 
      getMapInfo(map, "bewerken");
    });
	}	
	function initialize2(ids, coordinaten, namen, types, zoom, marker, content, edit, mapId) {		
		geocoder = new google.maps.Geocoder();		
		var coordinaat_1 = coordinaten[0].replace('(','').replace(')', '');
		coordinaat_1_arr = coordinaat_1.split(', ');
		var myLatlng = new google.maps.LatLng(coordinaat_1_arr[0],coordinaat_1_arr[1]);	
		var infowindow = new google.maps.InfoWindow();
		var mapOptions = {
	  	center: myLatlng,
	    mapTypeId: google.maps.MapTypeId.ROADMAP,
	    zoom: zoom
	  };
	  map = new google.maps.Map(document.getElementById(mapId), mapOptions);
	  if(edit){
		  var input = /** @type {HTMLInputElement} */(document.getElementById('searchTextField'));
			var autocomplete = new google.maps.places.Autocomplete(input);
		  autocomplete.bindTo('bounds', map);
	  }	
	  var counter = 0;
	  var infoWindow = new google.maps.InfoWindow;
	  var marker = marker;
	  var bounds = new google.maps.LatLngBounds();
		coordinaten.forEach(function(coordinaat){
			var coordinaat_ = coordinaat.replace('(','').replace(')', '');
			coordinaat__arr = coordinaat_.split(', ');		
			var naam = '<div id="informationWindow"><div style="font-weight: bold; min-width: 300px;">'+namen[counter]+'</div><div style="font-size:smaller;font-style:italic;">Type telling: '+types[counter]+'</div></div>';
			var myLatlng = new google.maps.LatLng(coordinaat__arr[0],coordinaat__arr[1]);
			var type = types[counter];
			var url = getTypeUrl(type);		
			bounds.extend(myLatlng);
			var marker = new google.maps.Marker({
				position: myLatlng,
		   	map: map,
		   	icon: url,
		   	draggable: edit
		  });
		  marker.set('id', ids[counter]);				  	 	
		  markers[ids[counter]] = marker;
			bindInfoWindow(marker, map, infoWindow, naam);
			counter = counter + 1;			
			google.maps.event.addListener(marker, 'dragend', function() {
			    geocodePosition(marker.getPosition(),  marker.get("id"));
			});
		});
		getMapInfo(map);
		map.fitBounds(bounds);
		map.panToBounds(bounds);  
		$('#place').perfectScrollbar('update');
		  google.maps.event.addListener(map, 'zoom_changed', function(event) {  
      getMapInfo(map, "bewerken");
    });
    google.maps.event.addListener(map, 'dragend', function(event) { 
      getMapInfo(map, "bewerken");
    });
		google.maps.event.addListener(map, 'click', function(event) {
		   geocoder.geocode({
		    	latLng: event.latLng,
		  	}, function(responses) {
		    	if (responses && responses.length > 0) {
			    	var place = responses[0];
			    	$('.locCor').remove();
					$('#infoOverlay #locatieNaam').val(place.formatted_address).after('<div style="font-size:smaller; color: #888" class="locCor">'+place.geometry.location+"</div>");
		    		$('#infoOverlayContainer').css('display', 'inherit');
				}
			});
		});
		if (edit) {
			google.maps.event.addListener(autocomplete, 'place_changed', function() {
		  		var place = autocomplete.getPlace();
			    infowindow.close();
			    input.className = '';	
			    $('.locCor').remove();
			    $('#infoOverlay #locatieNaam').val(place.formatted_address).after('<div style="font-size:smaller; color: #888" class="locCor">'+place.geometry.location+"</div>");
			    $('#infoOverlayContainer').css('display', 'inherit');	  
			});
		}	  		
	}
	function placeMarker(location) {
		var type = $('#typeTelling option:selected').val();
		var info = $('#opmerkingLocatie').text(); 
		var url = getTypeUrl(type);		
		var d = new Date();
		var n = d.getTime();
		var marker = new google.maps.Marker({
		   	map: map,
		   	draggable: true,
		   	icon: url
		});		     
		marker.setPosition(location);
		marker.setVisible(true);
		var infoWindow = new google.maps.InfoWindow;
		geocoder.geocode({
		   	latLng: location
		}, function(responses) {
		 	if (responses && responses.length > 0) {
		   	var place = responses[0];
				$('#place').append('<div class=place id=place_'+n+'><strong>'+place.formatted_address+'</strong> <span class=subText>(Type: <span class="type_locatie">'+type+'</span>)</span> <span class="glyphicon glyphicon-remove remove_location" style="font-size: xx-small; color: #555; cursor: pointer" id="'+n+'"></span><div class="place_naam edit_place_naam">'+place.formatted_address+'</div><div class="place_coordinaten edit_place_coordinaten">'+place.geometry.location+'</div><div class="place_info edit_place_info">'+info+'</div></div>');	    
				$('#place_data').append('place_'+n+';'+type+';'+place.formatted_address+';'+place.geometry.location+';'+info+':');
				infoWindow.setContent(place.formatted_address);
				infoWindow.open(map, marker);
			}
		});
		marker.set('id', 'place_'+n);
		markers['place_'+n] = marker;
		$('#save_place').css('display','inline-block');
		$('#place').perfectScrollbar('update');
		google.maps.event.addListener(marker, "click", function() {   
		   	infoWindow.open(map, marker);
		});
		google.maps.event.addListener(marker, "dragstart", function() {   
		   	infoWindow.close();
		});
		google.maps.event.addListener(marker, 'dragend', function() {			
		    geocodePosition(marker.getPosition(),  marker.get("id"));		    
			setTimeout(function(){
			   	var test = $('#'+marker.get("id")+' .place_naam').html();
		   	setWindow(test);}, 100);	   
		});
		
		function setWindow(location){
			infoWindow.setContent(location);
			infoWindow.open(map, marker);
		}
	}
	function geocodePosition(pos, mid) {
		var response = geocoder.geocode({
	    	latLng: pos
	  	}, function(responses) {
	    	if (responses && responses.length > 0) {
	      		$('#'+mid+' strong').html(responses[0].formatted_address);	    
	    		$('#'+mid+' .place_naam').html(responses[0].formatted_address);
	    		$('#overlay #searchTextField').val(responses[0].formatted_address);
	    		$('#'+mid+' .place_coordinaten').text(pos);
	    		$('#place_data').html('');		    		
	    		$('.place').each(function(index){
					var text = $(this).attr('id')+';'+$(this).children('span').children('.type_locatie').text()+';'+$(this).children('.place_naam').text()+';'+$(this).children('.place_coordinaten').text()+';'+$(this).children('.place_info').text()+':';
					$('#place_data').append(text);
				});				
		    } else {
		    	marker.formatted_address = 'Cannot determine address at this location.';
		    	$('#'+mid+' strong').html('Plaats: <p><strong>We kunnen geen adres bepalen op deze locatie</strong></p>');	    
		    	$('#'+mid+' .place_naam').html('Plaats: <p><strong>We kunnen geen adres bepalen op deze locatie</strong></p>');
		    	$('#'+mid+' .place_coordinaten').text(pos);
		   	}			  		
		});	  	
		return response;
	}	  
	function loadMarkers(){
		var myLatlng = new google.maps.LatLng(Lat,Lng);
		var mapOptions = {
	   	center: myLatlng,
	    zoom: zoom,
	    mapTypeId: google.maps.MapTypeId.ROADMAP
	  };
	  var d = new Date();
	  var n = d.getTime();
		map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);	
		var input = /** @type {HTMLInputElement} */(document.getElementById('searchTextField'));
		var autocomplete = new google.maps.places.Autocomplete(input);
		autocomplete.bindTo('bounds', map);	
		var infoWindow = new google.maps.InfoWindow;
    var bounds = new google.maps.LatLngBounds();
    $.getJSON('/mapsMarkers/get', function(json){      
      var markersT = json.markers;
		  markersT.forEach(function(telling){			
  			var locaties = telling.locaties;
        for (index = 0; index < locaties.length; ++index) {
          var coordinaat = locaties[index].coordinaten;
          var coordinaat_ = coordinaat.replace('(','').replace(')', '');
          coordinaat__arr = coordinaat_.split(', ');
          var type = locaties[index].type;
          var url = getTypeUrl(type);     
          var naam = locaties[index].plaatsnaam;
          var myLatlng = new google.maps.LatLng(coordinaat__arr[0],coordinaat__arr[1]);     
          var marker = new google.maps.Marker({
            position: myLatlng,
            map: map,
            icon: url
          });     
          var d = new Date();
          var n = d.getTime();
          marker.set('id', 'place_'+n+'_'+index);
          markers['place_'+n+'_'+index] = marker;
          var html = '<div style="font-weight: bold; min-width: 300px; height: auto;"><a href="/view/'+telling.id+'" class="toOverlay">'+naam+'</a></div><p style="font-size: smaller">Aangemaakt op '+ telling.createdAt +' door <a style="font-size:smaller" href="/'+ telling.username +'">'+ telling.username +'</a>.</p>';
          bindInfoWindow(marker, map, infoWindow, html);
        };
      });
		});
		google.maps.event.addListener(map, 'zoom_changed', function(event) {	
			getMapInfo(map, "lijst");
		});
		google.maps.event.addListener(map, 'dragend', function(event) {	
			getMapInfo(map, "lijst");
		});
		$('#map-info').html('<p><strong>Noord Oost grens:</strong>'+bounds.getNorthEast()+'<br /><strong>Zuid West:</strong>'+bounds.getSouthWest()+'<div>Zoom-level: '+map.getZoom()+'</div></p>');
		google.maps.event.addListener(autocomplete, 'place_changed', function() {
	  		var place = autocomplete.getPlace();
		     // If the place has a geometry, then present it on a map.
		    if (place.geometry.viewport) {
		      map.fitBounds(place.geometry.viewport);
		    } else {
		      map.setCenter(place.geometry.location);
		      map.setZoom(17);  // Why 17? Because it looks good.
		    } 
		    loadLocationTelling(place.formatted_address);
		});
	}	
	function getMapInfo(map, page){
		bounds = map.getBounds();	
		var NE = bounds.getNorthEast().toString();
		var SW = bounds.getSouthWest().toString();
		
		//$('#map-info').html('<p><strong>Noord Oost grens:</strong>'+NE+'<br /><strong>Zuid West:</strong>'+SW+'<div>Zoom-level: '+map.getZoom()+'</div></p>');
		var coordinatenNE = NE.replace('(','').replace(')', '');
		coordinatenNE = coordinatenNE.split(', ');
		var coordinatenSW = SW.replace('(','').replace(')', '');
		coordinatenSW = coordinatenSW.split(', ');		
		if (map.getZoom()!=15){
		  if (page=="lijst") {
		    deleteMarkers();
		  };
		  $('#marker-container').html('');
			$.get('/getMarkersFilter/get', {latNE: coordinatenNE[0], lngNE: coordinatenNE[1], latSW: coordinatenSW[0], lngSW: coordinatenSW[1]}, function(json){							
				var infoWindow = new google.maps.InfoWindow;
				var bounds = new google.maps.LatLngBounds();
				var markersT = json.markers;
				markersT.forEach(function(telling){						 
				  var locaties = telling.locaties;
				  for (index = 0; index < locaties.length; ++index) {
				    if(!markers[locaties[index].id]){
  				    var coordinaat = locaties[index].coordinaten;
              var coordinaat_ = coordinaat.replace('(','').replace(')', '');
              coordinaat__arr = coordinaat_.split(', ');
              var type = locaties[index].type;
              var url = getTypeUrl(type);     
              var naam = locaties[index].plaatsnaam;
              var myLatlng = new google.maps.LatLng(coordinaat__arr[0],coordinaat__arr[1]);     
              var marker = new google.maps.Marker({
                position: myLatlng,
                map: map,
                icon: url
              });     
              /*var d = new Date();
              var n = d.getTime();
              marker.set('id', 'place_'+n+'_'+index);
              markers['place_'+n+'_'+index] = marker;*/
              marker.set('id', locaties[index].id);             
              markers[locaties[index].id] = marker;
              console.log(markers);
              if (page=="lijst") {
                var html = '<div style="font-weight: bold; min-width: 300px; height: auto;"><a href="/view/'+telling.id+'" class="toOverlay">'+naam+'</a></div><p style="font-size: smaller">Aangemaakt op '+ telling.createdAt +' door <a style="font-size:smaller" href="/'+ telling.username +'">'+ telling.username +'</a>.</p>';
              } else {
                var html = '<div id="informationWindow"><div style="font-weight: bold; min-width: 300px;">'+naam+'</div><p style="font-size: smaller">Aangemaakt op '+ telling.createdAt +' door <a style="font-size:smaller" href="/'+ telling.username +'">'+ telling.username +'</a>.</p><div style="font-size:smaller;font-style:italic;">Type telling: '+type+'</div>';
              }            
              bindInfoWindow(marker, map, infoWindow, html);
  				  };
  				 };
				});
				for(var key in markers){
				  $('#marker-container').append('<li>'+key+'</li>');
				};				
			});
		}
	}
	function bindInfoWindow(marker, map, infoWindow, html){
		google.maps.event.addListener(marker, 'click', function() {
	   infoWindow.setContent(html);
	   infoWindow.open(map, marker);
	  });
	}	
	function loadLocationTelling(location){
		$.post('/LocationTelling', {location: location}, function(data){
			$('#locationTelling').html(data.html);
		});
	}
	function getTypeUrl(type){
		if (type == 'OV-doorstromingsgegevens'){
		   	var url = '/images/bus.png';
		} else if (type == "OV-lijnvoering") {
		   	var url = '/images/busstop.png';
		} else if (type == "Kentekenregistratie"){
		   	var url = '/images/cctv.png';
		} else if (type == "Kruispunttelling"){
		  	var url = '/images/junction.png';
		} else if (type == "Snelheidsmeting"){
		   	var url = '/images/speed_50.png';
		} else if (type == "OV-cordontellingen"){
		   	var url = '/images/stargate-raw.png';
		} else if (type == "PermanenteDetectielus"){
		   	var url = '/images/street lus.png';
		} else if (type == "SlangDoorsnedetelling"){
		   	var url = '/images/street slang.png';
		}
		return url; 
	}
	// Sets the map on all markers in the array.
	// Sets the map on all markers in the array.
  function setAllMap(map) {
    for (var key in markers) {
      markers[key].setMap(map);
    }
  }
  
  // Removes the markers from the map, but keeps them in the array.
  function clearMarkers() {
    setAllMap(null);
  }
  
  // Shows any markers currently in the array.
  function showMarkers() {
    setAllMap(map);
  }
  
  // Deletes all markers in the array by removing references to them.
  function deleteMarkers() {
    clearMarkers();
    markers = {};
  }
