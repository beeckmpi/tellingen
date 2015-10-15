/**
 * UserController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */
var passport = require('passport'), http = require('passport-http'), bcrypt = require('bcrypt-nodejs');	
module.exports = {
	'index' : function(req, res) {
		User.find().sort('username DESC').exec(function(err, accounts){
			accounts.forEach(function(account){
				helper.getDate(account, {createdAt:'dateTime'});
			});	
			res.render('user/index', {accounts: accounts, user: req.user}, function(err, string){
				res.json({html:string});
			});
		});
	},
	'login' : function(req, res, next) {
		passport.authenticate('local', function(err, user, info) {
			if (err) { 
		    	console.log('logged fail!!');
		    	res.redirect('/'); 
        		res.send(err); 
        		res.json({'succes': false, 'error': err}); 
        	} else {
				req.logIn(user, function(err) {
					if(err){
						res.json({'succes': false, 'error': err}); 
					} else {
		      			res.json({'succes': true, 'error': false});
		      		}      	
				});
			}
	    })(req, res);
	},
	'logout': function (req,res){
		req.logout();
    	res.redirect('/'); 
  	},
  	'add': function (req, res){
  		res.render('user/add', {user: req.user}, function(err, string){
			res.json({html:string});
		});
  	},
  	'edit': function (req, res){
  		var username = req.param('username');
  		var organisatie = new Array("DL", "PA", "SA", "VC", "AWV");
		switch (req.user.organisatie){
			case "DL": organisatie['DL'] = 'selected=selected';
			break;
			case "PA" : organisatie['PA'] = 'selected=selected';
			break;
			case "SA" : organisatie['SA'] = 'selected=selected';
			break;
			case "VC" : organisatie['VC'] = 'selected=selected';
			break;
			case "AWV" : organisatie['AWV'] = 'selected=selected';
		}
  		User.findOne({username: username}).done(function (err, account) {
  			res.render('user/edit', {user: req.user, account: account, organisatie: organisatie}, function(err, string){
				res.json({html:string});
			});
  		});		
	},
	'settings': function (req, res){
		var organisatie = new Array("DL", "PA", "SA", "VC", "AWV");
		switch (req.user.organisatie){
			case "DL": organisatie['DL'] = 'selected=selected';
			break;
			case "PA" : organisatie['PA'] = 'selected=selected';
			break;
			case "SA" : organisatie['SA'] = 'selected=selected';
			break;
			case "VC" : organisatie['VC'] = 'selected=selected';
			break;
			case "AWV" : organisatie['AWV'] = 'selected=selected';
		}
		res.view('user/settings', {user: req.user, organisatie: organisatie});
	},
	'profile' : function (req, res) {
		var username = req.param('username');
		User.findOne({username: username}).done(function (err, user) {
			if (err) return res.send(err,500);
			if(user == undefined) {
				return res.send('User not found',500);
			}
			Telling.find({username: username}).limit(20).sort('createdAt DESC').exec(function(err, tellingen){
				tellingen.forEach(function(telling){
					helper.getDate(telling, {createdAt:'dateTime', updatedAt: 'dateTime', datumTelling: 'date', datumTelling_van: 'date', datumTelling_tot: 'date'});
					if (telling.locaties != undefined){
					var locaties = telling.locaties;
					var locatie_namen = '';
					locaties.forEach(function(locatie){
						if (locatie_namen != ''){
							locatie_namen = locatie_namen + ' ; ' + locatie.plaatsnaam;
							locatie_coordinaten = locatie_coordinaten + ' ; ' +  locatie.coordinaten;
							locatie_types = locatie_types + ' ; ' +  locatie.type;
						} else {
							locatie_namen = locatie.plaatsnaam;
							locatie_coordinaten = locatie.coordinaten;
							locatie_types = locatie.type;
						}				
					});
					telling.locatie_namen = locatie_namen;
					telling.locatie_coordinaten = locatie_coordinaten;
					telling.types = locatie_types;
				};
				});				
				if(req.isJson){
					if (req.user.username!=req.param('username')){
						res.render('user/profile', {user: req.user, account: user, edit : false, tellingen: tellingen}, function(err, string){
							res.json({html:string});
						});
					} else {
						res.render('user/profile', {user: req.user, account: user, edit : true, tellingen: tellingen}, function(err, string){
							res.json({html:string});
						});
					}
				} else {
					if (req.user.username!=req.param('username')){				
						res.view('user/profile', {user: req.user, account: user, edit : false, tellingen: tellingen});
					} else {
						res.view('user/profile', {user: req.user, account: user, edit : true, tellingen: tellingen})
					}
				}
			});	
			
		});
	},
	'settingsUpdate' : function (req, res) {
		var data = req.param('data');		
		if (data.type == 'password'){
			User.findOne({_id: req.session.passport.user}).done(function (err, user) {
				var success = bcrypt.compareSync(data.oldPassword, user.password);
				if (success) {
					user.password = data.password;
					user.save(function (err) {
       					if (err) {
       						console.log('');
       						return res.json({err: 'Het nieuwe wachtwoord voldoet niet aan de juiste vereisten: het moet minstens 6 tekens lang zijn.'});
       					} 
       					res.json({success: true, err: ''});						
					});
				} else {
					return res.json({success: false, err: 'Het oud wachtwoord is niet correct! ' +success});
				}
			});			
		} else {
			User.update({
				_id: req.session.passport.user
			},
			data, 
			function (err, user) {
				// Error handling
				if (err) return res.json({success: false, err: err});
				// Updated user successfully!
				res.json({success: true, err: ''});
			});
		}
	}
};

module.exports.blueprints = {
 
  // Expose a route for every method,
  // e.g.
  // `/auth/foo` =&gt; `foo: function (req, res) {}`
  actions: true,
 
  // Expose a RESTful API, e.g.
  // `post /auth` =&gt; `create: function (req, res) {}`
  rest: true,
 
  // Expose simple CRUD shortcuts, e.g.
  // `/auth/create` =&gt; `create: function (req, res) {}`
  // (useful for prototyping)
  shortcuts: true
 
};


