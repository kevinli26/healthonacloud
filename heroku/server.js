const express = require("express");
const app = express();
const http = require("http").createServer(app);
const socketServer = require('socket.io')(http);

//Port from environment variable or default - 4001
const port = process.env.PORT || 4001;

app.get("/", (req,res) => {
	res.send("Root Endpoint. Only use as a RESTful api.")
})
//Setting up a socket with the namespace "connection" for new sockets
socketServer.on('connection', (socket) => {
	console.log('A user has connected');

	socket.on('disconnect', () => {
		console.log('A user has disconnected');
	})

	socket.on('clientMessage', (msg) => {
		socket.broadcast.emit('textMessage', msg); //send the message to all clients except the sender
		console.log(msg);
	});
});

http.listen(port, () => console.log(`Listening on port ${port}`));