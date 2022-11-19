import express from "express";
import { createServer } from "http";
import { nanoid } from "nanoid";
import { Server } from "socket.io";

const app = express();
app.use(express.json())


const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});

app.get('/', (req, res) => {
    return res.json({ message: "Working fine" })
})

let rooms = {}

// rooms = {
//      roomId: {
//          users: [],
//          messages: [],
//      }
// }


// todos for this
// create room with .join
// broadcast only to rooms
// separate event listener for chess game status

io.on("connection", (socket) => {

    socket.on("sendChat", (message, roomId) => {
        socket.broadcast.to(roomId).emit('chat', message)
    })

    socket.on("joinRoom", ({ roomId, user }) => {
        console.log(`${user.username} joined ${roomId}`)
        socket.join(roomId)
        const data = {
            message: `${user.username} has joined the room`,
            username: 'ChatBot'
        }

        socket.to(roomId).emit('chat', data)

    })

    socket.on("sendChat", ({ message, roomId }) => {
        console.log(message, roomId, "MESSAGE AND ROOM ID IN SEND CHAT")
        io.in(roomId).emit('chat', message)
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
