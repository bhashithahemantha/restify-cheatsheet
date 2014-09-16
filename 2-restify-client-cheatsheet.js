// Restify Client CheatSheet.
// More about the API: http://mcavage.me/node-restify/#client-api
// Install restify with npm install restify


var restify = require('restify');


// 1. JsonClient.
// Sends and expects application/json.
// http://mcavage.me/node-restify/#JsonClient


// options: accept, connectTimeout, requestTimeout, dtrace, gzip, headers, log, retry, signRequest, url, userAgent, version.
var client = restify.createJsonClient(options);  // 

client.get(path, function(err, req, res, obj) {});           // Performs an HTTP get; if no payload was returned, obj defaults to {} for you (so you don't get a bunch of null pointer errors).
client.head(path, function(err, req, res) {});               // Just like get, but without obj.
client.post(path, object, function(err, req, res, obj) {});  // Takes a complete object to serialize and send to the server.
client.put(path, object, function(err, req, res, obj) {});   // Just like post.
client.del(path, function(err, req, res) {});                // del doesn't take content, since you know, it shouldn't.


// 2. StringClient.
// http://mcavage.me/node-restify/#StringClient


// options: accept, connectTimeout, requestTimeout, dtrace, gzip, headers, log, retry, signRequest, url, userAgent, version.
var client = restify.createStringClient(options);

client.get(path, function(err, req, res, data) {});           // Performs an HTTP get; if no payload was returned, data defaults to '' for you (so you don't get a bunch of null pointer errors).
client.head(path, function(err, req, res) {});                // Just like get, but without data.
client.post(path, object, function(err, req, res, data) {});  // Takes a complete object to serialize and send to the server.
client.put(path, object, function(err, req, res, data) {});   // Just like post.
client.del(path, function(err, req, res) {});                 // del doesn't take content, since you know, it shouldn't.