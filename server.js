const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

// Create an express app and server
const app = express();
const server = http.createServer(app); // Use the same server for Express and Socket.IO
const io = socketIo(server); // Initialize Socket.IO on the same server

// Enable CORS for local development
app.use(cors());

// In-memory user list and messages (can be replaced with a database)
let users = ["SAMUEL", "ANJOLA"];
let messages = [];

// Middleware for parsing JSON requests
app.use(express.json());

// POST route for login
app.post("/login", (req, res) => {
  const { username } = req.body;

  // Check if the username is valid
  if (!username || !users.includes(username)) {
    return res.status(400).json({ error: "Invalid username. Only SAMUEL and ANJOLA can log in." });
  }

  // Send the logged-in user's username
  res.status(200).json({ username });
});

// Socket.IO logic for real-time events
io.on("connection", (socket) => {
  console.log("A user connected");

  // Listen for typing event
  socket.on("typing", (username) => {
    socket.broadcast.emit("typing", username);  // Broadcast typing event to others
  });

  // Listen for stop typing event
  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");  // Stop typing indicator for everyone
  });

  // Listen for new message events
  socket.on("sendMessage", (message) => {
    messages.push(message);
    io.emit("newMessage", message);  // Broadcast message to all connected clients
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Serve the frontend application (you can modify this if using a build tool)
app.use(express.static("client/build"));  // Make sure this is the correct path to your React build

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
