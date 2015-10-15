/**
 * DefaultController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */

module.exports = {

  /* e.g.
  sayHello: function (req, res) {
    res.send('hello world!');
  }
  */
  'index': function (req, res){
		res.view('home/index', {user: req.user});
	}

};
