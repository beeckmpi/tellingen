module.exports = function(req, res, next) {
	if(req.session.passport.user) {
		return next();
	} else return res.redirect("/");
};