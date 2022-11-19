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

    // every time there's a disconnect, just check for empty rooms
    // and delete them
    socket.on('disconnect', (a) => {
        console.log("disconnecting")
    })

    socket.on('leave room', (roomId, user) => {
        if (rooms[roomId] && rooms[roomId].users) {
            rooms[roomId].users = rooms[roomId].users.filter(participant => participant.userId !== user.userId)
        }

        console.log(rooms[roomId]?.users)
    })

    socket.on("send chat", (message, roomId) => {
        if (!rooms[roomId]) {
            callback({ error: 404, message: "Room does not exist" })
        } else {
            rooms[roomId].messages.push(message)
            // console.log(rooms[roomId].messages)
            // callback({ ok: 200, message })
            io.emit('chat', message)
        }
    })

    socket.on("join room", (roomId, user, callback) => {
        // add user to room by user object and room name

        // if room doesn't exist
        if (!rooms[roomId]) {
            callback({ error: 404, message: `${roomId} not found.` })
        }

        // if room exists and has 2 or more users already
        else if (rooms[roomId].users.length >= 2) {
            callback({ error: 400, message: `${roomId} is currently full` })
        }

        // check if user is already in the room to prevent bugs
        const users = rooms[roomId].users.map(user => user.id)
        if (users.includes(user.id)) {
            callback({ error: 400, message: `${user.username} is already part of room ${roomId}` })
        } else {
            rooms[roomId].users.push(user)
            callback({ ok: 200, message: `${user.username} successfully joined room ${roomId}`, roomId })
        }

    })

    socket.on("create room", (roomId, user, callback) => {
        // create unique identifier
        // create the room, add current user to it, initialize messages
        rooms[roomId] = {
            users: [user],
            messages: []
        }

        // return the room
        console.log(rooms)
        callback({ ok: 200, message: `Room created with id ${roomId}`, roomId })
    })



});

httpServer.listen(3000);
