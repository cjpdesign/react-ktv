// ===================
// Set Up
// ===================

var os = require('os');
var http = require('http');
var express = require('express');
var app = express();
var ipaddr = require('ipaddr.js');
var morgan = require('morgan');
var path = require('path');
var ktv = require('./ktv');
var port = 8888;

// ===================
// Configuration
// ===================

app.use(express.static(__dirname + '/public'));
app.use('/song', express.static(__dirname + '/song'));
app.use(morgan('dev'));

// Create a Node.js based http server on port 8080
var server = http.createServer(app).listen(port, '0.0.0.0');


// Create a Socket.IO server and attach it to the http server
var io = require('socket.io').listen(server);

// Reduce the logging output of Socket.IO
//io.set('log level',1);

// Listen for Socket.IO Connections. Once connected, start the logic.
io.on('connection', function(socket) {
	console.log('User(' + socket.id + ') connected');

	socket.on('disconnect', function() {
		console.log('User(' + socket.id + ') disconnected');
	});

	ktv.initKTV(io, socket, ipaddr);
});

console.log('Server started!');

// Display server IP
var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
	for (var k2 in interfaces[k]) {
		var address = interfaces[k][k2];
		if (address.family === 'IPv4' && !address.internal) {
			addresses.push(address.address + ":" + port);
		}
	}
}

console.log('The server address is ' + addresses);