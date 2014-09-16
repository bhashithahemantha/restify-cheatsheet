// Restify CheatSheet.
// More about the API: http://mcavage.me/node-restify/
// Install restify with npm install restify


// 1. Creating a Server.


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