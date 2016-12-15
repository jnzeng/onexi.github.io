var http = require('http');
var url = require('url');
var address = 'mongodb://localhost:27017/test';

var server = http.createServer(function(request,response){

	// get parameters from URL query string
	var url_parts = url.parse(request.url, true);
	var params = url_parts.query;

	// check input
	console.log('params: ' + JSON.stringify(params));

	// build farm query and call find farms
	var query = buildQuery(params.inventoryCategory,params.season);
	console.log('query: ' + JSON.stringify(query));
	response.writeHead(200, {'content-type': 'text/plain'});
	findFarms(response, query);
});

var findFarms = function(response, query){

	var MongoClient = require('mongodb').MongoClient;
	var format = require('util').format;

	MongoClient.connect(address, function(err, db) {
		if(err) { throw err; }

		var results = null;    
		var collection = db
			.collection('farmTest')
			.find(query, {name:1,latitude:1,longitude:1})
			.limit(10)
			.toArray(function(err, docs) {
				//console.dir(docs);
				results = JSON.stringify(docs);    
				response.end(results);
		});
	});
};

var seasonRegEx = function(season){
	switch(season){
		case 'winter':
			return '{ "$regex" : "^.{0}(1)" }';
		case 'spring':
			return '{ "$regex" : "^.{1}(1)" }';
		case 'summer':
			return '{ "$regex" : "^.{2}(1)" }';
		case 'fall':
			return '{ "$regex" : "^.{3}(1)" }';
		default:
			throw 'error: season is missing';
	}
};

var buildQuery = function(inventoryCategory, season){
	season = seasonRegEx(season);
	var objString = '{"' + inventoryCategory + '":' + season + '}';
	var obj = JSON.parse(objString);
	return obj;
};

server.listen(8000);
console.log('Server running at http://localhost:8000');