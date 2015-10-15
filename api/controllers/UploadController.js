/**
 * TellingController
 *
 * @module		:: Controller
 * @description	:: Contains logic for handling requests.
 */
var mongo = require('mongodb');
var fs      = require('fs');
var Grid = require('gridfs-stream');
var server = new mongo.Server('127.0.0.1', 27017, {auto_reconnect: true});
var db1 = new mongo.Db('tellingen', server);
 var gfs = Grid(db1, mongo);
db1.open(function (err) {
  if (err) return handleError(err);
 

  // all set!
});
  // all set!

module.exports = {
	'upload' : function(req, res) {
		var tempfile    = req.files.filename.path;
	 	var origname    = req.files.filename.name;
		var writestream = gfs.createWriteStream({ filename: origname });
		fs.createReadStream(tempfile)
			.on('close', function(file) {
			})
			.on('error', function(error) {
				res.json({upload: 'ERR', error: error, user: req.user});
		  })
			// and pipe it to gfs
			.pipe(writestream);		
			writestream.on('close', function (file) {
        // do something with `file`
        res.json({upload: 'OK', id: file._id, filename: origname});
      });
	},
	'edit_files': function(req, res){
	  var id = req.param('id');
	  var data = req.param('data');
		db1.collection('fs.files').update({_id: id}, {$set: {filename: req.param('naam')+'.'+req.param('extension')}}, function(err, file){
		  if(err) return {'html': false};
		  Upload.create({filename: req.param('naam')+'.'+req.param('extension')}).done(function(err, upload){
         if (err) console.log(err);
         res.json({upload: 'OK', id: upload.id, filename: req.param('naam')+'.'+req.param('extension'), user: req.user, upload: upload.createdAt});
      });
		});
	},
	'download': function(req,res) {
			Telling.contains({filenames: req.param('filename')}, function(err, tellingen){
				if (err) res.json({err: err});
				tellingen.forEach(function(telling){
					Statistieken.create({telling_id: telling.id, username: req.user.username, type: 'download', title: req.param('filename')}).done(function(err, stat){
						if (err) console.log(err);
					});
					Logs.create({telling_id:  telling.id, username: req.user.username, type: 'download', title: req.param('filename')}).done(function(err, log){
						if (err) console.log(err);
					});					
				});				
			});
			gfs.exist({filename: req.param('filename')}, function (err, found) {
        if (err) return handleError(err);
        found ? gfs.createReadStream({ filename: req.param('filename') }).pipe(res) : console.log('File does not exist');
      });	
	},
	'remove': function(req, res){
		gfs.remove({filename: req.param('filename')}, function (err){
			if (err) res.json({error: err});
			res.json({success: 'true', filename: req.param('filename')});
			Telling.contains({filenames: req.param('filename')}, function(err, tellingen){
				if (err) console.log(err);
				tellingen.forEach(function(telling){
					Statistieken.create({telling_id: telling.id, username: req.user.username, type: 'remove', title: req.param('filename')}).done(function(err, stat){
						if (err) console.log(err);
					});
					Logs.create({telling_id:  telling.id, username: req.user.username, type: 'remove', title: req.param('filename')}).done(function(err, log){
						if (err) console.log(err);
					});
					var filenames = telling.filenames;
					var filename = req.param('filename');
					filenames = filenames.replace(filename+',', '');
					filenames = filenames.replace(filename, '');
					telling.filenames = filenames;
					telling.save(function(err){
						if (err) return console.log(err);
					});
				});				
			});			
		});
	}
};