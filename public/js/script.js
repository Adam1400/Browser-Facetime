const socket = io.connect('/');
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');


//set up peer
var peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '443'
});


//set up audio video stream
    let myVideoStream;
    myVideo.muted = true; //keeps you from hearing yourself
    
    navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {channelCount: 2} //2 for sterio 1 for mono
    }).then(stream =>{
        myVideoStream = stream;
        addVideoStream(myVideo, stream);

        //answer call
        peer.on('call', call =>{
            call.answer(stream);
            const video = document.createElement('video');
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream);
            })
        })

        //emit room with whos in it
        socket.on('user-connected', userId =>{
            connectToNewUser(userId, stream);
        })
    })


//connect peer
peer.on('open', id =>{
    socket.emit('join-room', ROOM_ID, id);
})

//call room with video
const connectToNewUser = (userId, stream) =>{
    //console.log('new user joined : '+ userId);
    const call = peer.call(userId, stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream =>{
        addVideoStream(video, userVideoStream);
    })
}


//play stream
const addVideoStream = (video, stream) => {
        video.srcObject = stream;
        video.addEventListener('loadedmetadata', () =>{
            video.play()
        })
        //attach video to grid element 
        videoGrid.append(video);
}


