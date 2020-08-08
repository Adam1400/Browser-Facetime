const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

app.set("view engine", "pug");
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


//coin and quit logic
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