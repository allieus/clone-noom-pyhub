const socketIo = io();

// websocket

socketIo.on("welcome", async () => {
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    socketIo.emit("offer", offer, "public_room");
    console.log("offer :", offer);
});

socketIo.on("offer", async (offer) => {
    console.log("received the offer");
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socketIo.emit("answer", answer, "public_room");
    console.log("sent the answer");
});

socketIo.on("answer", (answer) => {
    console.log("received the answer");
    myPeerConnection.setRemoteDescription(answer);
});

socketIo.on("ice", (candidate) => {
    console.log("received candidate", candidate);
    myPeerConnection.addIceCandidate(candidate);
});

// ui

const faceVideo = document.querySelector("#myFace");
let videoStream;
let myPeerConnection;

document.querySelector("#camera_devices").addEventListener("input", async function() {
    const deviceId = this.value;
    await getMedia(deviceId);
});

document.querySelector("#audio_toggle").addEventListener("click", function(event) {
    if(videoStream) {
        const tracks = videoStream.getAudioTracks();
        tracks.forEach(track => {
            track.enabled = isEnabled;
        });
    }
    else {
        console.warn("videoStream is undefined.");
    }
});

document.querySelector("#video_toggle").addEventListener("click", function() {
    const isEnabled = this.checked;
    if(videoStream) {
        const tracks = videoStream.getVideoTracks();
        // tracks[0].enabled = false;
        tracks.forEach(track => {
            track.enabled = isEnabled;
        });
    }
    else {
        console.warn("videoStream is undefined.");
    }
});

async function getCameraDevices() {
    try {
        const cameraDevices = await navigator.mediaDevices.enumerateDevices();
        console.log(cameraDevices);
        const html = cameraDevices
            .filter(({ kind }) => kind === "videoinput")
            .map(({ deviceId, label }) => `<option value="${deviceId}">${label}</option>`)
            .join("");
        console.log(html);
        document.querySelector("#camera_devices").innerHTML = html;
    }
    catch(e) {
        console.error(e);
    }
}

async function getMedia(desiredDeviceId) {
    let config;
    if( !desiredDeviceId ) {
        config = { audio: true, video: true };
    }
    else {
        config = {
            audio: true,
            video: {
                deviceId: { exact: desiredDeviceId },
            },
        };
    }
``
    try {
        videoStream = await navigator.mediaDevices.getUserMedia(config);
        faceVideo.srcObject = videoStream;

        await getCameraDevices();
    }
    catch(e) {
        console.error(e);
    }
}

async function init() {
    await getMedia();

    if(!videoStream) {
        console.warn("videoStream is not defined.");
        document.querySelector("#messages").innerHTML = "videoStream is not defined.";
        document.querySelector("#faceStream").hidden = true;
    }
    else {
        // 책에서는 makeConnection 이라는 함수를 호출
        myPeerConnection = new RTCPeerConnection();
        myPeerConnection.addEventListener("icecandidate", (event) => {
            console.log("got ice candidate");
            socketIo.emit("ice", event.candidate, "public_room");
        });
        myPeerConnection.addEventListener("addstream", (event) => {
            console.log("got a stream from peer");
            console.log("Peer's Stream :", event.stream);
            console.log("My Stream :", videoStream);

            document.querySelector("#peerFace").srcObject = event.stream;
        });

        videoStream.getTracks()
            .forEach(track => myPeerConnection.addTrack(track, videoStream));

        socketIo.emit("join_room", "public_room", async () => {
        });
    }
}

init();
