export const rooms = {};

export const createRoom = (roomId, player1Id) => {
    rooms[roomId] = [player1Id, ""];
}

export const joinRoom = (roomId, player2Id) =>{
    rooms[roomId][1] = player2Id;
}

export const exitRoom = (roomId, player) => {
        // if player 1 exits the room 
    if(player === 1){
        rooms[roomId][1] = "";
        delete rooms[roomId]
    }else{
        //if player 2 exits the room
        rooms[roomId][1] = "";
    }
}