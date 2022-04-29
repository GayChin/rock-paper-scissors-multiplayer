export const connectedUsers = {};
export const choices = {};

export const moves = {
    "rock" : "scissor",
    "paper" : "rock",
    "scissor" : "paper",
}

export const initializeChoices = (roomId) => {
    console.log("choices initialized!")
    choices[roomId] = ["",""]
}

export const userConnected = (userId) => {
    connectedUsers[userId] = true;
}

export const makeMove = (roomId, player, choice) => {
    console.log("roomId " , roomId)
    console.log("player " , player)
    console.log("choice " , choice)

    if(choices[roomId]){
        choices[roomId][player - 1] = choice
    }
}