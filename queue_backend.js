const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

let queue = [];

io.on("connection", (socket) => {
    console.log("A user connected");
    socket.emit("queueUpdate", queue);

    socket.on("addPlayer", (name) => {
        queue.push(name);
        io.emit("queueUpdate", queue);
    });

    socket.on("swapPlayers", ({ pos1, pos2 }) => {
        if (pos1 >= 0 && pos2 >= 0 && pos1 < queue.length && pos2 < queue.length) {
            [queue[pos1], queue[pos2]] = [queue[pos2], queue[pos1]];
            io.emit("queueUpdate", queue);
        }
    });

    socket.on("deleteTopPair", () => {
        if (queue.length >= 2) {
            queue.splice(0, 2);
        } else if (queue.length === 1) {
            queue.splice(0, 1);
        }
        io.emit("queueUpdate", queue);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
