const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

let queue = [];
let adminAuthenticated = false;
const adminPassword = "maimaibataan";

io.on("connection", (socket) => {
    console.log("A user connected");
    socket.emit("queueUpdate", queue);

// Admin Login
io.on("connection", (socket) => {
  console.log("New client connected");
  io.emit("queueUpdate", queue);

  socket.on("adminLogin", (password) => {
    if (password === adminPassword) {
      adminAuthenticated = true;
      socket.emit("loginSuccess");
    } else {
      socket.emit("loginFailed");
    }
  });

  // Add Player
  socket.on("addPlayer", (playerName) => {
    if (!adminAuthenticated) return;
    queue.push({ name: playerName, paid: false });
    io.emit("queueUpdate", queue);
  });

  // Swap Players
  socket.on("swapPlayers", ({ pos1, pos2 }) => {
    if (!adminAuthenticated || pos1 < 0 || pos2 < 0 || pos1 >= queue.length || pos2 >= queue.length) return;
    [queue[pos1], queue[pos2]] = [queue[pos2], queue[pos1]];
    io.emit("queueUpdate", queue);
  });

  // Delete Top Pair
  socket.on("deleteTopPair", () => {
    if (!adminAuthenticated || queue.length < 2) return;
    queue.splice(0, 2);
    io.emit("queueUpdate", queue);
  });

  // Delete Player by Position
  socket.on("deletePlayerByPosition", (pos) => {
    if (!adminAuthenticated || pos < 0 || pos >= queue.length) return;
    queue.splice(pos, 1);
    io.emit("queueUpdate", queue);
  });

  // Mark Player as Paid
  socket.on("markPlayerPaid", (pos) => {
    if (!adminAuthenticated || pos < 0 || pos >= queue.length) return;
    queue[pos].paid = true;
    io.emit("queueUpdate", queue);
  });

  // Display Current Pair
  socket.on("displayCurrentPair", () => {
    if (queue.length >= 2) {
      socket.emit("showCurrentPair", [queue[0], queue[1]]);
    } else {
      socket.emit("showCurrentPair", []);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
