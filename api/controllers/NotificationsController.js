/**
 * NotificationsController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {
	'index': function(req, res){
		var username = req.param('username');
		Notifications.find({username: username}).sort('createdAt DESC').done(function(err, notifications){
			res.view('notifications/index', {data: notifications, user: req.user, account: req.user, filter: false});
		});		
	}
}