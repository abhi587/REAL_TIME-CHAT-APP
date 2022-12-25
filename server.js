const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const formatMessage = require("./utils/messages")
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");
const app = express();
const server = http.createServer(app)
const io = socketio(server);

//Set static folder
app.use(express.static(path.join(__dirname, "public")));

let bot = "Chat Bot "

//Run when client connects
io.on("connection", socket => {

  socket.on("joinRoom", ({ username, room }) => {

    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //Welcome Current User
    socket.emit("message", formatMessage(bot, `hello ${user.username},Welcome to the ChatCord! You are in ${user.room} room`))

    //BroadCast when  a user connects
    socket.broadcast.to(user.room).emit("message", formatMessage(bot, `${user.username} has Joined the Chat`));

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  //io.emmit(); for all clients

  //listen for chat message
  socket.on("chatMessage", msg => {
    // console.log(msg)
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit("message", formatMessage(user.username, msg));
  })

  //Runs when client disconnect
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(bot, `${user.username} has left the chat`)
      );

      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});




server.listen(3000 || process.env.PORT, () => console.log(`the server running on port ${3000 || process.env.PORT}`))