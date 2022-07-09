import SocketIO from "socket.io";
import express from "express";
import http from "http";

const app = express();

// http

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    res.render("home");
});

app.get("/*", (req, res) => {
    res.redirect("/");
});

// websocket

const httpServer = http.createServer(app);
const socketIoServer = SocketIO(httpServer);

socketIoServer.on("connection", (socketIo) => {
    console.log("Connection maded");

    socketIo.nickname = "익명";

    socketIo.on("nickname", (user_nickname) => {
        socketIo.nickname = user_nickname;
    });

    socketIo.on("enter_room", (roomName, done) => {
        console.group(`[enter_room] ${roomName}`);
        done();
        socketIo.join(roomName);  // 현재 socket.io 연결을 roomName 방에 입장
        // 현재의 rootName에 새로운 연결이 맺어졌음에 대한 이벤트 발생
        socketIo.to(roomName).emit("welcome", socketIo.nickname);
    });

    socketIo.on("disconnecting", () => {
        socketIo.rooms.forEach((room) => {
            socketIo.to(room).emit("bye", socketIo.nickname);
        });
    });

    socketIo.on("new_message", (message, roomName, done) => {
        socketIo.to(roomName).emit("new_message", `${socketIo.nickname}: ${message}`);
        done();
    });
});

httpServer.listen(3000, () => {
    console.log('Listening on http://localhost:3000')
});
