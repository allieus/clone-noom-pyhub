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

httpServer.listen(3000, () => {
    console.log('Listening on http://localhost:3000')
});

// Utility functions
