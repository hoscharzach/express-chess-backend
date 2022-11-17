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
        console.log(a)
        Object.keys(rooms).forEach(el => {
            console.log(el, "KEY?")
            if (rooms[el].users && rooms[el].users.length === 0) {
                delete rooms[el]
            }
        })

        console.log(rooms, "hitting disconnect callback")
    })

    socket.on('leave room', (roomId, user) => {
        if (rooms[roomId] && rooms[roomId].users) {
            rooms[roomId].users = rooms[roomId].users.filter(participant => participant.userId !== user.userId)
        }

        console.log(rooms[roomId]?.users)
    })

    socket.on("join room", (roomId, user, callback) => {
        // add user to room by user object and room name
        console.log(rooms[roomId])
        if (rooms[roomId] && rooms[roomId].users.length < 3) {
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
        console.log(rooms)
        callback({ rooms, roomId })
    })

    socket.on("send chat", (roomId, user, chat, callback) => {

    })


});

httpServer.listen(3000);
