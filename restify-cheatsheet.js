// Restify CheatSheet.
// More about the API: http://mcavage.me/node-restify/
// Install restify with npm install restify


// 1. Creating a Server.
// http://mcavage.me/node-restify/#Creating-a-Server


var restify = require('restify');

var server = restify.createServer({
  certificate: null,     // If you want to create an HTTPS server, pass in the PEM-encoded certificate and key
  key: null,             // If you want to create an HTTPS server, pass in the PEM-encoded certificate and key
  formatters: null,      //  Custom response formatters for res.send()
  log: null,             // You can optionally pass in a bunyan instance; not required
  name: 'node-api',      // By default, this will be set in the Server response header, default is restify
  spdy: null,            // Any options accepted by node-spdy
  version: null,         // A default version to set for all routes
  handleUpgrades: false  // Hook the upgrade event from the node HTTP server, pushing Connection: Upgrade requests through the regular request handling chain; defaults to false
});

server.listen(3000, function () {
  console.log('%s listening at %s', server.name, server.url);
});


// 2. Use Common Handlers.
// Note that restify runs handlers in the order they are registered on a server.
// http://mcavage.me/node-restify/#Common-handlers:-server.use()


server.use(restify.fullResponse());  // sets up all of the default headers for the system
server.use(restify.bodyParser());    // remaps the body content of a request to the req.params variable, allowing both GET and POST/PUT routes to use the same interface


// 3. Routing.
// http://mcavage.me/node-restify/#Routing


// You are responsible for calling next() in order to run the next handler in the chain.
function send(req, res, next) {
  res.send('hello ' + req.params.name);
  return next();
}
 
function rm(req, res, next) {
  res.send(204);
  return next();
}
 
server.post('/hello', send);
server.put('/hello', send);
server.get('/hello/:name', send);
server.head('/hello/:name', send);
server.del('hello/:name', rm);

// You can also pass in a RegExp object and access the capture group with req.params (which will not be interpreted in any way).
server.get(/^\/([a-zA-Z0-9_\.~-]+)\/(.*)/, function(req, res, next) {
  console.log(req.params[0]);
  console.log(req.params[1]);
  res.send(200);
  return next();
});
