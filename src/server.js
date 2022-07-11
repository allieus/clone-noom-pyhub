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
    socketIo.on("join_room", (roomName, done) => {
        socketIo.join(roomName);
        done();
        socketIo.to(roomName).emit("welcome");
    });
    socketIo.on("offer", (offer, roomName) => {
        socketIo.to(roomName).emit("offer", offer);
    });
    socketIo.on("answer", (answer, roomName) => {
        socketIo.to(roomName).emit("answer", answer);
    });
    socketIo.on("ice", (candidate, roomName) => {
        socketIo.to(roomName).emit("ice", candidate);
    });
});

httpServer.listen(3000, () => {
    console.log('Listening on http://localhost:3000')
});

// Utility functions
