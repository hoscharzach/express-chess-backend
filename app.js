import express from "express";
import { createServer } from "http";
import { nanoid } from "nanoid";
import { Server } from "socket.io";

const app = express();



const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173"
    }
});


let rooms = {}

// rooms = {
//      roomId: {
//          users: [],
//          messages: [],
//      }
// }

io.on("connection", (socket) => {

    socket.on("join room", (roomId, user, callback) => {
        // add user to room by user object and room name
        console.log(rooms[roomId])
        if (rooms[roomId] && rooms[roomId].users.length < 2) {
            rooms[roomId].users.push(user)
        }

        callback({ rooms, roomId })

        // return all of the messages in that room
    })
    socket.on("create room", (user, callback) => {
        // create unique identifier
        const roomId = nanoid()
        // create the room, add current user to it, initialize messages
        rooms[roomId] = {
            users: [user],
            messages: []
        }
        // console.log(rooms)
        // return the room
        console.log(rooms[roomId])
        callback({ rooms, roomId })
    })

    socket.on("get rooms", (callback) => {
        callback(rooms);
    });

    socket.on('messageAll', (data) => {
        console.log(data)
        socket.emit(data)
    })
});

httpServer.listen(3000);
