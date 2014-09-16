// Restify CheatSheet.
// More about the API: http://mcavage.me/node-restify/
// Install restify with npm install restify


// 1.1. Creating a Server.
// http://mcavage.me/node-restify/#Creating-a-Server


var restify = require('restify');

// A restify server has the following properties on it: name, version, log, acceptable, url.
// And the following methods: address(), listen(port, [host], [callback]), close(), pre(), use().
var server = restify.createServer({
  certificate: null,     // If you want to create an HTTPS server, pass in the PEM-encoded certificate and key
  key: null,             // If you want to create an HTTPS server, pass in the PEM-encoded certificate and key
  formatters: null,      //  Custom response formatters for res.send()
  log: null,             // You can optionally pass in a bunyan instance; not required
  name: 'node-api',      // By default, this will be set in the Server response header, default is restify
  spdy: null,            // Any options accepted by node-spdy
  version: '1.1.3',      // A default version to set for all routes
  handleUpgrades: false  // Hook the upgrade event from the node HTTP server, pushing Connection: Upgrade requests through the regular request handling chain; defaults to false
});

server.listen(3000, function () {
  console.log('%s listening at %s', server.name, server.url);
});


// 1.2. Server API Event Emitters.
// http://mcavage.me/node-restify/#Server-API


// Restify servers emit all the events from the node http.Server and has several other events you want to listen on.
// http://nodejs.org/docs/latest/api/http.html#http_class_http_server

server.on('NotFound', function (request, response, cb) {});              // When a client request is sent for a URL that does not exist, restify will emit this event. Note that restify checks for listeners on this event, and if there are none, responds with a default 404 handler. It is expected that if you listen for this event, you respond to the client.
server.on('MethodNotAllowed', function (request, response, cb) {});      // When a client request is sent for a URL that does exist, but you have not registered a route for that HTTP verb, restify will emit this event. Note that restify checks for listeners on this event, and if there are none, responds with a default 405 handler. It is expected that if you listen for this event, you respond to the client.
server.on('VersionNotAllowed', function (request, response, cb) {});     // When a client request is sent for a route that exists, but does not match the version(s) on those routes, restify will emit this event. Note that restify checks for listeners on this event, and if there are none, responds with a default 400 handler. It is expected that if you listen for this event, you respond to the client.
server.on('UnsupportedMediaType', function (request, response, cb) {});  // When a client request is sent for a route that exist, but has a content-type mismatch, restify will emit this event. Note that restify checks for listeners on this event, and if there are none, responds with a default 415 handler. It is expected that if you listen for this event, you respond to the client.
server.on('after', function (request, response, route, error) {});       // Emitted after a route has finished all the handlers you registered. You can use this to write audit logs, etc. The route parameter will be the Route object that ran.
server.on('uncaughtException', function (request, response, route, error) {});  // Emitted when some handler throws an uncaughtException somewhere in the chain. The default behavior is to just call res.send(error), and let the built-ins in restify handle transforming, but you can override to whatever you want here.


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
  return next('foo2');
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

// You can pass in a string name to next(), and restify will lookup that route, and assuming it exists will run the chain from where you left off.
server.get({
  name: 'foo2',
  path: '/foo/:id'
}, function (req, res, next) {
  assert.equal(count, 1);
  res.send(200);
  next();
});

// Routes can also accept more than one handler function.
server.get(
  '/foo/:id',
  function(req, res, next) {
    console.log('Authenticate');
    return next();
  },
  function(req, res, next) {
    res.send(200);
    return next();
  }
);

// Most REST APIs tend to need versioning, and restify ships with support for semver versioning in an Accept-Version header, the same way you specify NPM version dependencies
var PATH = '/hello/:name';
server.get({path: PATH, version: '1.1.3'}, sendV1);
server.get({path: PATH, version: '2.0.0'}, sendV2);

// You can default the versions on routes by passing in a version field at server creation time. Lastly, you can support multiple versions in the API by using an array:
server.get({path: PATH, version: ['2.0.0', '2.1.0']}, sendV2);


// 4. Content Negotiation.
// http://mcavage.me/node-restify/#Content-Negotiation


// If you're using res.send() restify will automatically select the content-type to respond with, by finding the first registered formatter defined. 
var server = restify.createServer({
  formatters: {
    'application/foo': function formatFoo(req, res, body) {
      if (body instanceof Error)
        return body.stack;

      if (Buffer.isBuffer(body))
        return body.toString('base64');

      return util.inspect(body);
    }
  }
});

// Note that if a content-type can't be negotiated, the default is application/octet-stream. Of course, you can always explicitly set the content-type.
res.setHeader('content-type', 'application/foo');
res.send({hello: 'world'});

// You don't have to use any of this magic, as a restify response object has all the "raw" methods of a node ServerResponse on it as well.
var body = 'hello world';
res.writeHead(200, {
  'Content-Length': Buffer.byteLength(body),
  'Content-Type': 'text/plain'
});
res.write(body);
res.end();


// 5. Error Handling.
// http://mcavage.me/node-restify/#Error-handling


// If you invoke res.send() with an error that has a statusCode attribute, that will be used, otherwise a default of 500 will be used
// You can also shorthand this in a route by doing:

server.get('/hello/:name', function(req, res, next) {
  return database.get(req.params.name, function(err, user) {
    if (err)
      return next(err);

    res.send(user);
    return next();
  });
});

// Alternatively, restify 2.1 supports a next.ifError API

server.get('/hello/:name', function(req, res, next) {
  return database.get(req.params.name, function(err, user) {
    next.ifError(err);
    res.send(user);
    next();
  });
});

// Trigger an HTTP error
// The built-in restify errors are: RestError, BadDigestError, BadMethodError, InternalError, InvalidArgumentError, InvalidContentError, InvalidCredentialsError, InvalidHeaderError, InvalidVersionError, MissingParameterError,
// NotAuthorizedError, RequestExpiredError, RequestThrottledError, ResourceNotFoundError, WrongAcceptError
// The core thing to note about an HttpError is that it has a numeric code (statusCode) and a body. The statusCode will automatically set the HTTP response status code, and the body attribute by default will be the message.

server.get('/hello/:name', function(req, res, next) {
  return next(new restify.ConflictError("I just don't like you"));
});

server.get('/hello/:name', function(req, res, next) {
  return next(new restify.errors.ConflictError("I just don't like you"));
});

server.get('/hello/:name', function(req, res, next) {
  return next(new restify.InvalidArgumentError("I just don't like you"));
});

// You can always add your own by subclassing restify.RestError like:

var restify = require('restify');
var util = require('util');

function MyError(message) {
  restify.RestError.call(this, {
    restCode: 'MyError',
    statusCode: 418,
    message: message,
    constructorOpt: MyError
  });
  this.name = 'MyError';
};

util.inherits(MyError, restify.RestError);


// 6. Socket.io.
// To use socket.io with restify, just treat your restify server as if it were a "raw" node server.
// http://mcavage.me/node-restify/#Socket.IO


var server = restify.createServer();
var io = socketio.listen(server);

server.get('/', function indexHTML(req, res, next) {
  fs.readFile(__dirname + '/index.html', function (err, data) {
    if (err) {
      next(err);
    return;
  }

  res.setHeader('Content-Type', 'text/html');
  res.writeHead(200);
  res.end(data);
  next();
});


io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

server.listen(8080, function () {
  console.log('socket.io server listening at %s', server.url);
});
