const express = require("express");
const app = express();
const http = require("http").createServer(app);
const socketServer = require('socket.io')(http);
const bodyParser = require('body-parser');
const axios = require('axios');

//Port from environment variable or default - 4001
const port = process.env.PORT || 4001;
// support parsing of application/json type post data
// app.use(bodyParser.json());
// //support parsing of application/x-www-form-urlencoded post data
// app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req,res) => {
	res.send("Root Endpoint. Only use as a RESTful api.")
})


// app.post("/endSession", (req,res) => {
// 	//call azure API to summarize
// 	// console.log(req.body);
// 	axios({
// 		method: "POST",
// 		url: "https://westcentralus.api.cognitive.microsoft.com/text/analytics/v2.1/keyPhrases",
// 		headers: {
// 			'Content-Type': 'application/json',
// 			'Accept': 'application/json',
// 			'Ocp-Apim-Subscription-Key': '4685b5d936f94879b6910e941f54a36a'
// 		},
// 		data: req.body,
// 	}).then( (apiRes) => {
// 		res.send(apiRes.data);
// 	}).catch( err => {
// 		console.log(err);
// 		res.send("ended request life cycle");
// 	})
// })

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
