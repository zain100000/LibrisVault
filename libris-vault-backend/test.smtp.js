// test-smtp.js
const net = require("net");

const socket = net.createConnection(587, "smtp.gmail.com");

socket.on("connect", () => {
  console.log("✅ Connected to Gmail SMTP on port 587!");
  socket.end();
});

socket.on("error", (err) => {
  console.error("❌ Connection failed:", err);
});
