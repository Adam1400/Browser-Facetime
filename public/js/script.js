const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer();
const myVideo = document.createElement("video");
const peers = {};
var currentUsers = 1;



let myVideoStream;
myVideo.muted = true; //so you dont hear yourself
myVideo.setAttribute('autoplay', '');
myVideo.setAttribute('muted', '');
myVideo.setAttribute('playsinline', '');



navigator.mediaDevices.getUserMedia({
    video: true ,
    audio: {
      channelCount: 2, //2 for sterio audio 1 for mono
      echoCancellation: {ideal: true}

    }
  })
  .then((stream) => {
    myVideoStream = stream;
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
      console.log("User Connected: "+userId);
      connectToNewUser(userId, stream);
    });
  }).catch(function(reason) {
    //no camera or mic
      console.log("Device does not suport streaming ==> "+ reason);
});


  

//leave call
socket.on("user-disconnected", (userId) => {
  console.log("User Disconnected: "+userId);
  
  if (peers[userId]) {peers[userId].close()};
  currentUsers = currentUsers -1;

  if(currentUsers !== document.getElementsByTagName("video").length){
    //MIGRATE HOST
    location.reload();
  } 
});

//brodcast signal
myPeer.on("open", (id) => {
  socket.emit("join-room", ROOM_ID, id);
  console.log("My ID: "+ id + " | Room: "+ ROOM_ID);
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
    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    var currentUsers = document.getElementsByTagName("video").length;
    addExpand(currentUsers);
  });
  videoGrid.append(video);
}


//mute functionality
const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      setUnmuteButton();
    } else {
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
  }
  
 //stop video functionality 
  const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  }
  
  //mute audio button
  const setMuteButton = () => {
    const html = `
    <svg width="3em" height="3em" viewBox="0 0 16 16" class="bi bi-mic" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
        <path fill-rule="evenodd" d="M10 8V3a2 2 0 1 0-4 0v5a2 2 0 1 0 4 0zM8 0a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V3a3 3 0 0 0-3-3z"/>
    </svg>
    `
    document.querySelector('.mute').innerHTML = html;
  }
  
  const setUnmuteButton = () => {
    const html = `
    <svg width="3em" height="3em" viewBox="0 0 16 16" class="bi bi-mic-mute-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M12.734 9.613A4.995 4.995 0 0 0 13 8V7a.5.5 0 0 0-1 0v1c0 .274-.027.54-.08.799l.814.814zm-2.522 1.72A4 4 0 0 1 4 8V7a.5.5 0 0 0-1 0v1a5 5 0 0 0 4.5 4.975V15h-3a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1h-3v-2.025a4.973 4.973 0 0 0 2.43-.923l-.718-.719zM11 7.88V3a3 3 0 0 0-5.842-.963L11 7.879zM5 6.12l4.486 4.486A3 3 0 0 1 5 8V6.121zm8.646 7.234l-12-12 .708-.708 12 12-.708.707z"/>
    </svg>
    `
    document.querySelector('.mute').innerHTML = html;
  }
  

  //mute video button
  const setStopVideo = () => {
    const html = `
    <svg width="3em" height="3em" viewBox="0 0 16 16" class="bi bi-camera-video" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M2.667 3.5c-.645 0-1.167.522-1.167 1.167v6.666c0 .645.522 1.167 1.167 1.167h6.666c.645 0 1.167-.522 1.167-1.167V4.667c0-.645-.522-1.167-1.167-1.167H2.667zM.5 4.667C.5 3.47 1.47 2.5 2.667 2.5h6.666c1.197 0 2.167.97 2.167 2.167v6.666c0 1.197-.97 2.167-2.167 2.167H2.667A2.167 2.167 0 0 1 .5 11.333V4.667z"/>
        <path fill-rule="evenodd" d="M11.25 5.65l2.768-1.605a.318.318 0 0 1 .482.263v7.384c0 .228-.26.393-.482.264l-2.767-1.605-.502.865 2.767 1.605c.859.498 1.984-.095 1.984-1.129V4.308c0-1.033-1.125-1.626-1.984-1.128L10.75 4.785l.502.865z"/>
    </svg>
    `
    document.querySelector('.cut').innerHTML = html;
  }
  
  const setPlayVideo = () => {
    const html = `
    <svg width="3em" height="3em" viewBox="0 0 16 16" class="bi bi-camera-video-off-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M1.429 3.55A1.66 1.66 0 0 0 1 4.667v6.666C1 12.253 1.746 13 2.667 13h6.666c.43 0 .821-.162 1.117-.429l-9.02-9.02zm13.111 8.868a.798.798 0 0 0 .46-.726V4.308c0-.63-.693-1.01-1.233-.696L11 5.218v-.551C11 3.747 10.254 3 9.333 3H5.121l9.419 9.418z"/>
        <path fill-rule="evenodd" d="M13.646 14.354l-12-12 .708-.708 12 12-.708.707z"/>
    </svg>
    `
    document.querySelector('.cut').innerHTML = html;
  }


// URL Copy To Clipboard
document.getElementById("invite").addEventListener("click", getURL);

function getURL() {
  const c_url = window.location.href;
  copyToClipboard(c_url);
  const popup = document.getElementById("myPopup");
  popup.classList.toggle("show");
}

function copyToClipboard(text) {
  var dummy = document.createElement("textarea");
  document.body.appendChild(dummy);
  dummy.value = text;
  dummy.select();
  document.execCommand("copy");
  document.body.removeChild(dummy);
}

//expand video when clicked
function addExpand(currentUsers){
  
  for (var i = 0; i < currentUsers ; i++) {
    const vid = document.getElementsByTagName("video")[i];
    
    if(vid.id !== "hasEvent"){
    vid.addEventListener("click", expand);
    vid.setAttribute("id", "hasEvent");
    }   
  }
  function expand(){
    this.classList.toggle("expand");
  }
}















 
