import {fileURLToPath} from "url";
import {dirname} from "path";
import express from "express";
import {Server} from "socket.io";
import http from "http";
import path from "path";
import {rooms, createRoom, joinRoom, exitRoom} from "./public/js/rooms.js";
import {
  connectedUsers,
  moves,
  initializeChoices,
  userConnected,
  makeMove,
  choices,
} from "./public/js/users.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const server = http.createServer(app);

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

const PORT = 3000 || process.env.PORT;

const io = new Server(server);

// note: On the server, we need to think of what users can do from the frontend side, and also return responses back to frontend

io.on("connection", (socket) => {
  //when player click on creating room
  socket.on("create-room", (roomId) => {
    if (rooms[roomId]) {
      const error = "This room already exists";
      socket.emit("display-error", error);
    } else {
      userConnected(socket.client.id);
      createRoom(roomId, socket.client.id);
      socket.emit("room-created", roomId);
      socket.emit("player-1-connected");
      socket.join(roomId);
    }
  });

  //when 2nd player tries to join a room
  socket.on("join-room", (roomId) => {
    if (!rooms[roomId]) {
      const error = "This room does not exist!";
      socket.emit("display-error", error);
    } else {
      if(rooms[roomId][1] !== ""){
        const error = "All rooms are full or none exist!";
        socket.emit("display-error", error);
      }else{
        userConnected(socket.client.id);
        joinRoom(roomId, socket.client.id);
        socket.join(roomId);
  
        socket.emit("room-joined", roomId);
        socket.emit("player-2-connected");
  
        //we want to inform the player 1 as well
        socket.broadcast.to(roomId).emit("player-2-connected");
        initializeChoices(roomId);
      }
    }
  });

  socket.on("join-random", () => {
    let roomId = "";
    for (const id in rooms) {
      //if the seconds place of the room is empty
      if (rooms[id][1] === "") {
        roomId = id;
        break;
      }
    }

    if (roomId === "") {
      const error = "All rooms are full or none exist!";
      socket.emit("display-error", error);
    } else {
      userConnected(socket.client.id);
      joinRoom(roomId, socket.client.id);
      socket.join(roomId);

      socket.emit("room-joined", roomId);
      socket.emit("player-2-connected");

      //we want to inform the player 1 as well
      socket.broadcast.to(roomId).emit("player-2-connected");
      initializeChoices(roomId);
    }
  });

  socket.on("make-move", ({playerId, myChoice, roomId}) => {

    makeMove(roomId, playerId, myChoice);
    console.log("player Id : ", playerId , "my choice is " , myChoice)
    let message = "Waiting for opponent to make move..."
    socket.emit("reminder" , message )
    //if both player have made their choice
    if (choices[roomId][0] !== "" && choices[roomId][1] !== "") {
      let playerOneChoice = choices[roomId][0];
      let playerTwoChoice = choices[roomId][1];


      console.log("player 1 choice " , playerOneChoice , "player 2 choice " , playerTwoChoice)

      // if draw
      if (playerOneChoice === playerTwoChoice) {
        let message = `Both of you pick ${playerOneChoice}, so it's a draw!`;
        // display the result message to a specific room
        io.to(roomId).emit("draw", message);

        // if player 1 wins
      } else if (moves[playerOneChoice] === playerTwoChoice) {
        
        io.to(roomId).emit("player-1-wins", {playerOneChoice, playerTwoChoice});

        // if player 2 wins
      } else {
        io.to(roomId).emit("player-2-wins", {playerOneChoice, playerTwoChoice});
      }
      choices[roomId] = ["", ""];
    }
  });

  socket.on("disconnect", () => {
    if (connectedUsers[socket.client.id]) {
      console.log("is player 2 still coneccted?")
      let player;
      let roomId;

      for (let id in rooms) {
        if (
          rooms[id][0] === socket.client.id ||
          rooms[id][1] === socket.client.id
        ) {
          if (rooms[id][0] === socket.client.id) {
            player = 1;
          } else {
            player = 2;
          }
          roomId = id;
          console.log(id);
          break;
        }
      }

      console.log("rooms is " + rooms[roomId]);

      // only if room is still exists then the players can exit
      if(rooms[roomId] !== undefined){
        exitRoom(roomId, player);
        if (player === 1) {
          io.to(roomId).emit("player-1-disconnected");
          console.log("player 1 is disconnected!")
        } else {
          io.to(roomId).emit("player-2-disconnected");
          console.log("player 2 is disconnected!")
        }
      }

    }
  });
});

server.listen(PORT, () => console.log(`server listening on port ${PORT}`));
