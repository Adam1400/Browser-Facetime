const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

//pug
app.set("view engine", "pug");

// set up body-parser
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({extended: true })); 


//use static elements
app.use(express.static("public"));


//initial render into room redirect
app.get("/", (req, res) => {
  var longId = uuidV4();
  var Id = longId.substring(0,4); //shorten launch code id down
  console.log('Room: '+ Id);
  res.redirect(`/${Id}`);
});

//generate room
app.get("/:room", (req, res) => {
    var RoomId = 'Room: ' + req.params.room;
    res.render('room', {title: RoomId , roomId: req.params.room });
});

//switching rooms
app.post('/', (req, res) =>{
  console.log('Switched to room: '+ req.body.joinId);
  res.redirect(`/${req.body.joinId}`);
})


//join and quit logic
io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
      
    });
  });
});



const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server Started on ${PORT}`));