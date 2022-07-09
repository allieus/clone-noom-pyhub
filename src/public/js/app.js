const socketIo = io();

const faceVideo = document.querySelector("#myFace");
let videoStream;

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

    try {
        videoStream = await navigator.mediaDevices.getUserMedia(config);
        console.log(videoStream);
        faceVideo.srcObject = videoStream;

        await getCameraDevices();
    }
    catch(e) {
        console.error(e);
    }
}

getMedia();
