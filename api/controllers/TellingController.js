/**
 * TellingController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */
var mongo = require('mongodb');
var server = new mongo.Server('127.0.0.1', 27017, {auto_reconnect: true});
var db1 = new mongo.Db('tellingen', server);
db1.open(function (err) {});
module.exports = {
  /* e.g.
  	De standaard lijst op de index pagina
  */
	'lijst': function (req, res){
		Telling.find().limit(50).sort('createdAt DESC').exec(function(err, tellingen){
			tellingen.forEach(function(telling){				
				// helper functies in services/helper.js
				helper.getDate(telling, {createdAt:'dateTime', updatedAt: 'dateTime', datumTelling: 'date', datumTelling_van: 'date', datumTelling_tot: 'date'});
				if (telling.locaties != undefined){
					helper.locaties(telling);
				};
			});			
			if(req.wantsJson || req.isAjax){
				res.render('telling/index', {tellingen: tellingen, user: req.user, ajax: true}, function(err, string){
					res.json({html:string});
				});
			} else {
				res.view('telling/index', {tellingen: tellingen, user: req.user, ajax: false});
			}
		});		
	},
	'ingeven': function (req, res){
		if(req.wantsJson || req.isAjax){
			res.render('telling/ingeven', {user: req.user}, function(err, string){
				res.json({html:string});
			});
		} else {
			res.view('telling/ingeven', {user: req.user});
		}
	},
	'create': function(req, res){
		var datumTelling = req.param('datumTelling').split('/');	
		var datumTelling_van = req.param('datumTelling_van').split('/');
		var datumTelling_tot = req.param('datumTelling_tot').split('/');	
		var locatie_arr = new Array();
		var locaties = req.param('locaties').split(':');
		locaties.forEach(function(location){
			if (location != ''){
				var locatie = location.split(';');
				var coordinaten = locatie[3].replace('(','').replace(')', '');
				coordinaten = coordinaten.split(', ');
				var locatie_obj = {'id': locatie[0], 'type': locatie[1], 'plaatsnaam': locatie[2], 'coordinaten': locatie[3], 'lat': parseFloat(coordinaten[0]), 'lng':parseFloat(coordinaten[1]), 'info': locatie[4]};
				locatie_arr.push(locatie_obj);
			}
		});
		Telling.create({
			username: req.user.username,
			type_ingave: req.param('type_ingave'),
			tellingId: req.param('tellingId'),
			telZichtbaar: req.param('telZichtbaar'),
			emailZichtbaar: req.param('emailZichtbaar'),
			priveOpmerkingen: req.param('priveOpmerkingen'),
			locaties: locatie_arr,
			typeTelling: req.param('typeTelling'),
			kmpunt: req.param('kmpunt'),
			datumType: req.param('datumType'),
			datumTelling: new Date(datumTelling[2], datumTelling[1]-1, datumTelling[0], 0, 0, 0),
			datumTelling_van: new Date(datumTelling_van[2], datumTelling_van[1]-1, datumTelling_van[0], 0, 0, 0),
			datumTelling_tot: new Date(datumTelling_tot[2], datumTelling_tot[1]-1, datumTelling_tot[0], 0, 0, 0),
			data: req.param('data'),
			opmerkingen: req.param('opmerkingen'),
			filenames: req.param('filenames')
		}).done(function(err, telling){
			Statistieken.create({telling_id: telling.id, username: req.user.username, type: 'create', title: telling.locatie_naam}).done(function(err, stat){
				if (err) console.log(err);
			});
			Logs.create({telling_id:  telling.id, username: req.user.username, type: 'create', title: telling.locatie_naam}).done(function(err, log){
				if (err) console.log(err);
			});
			if (err) {
				console.log(err);
			} else {
				// helper functies in services/helper.js
				helper.getDate(telling, {createdAt:'dateTime', updatedAt: 'dateTime', datumTelling: 'date', datumTelling_van: 'date', datumTelling_tot: 'date'});
				helper.locaties(telling);
				User.findOne({username: telling.username}, function(err, account){
					if(req.wantsJson || req.isAjax){
						res.render('telling/telling', {data: telling, user: req.user, account: account, ajax: true}, function(err, string){
							if (err) console.log(err);
							return res.json({html:string, id: telling.id});
						});
					} else {
						res.view('telling/telling', {data: telling, user: req.user, account: req.user, ajax: false});
					}
				});			
			}
		});
	}, 
	'view': function(req, res){
		var id = req.param('id');
		var user = req.user.username;
		Telling.findOne({_id: id}).done(function (err, telling) {
		 
			if (telling.username != user){
				Statistieken.create({telling_id: id, username: user, type: 'view', title: telling.locatie_naam}).done(function(err, stat){
					if (err) console.log(err);
				});
				Logs.create({telling_id: id, username: user, type: 'view', title: telling.locatie_naam}).done(function(err, log){
					if (err) console.log(err);
				});
				Telling.update({_id: id}, {$inc : {viewed: 1}}, function (err,telling2) {
					if (err) console.log(err);
				});
				Notifications.create({telling_id: id, by: user, for: telling.username, type: 'view', title: telling.locatie_naam}).done(function(err, log){
					if (err) console.log(err);
				});
			}
			// Zet datums in het goede formaat. Berekeningen in services/helper.js
			helper.getDate(telling, {createdAt:'dateTime', updatedAt: 'dateTime', datumTelling: 'date', datumTelling_van: 'date', datumTelling_tot: 'date'});			
			helper.locaties(telling);
			User.findOne({username: telling.username}, function(err, account){
				if(req.wantsJson || req.isAjax){
					res.render('telling/telling', {data: telling, user: req.user, account: account, ajax: true}, function(err, string){
						res.json({html:string});
					});	
				} else {
					res.view('telling/telling', {data: telling, user: req.user, account: account, ajax: false});
				}			
			});			
		});
	}, 
	'bewerken': function(req, res){
		var id = req.param('id');		
		Telling.findOne({_id: id}).done(function (err, telling) {
			var type_ingave = {opvragen: "", uploaden: ""};
			if (telling.type_ingave === "opvragen"){
				type_ingave.opvragen = "selected=true";
			} else if (telling.type_ingave === "uploaden"){
				type_ingave.uploaden = "selected=true";
			}
			telling.type_ingave = type_ingave;
			if (telling.telZichtbaar == "on"){
				telling.telZichtbaar = "checked=checked";
			}
			if (telling.emailZichtbaar == "on"){
				telling.telZichtbaar = "checked=checked";
			}
			var datumTypeData = {'een': "", 'v_t': "", 'jaarlijks': ''};
			if (telling.datumType == "1"){
				datumTypeData.een = "selected=true";
			} else if (telling.datumType == "v_t"){
				datumTypeData.v_t = "selected=true";
			} else if (telling.datumType == "jaarlijks"){
				datumTypeData.jaarlijks = "selected=true";
			}
			var data = {ongecontroleerd: "", gecontroleerd: ""};
			if (telling.data == "ongecontroleerd"){
				data.opvragen = "selected=true";
			} else if (telling.data == "gecontroleerd"){
				data.gecontroleerd = "selected=true";
			}
			telling.data = data;
			// Zet datums in het goede formaat. Berekeningen in services/helper.js
			helper.getDate(telling, {createdAt:'dateTime', updatedAt: 'dateTime', datumTelling: 'date', datumTelling_van: 'date', datumTelling_tot: 'date'});
			telling.datumType = datumTypeData;
			helper.locaties(telling);
			User.findOne({username: telling.username}, function(err, account){
				if(req.wantsJson || req.isAjax){
					res.render('telling/bewerken', {telling: telling, user: req.user}, function(err, string){
						res.json({html:string});
					});
				} else {
					res.view('telling/bewerken', {telling: telling, user: req.user, account: account});
				}
			});			
		});
	},
	'save': function(req, res) {
		var id = req.param('id');
		var datumTelling = req.param('datumTelling').split('/');
		var datumTelling_van = req.param('datumTelling_van').split('/');
		var datumTelling_tot = req.param('datumTelling_tot').split('/');
		var locatie_arr = new Array();
		var locaties = req.param('locaties').split(':');
		locaties.forEach(function(location){
			if (location != ''){
				var locatie = location.split(';');
        var coordinaten = locatie[3].replace('(','').replace(')', '');
        coordinaten = coordinaten.split(', ');
				var locatie_obj = {'id': locatie[0], 'type': locatie[1], 'plaatsnaam': locatie[2], 'coordinaten': locatie[3], 'lat': parseFloat(coordinaten[0]) , 'lng':parseFloat(coordinaten[1]), 'info': locatie[4]};
				locatie_arr.push(locatie_obj);
			}
		});
		var data = {
			edit_username: req.user.username,
			type_ingave: req.param('type_ingave'),
			tellingId: req.param('tellingId'),
			telZichtbaar: req.param('telZichtbaar'),
			emailZichtbaar: req.param('emailZichtbaar'),
			priveOpmerkingen: req.param('priveOpmerkingen'),
			locaties: locatie_arr,
			typeTelling: req.param('typeTelling'),
			kmpunt: req.param('kmpunt'),
			datumType: req.param('datumType'),
			datumTelling: new Date(datumTelling[2], datumTelling[1]-1, datumTelling[0], 0, 0, 0),
			datumTelling_van: new Date(datumTelling_van[2], datumTelling_van[1]-1, datumTelling_van[0], 0, 0, 0),
			datumTelling_tot: new Date(datumTelling_tot[2], datumTelling_tot[1]-1, datumTelling_tot[0], 0, 0, 0),
			data: req.param('data'),
			opmerkingen: req.param('opmerkingen'),
			filenames: req.param('filenames')
		};
		Telling.update({
			_id: id
		},
		data, 
		function (err, tellingen) {
			// Error handling
			if (err) return res.json({success: false, err: err});
			// Updated user successfully!			
			tellingen.forEach(function(telling){
				Statistieken.create({telling_id: telling.id, username: req.user.username, type: 'edit', title: telling.locatie_naam}).done(function(err, stat){
					if (err) console.log(err);
				});
				Logs.create({telling_id: telling.id, username: req.user.username, type: 'edit', title: telling.locatie_naam}).done(function(err, log){
					if (err) console.log(err);
				});
				if (err) {
          console.log(err);
        } else {
          // helper functies in services/helper.js
          helper.getDate(telling, {createdAt:'dateTime', updatedAt: 'dateTime', datumTelling: 'date', datumTelling_van: 'date', datumTelling_tot: 'date'});
          helper.locaties(telling);
          User.findOne({username: telling.username}, function(err, account){
            if(req.wantsJson || req.isAjax){
              res.render('telling/telling', {data: telling, user: req.user, account: account, ajax: true}, function(err, string){
                if (err) console.log(err);
                return res.json({html:string, id: telling.id});
              });
            } else {
              res.view('telling/telling', {data: telling, user: req.user, account: req.user, ajax: false});
            }
          });     
        }
			});
		});
	}, 
	'mapsMarkers': function(req, res){
		Telling.find().limit(100).done(function(err, tellingen){
			tellingen.forEach(function(telling){
				helper.getDate(telling, {createdAt:'dateTime', updatedAt: 'dateTime', datumTelling: 'date', datumTelling_van: 'date', datumTelling_tot: 'date'});
			});
			res.json({markers:tellingen});		
		});	
	},
	'getMarkersFilter': function(req, res){
		Telling.find(			{
				"locaties.0.lat": 
					{
						$lt: parseFloat(req.param('latNE')), 
						$gt: parseFloat(req.param('latSW'))
					},
				"locaties.0.lng": 
					{
						$lt: parseFloat(req.param('lngNE')), 
						$gt: parseFloat(req.param('lngSW'))
					}
			}).limit(100).done(function(err, tellingen){
				tellingen.forEach(function(telling){
          helper.getDate(telling, {createdAt:'dateTime', updatedAt: 'dateTime', datumTelling: 'date', datumTelling_van: 'date', datumTelling_tot: 'date'});
        });
				res.json({markers:tellingen, err: err});	
		});
		
	},
	'locationTelling': function(req,res){
		var location = req.param('location');
		db1.collection('telling').find({"locaties.plaatsnaam": {$regex : ".*"+location+".*"}}).toArray(function(err, tellingen){
			tellingen.forEach(function(telling){		
				// Zet datums in het goede formaat. Berekeningen in api/services/helper.js
				helper.getDate(telling, {createdAt:'dateTime', updatedAt: 'dateTime', datumTelling: 'date', datumTelling_van: 'date', datumTelling_tot: 'date'});
				if (telling.locaties != undefined){
					helper.locaties(telling);
				};
			});			
			res.render('telling/lijst', {tellingen: tellingen, user: req.user}, function(err, string){
				if (err) console.log(err);
				return res.json({html:string, tellingen: tellingen});
			});	
		});
	},
	'most_viewed': function(req,res){
		Telling.find({viewed: {$exists: 1}}).sort('viewed DESC').exec(function(err, tellingen){
			res.render('stats/most_viewed', {tellingen: tellingen, user: req.user}, function(err, string){
				if (err) console.log(err);	
				res.json({html:string});
			});
		});
	},
	'set_coord': function(req, res){
		Telling.find().done(function(err, tellingen){
			tellingen.forEach(function(telling){
				telling.locaties.forEach(function(locatie){
					var coordinaten = locatie.coordinaten.slice(1, -1);
					var coordinaten = coordinaten.split(', ');
					locatie.lat = parseFloat(coordinaten[0]);
					locatie.lng = parseFloat(coordinaten[1]);
				});
				telling.save(function (err) {
       				if (err) {
       					console.log(err);
       					return res.json({err: 'foutje.'});
       				} 
       				res.json({success: true, err: ''});						
				});	
			});
			//res.json({markers:tellingen});	
			
		});	
	}
};

