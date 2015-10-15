exports.locaties = function(db_obj) {
	var locaties = db_obj.locaties;
	var locatie_namen = '', locatie_vol, locatie_types, locatie_ids, locatie_coordinaten,  locatie_info = '';
	var locatie_vol = "";
	locaties.forEach(function(locatie){
		if (locatie.id != 'undefined'){
			if (locatie_namen != ''){
				locatie_ids = locatie_ids + ' ; ' + locatie.id;
				locatie_namen = locatie_namen + ' ; ' + locatie.plaatsnaam;
				locatie_coordinaten = locatie_coordinaten + ' ; ' +  locatie.coordinaten;
				locatie_types = locatie_types + ' ; ' +  locatie.type;
				locatie_info = locatie_info + ' ; ' + locatie.info;
			} else {
				locatie_ids = locatie.id;
				locatie_namen = locatie.plaatsnaam;
				locatie_coordinaten = locatie.coordinaten;
				locatie_types = locatie.type;
				locatie_info = locatie.info;
			}				
			locatie_vol = locatie_vol + locatie.id +';'+locatie.type+';'+locatie.plaatsnaam+';'+locatie.coordinaten+';'+locatie.info+':';
		}
	});
	db_obj.locatie_vol = locatie_vol;
	db_obj.locatie_ids = locatie_ids;
	db_obj.locatie_namen = locatie_namen;
	db_obj.locatie_coordinaten = locatie_coordinaten;
	db_obj.types = locatie_types;
	db_obj.info = locatie_info;
};	

exports.getDate = function(db_obj, date_obj) {		
	for (var key in date_obj){
		var currentTime = db_obj[key];
		var dagnr = currentTime.getDate(); 	
		var maand = currentTime.getMonth();
		var jaar = currentTime.getFullYear();
		var currentHours = currentTime.getHours();
		var currentMinutes = currentTime.getMinutes();
		maand = ( maand < 9 ? "0" : "" ) + (maand+1);	
	   	currentMinutes = (currentMinutes < 10 ? "0" : "" ) + currentMinutes;
		if (date_obj[key] == 'date'){
			db_obj[key] = dagnr+'/'+maand+'/'+jaar;
		} else if (date_obj[key] == 'dateTime'){
			db_obj[key] = dagnr+'/'+maand+'/'+jaar+' '+currentHours + ":" + currentMinutes;
		}
	}	
};