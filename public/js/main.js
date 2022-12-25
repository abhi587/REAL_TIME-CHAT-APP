const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

const socket = io();


// user Name and Room
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

// console.log(username, room)

//Join chatRoom
socket.emit("joinRoom", {username, room})

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
  });

  
socket.on("message", message =>{
    console.log(message)
    outputMessage(message)

    //scroll down automatically when new msg comes
    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//message Submit
chatForm.addEventListener("submit", (e) =>{
    e.preventDefault();

    //get message Text
    const msg = e.target.elements.msg.value;
    console.log(msg)

    //emit message to server
    socket.emit("chatMessage", msg)

    //clear Input
    e.target.elements.msg.value="";
    e.target.elements.msg.focus();
});

//OutPut Message DOM
function outputMessage(message) {
    const div = document.createElement("div");
    div.classList.add("message");
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector(".chat-messages").appendChild(div)
}

// Add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
  }
  
  // Add users to DOM
  function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
      const li = document.createElement('li');
      li.innerText = user.username;
      userList.appendChild(li);
    });
  }