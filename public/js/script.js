const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer();
const myVideo = document.createElement("video");
const peers = {}; 

myVideo.muted = true; //so you dont hear yourself

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: {channelCount: 2}, //2 for sterio audio 1 for mono
  })
  .then((stream) => {
    addVideoStream(myVideo, stream);

    //call peer
    myPeer.on("call", (call) => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    //answer call
    socket.on("user-connected", (userId) => {
      console.log("New User Connected");
      connectToNewUser(userId, stream);
    });
  });

//leave call
socket.on("user-disconnected", (userId) => {
  console.log("New User Disconnected");
  if (peers[userId]) peers[userId].close();
});

//brodcast signal
myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
});

//join call in progress
function connectToNewUser(userId, stream) {
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
  //leave call
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call; //track peers
}

//add stream function
function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}