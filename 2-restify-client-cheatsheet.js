// Restify Client CheatSheet.
// More about the API: http://mcavage.me/node-restify/#client-api
// Install restify with npm install restify


var restify = require('restify');


// 1. JsonClient.
// Sends and expects application/json.
// http://mcavage.me/node-restify/#JsonClient


// options: accept, connectTimeout, requestTimeout, dtrace, gzip, headers, log, retry, signRequest, url, userAgent, version.
var client = restify.createJsonClient();  // 

client.get(path, function(err, req, res, obj) {});           // Performs an HTTP get; if no payload was returned, obj defaults to {} for you (so you don't get a bunch of null pointer errors).
client.head(path, function(err, req, res) {});               // Just like get, but without obj.
client.post(path, object, function(err, req, res, obj) {});  // Takes a complete object to serialize and send to the server.

