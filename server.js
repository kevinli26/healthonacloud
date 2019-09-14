let express = require('express');
let app = express();
let http = require('http').createServer(app);
let socketServer = require('socket.io')(http);

let port = 3000;

app.get('/', (req,res) => {
	res.sendFile(__dirname + '/index.html');
});

//listens for incoming sockets to the main server
//will send directly to the sender
socketServer.on('connection', (socket) => {
	// console.log('A user has connected');
	// socket.broadcast.emit('userConnect', "A user has connected");

	// socket.on('disconnect', () => {
	// 	console.log('A user has disconnected');
	// 	socket.broadcast.emit('userDisconnect', "A user has disconnected");
	// })

	socket.on('clientMessage', (msg) => {
		socket.broadcast.emit('textMessage', msg); //send the message to all clients except the sender
		console.log(msg);
	});
});

http.listen(port, function(){
	console.log('listening on port:3000');
});