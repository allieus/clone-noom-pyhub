const socketIo = io();

socketIo.on("welcome", (new_user_nickname, roomSize) => {
    appendMessageToUI(`${new_user_nickname}님이 들어오셨습니다.`);
    document.querySelector("#room h3").innerText = `Room ${roomName} (${roomSize})`;
});

socketIo.on("bye", (left_user_nickname, roomSize) => {
    appendMessageToUI(`${left_user_nickname}님이 나갔습니다. :-(`);
    document.querySelector("#room h3").innerText = `Room ${roomName} (${roomSize})`;
});

socketIo.on("new_message", (message) => {
    appendMessageToUI(message);
});

socketIo.on("room_change", (publicRoomNames) => {
    console.log("publicRoomNames :", publicRoomNames);
    const parent = document.querySelector("#welcome .public_rooms");
    // parent.innerHTML = JSON.stringify(publicRoomNames);
    // publicRoomNames.forEach((roomName) => {
    //     const li = document.createElement("li");
    //     li.innerText = roomName;
    //     parent.append(li);
    // });

    // const tag_list = [];
    // publicRoomNames.forEach(roomName => {
    //     const tag = `<li>${roomName}</li>`;
    //     tag_list.push(tag)
    // });
    // const html = tag_list.join('');
    // parent.innerHTML = html;

    // parent.innerHTML = publicRoomNames.map(roomName => {
    //     return `<li>${roomName}</li>`;
    // }).join("");

    parent.innerHTML = publicRoomNames.map(roomName => {
        return `<li>${roomName}</li>`;
    }).join("");
});


let roomName = "";
const welcomeForm = document.querySelector("#welcome form");

function appendMessageToUI(message) {
    const li = document.createElement("li");
    li.innerText = message;
    document.querySelector("#room ul").append(li);
}

function updateUI(isShowRoom) {
    if ( !isShowRoom ) {
        // welcome만 보여주고, room은 숨깁니다.
        document.querySelector("#welcome").hidden = false;
        document.querySelector("#room").hidden = true;
    }
    else {
        document.querySelector("#welcome").hidden = true;
        document.querySelector("#room").hidden = false;
    }
}

updateUI(false);

welcomeForm.addEventListener("submit", (event) => {
    event.preventDefault();

    roomName = welcomeForm.querySelector("input").value;
    welcomeForm.querySelector("input").value = "";

    socketIo.emit("enter_room", roomName, () => {
        // showRoom
        document.querySelector("#room h3").innerText = `Room ${roomName}`;

        updateUI(true);
    });
});

// const a = () => {};
// const b = function() {};
// function c() {}

document.querySelector("#room form#name").addEventListener("submit", function(event) {
    event.preventDefault();
    const nickname = this.querySelector("input").value;
    this.querySelector("input").value = "";
    console.log("닉네임 입력 :", nickname);
    socketIo.emit("nickname", nickname);
});

document.querySelector("#room form#msg").addEventListener("submit", function(event) {
    event.preventDefault();

    const message = this.querySelector("input").value;
    this.querySelector("input").value = "";

    socketIo.emit("new_message", message, roomName, () => {
        appendMessageToUI(`You : ${message}`);
    });
});
