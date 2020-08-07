const express = require ('express');
const app = express();
const server = require('http').Server(app);
const io = require("socket.io")(server);
const { v4: uuidv4 } = require('uuid'); //set up id generator

//set up pug engine
app.set('view engine', 'pug');

//use public files
app.use(express.static('public'));

//set up peer to peer
const { ExpressPeerServer } = require('peer');
const peerServer = ExpressPeerServer(server, {
    debug: true
});



//generate a unique room
app.get('/', (req, res) => {
    res.redirect(`${uuidv4()}`)
})



//render room
app.get('/:room', (req, res) => {
    var longId = req.params.room;
    var Id = 'Room: ' + longId.substring(0, 8);
    res.render('room', {title: Id , roomId: req.params.room });
})

//establish peer
app.use('/peerjs', peerServer);



//open socket listen for other users
io.on('connection', socket =>{
    socket.on('join-room' , (roomId, userId) =>{
        socket.join(roomId);
        socket.to(roomId).broadcast.emit('user-connected', userId);
    });
});



server.listen(8080);
