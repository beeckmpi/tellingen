/**
 * TellingController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {
	'index': function(req,res) {
		var load_more = false;
		if (req.param('filter') != undefined){
			var filter = req.param('filter');			
			if (filter != 'alles'){
				if (req.param('id') != undefined){
					Logs.findOne({id: req.param('id')}).done(function(err, log){
						var search = {type: filter, createdAt: {'<': log.createdAt}};
					});					;
					
					var load_more = true;
				} else {
					var search = {type: filter};
				}
			} else {
				var search = {};
				if (req.param('id') != undefined){
					Logs.findOne({id: req.param('id')}).done(function(err, log){
						if (err) console.log(err);
						console.log(log);
						var createdAt = new Date(log.createdAt);
						search = {createdAt: {'<': createdAt}};
					});
					var load_more = true;
				} else {
					var search = {type: 'edit'};
				}				
			}						
			var filter = true;
		} else {
			var search = {};
			var filter = false;
			var load_more = false;
		}		
		Logs.find().where(search).limit(30).sort('createdAt DESC').exec(function(err, logs){
			if (err) console.log(err);	
			logs.forEach(function(log){
				var createdAt = helper.getDate(log, {createdAt:'dateTime'});
				log.createdAt = createdAt.dagnr+'/'+createdAt.maand+'/'+createdAt.jaar+' '+createdAt.currentHours + ":" + createdAt.currentMinutes;
			});
			
			if (err) console.log(err);	
			res.render('logs/index', {logs: logs, user: req.user, filter: filter, load_more: load_more}, function(err, string){
				if (err) console.log(err);	
				res.json({html:string});
			});
		});	
	},		
}
