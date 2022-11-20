import express from "express";
import { createServer } from "http";
import { nanoid } from "nanoid";
import { Server } from "socket.io";

const app = express();
app.use(express.json())



// allow all CORs for testing
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});

// health check
app.get('/', (req, res) => {
    return res.json({ message: "Working fine" })
})

// on new web socket connection
io.on("connection", (socket) => {

    socket.on("sendChat", (message, roomId) => {
        socket.broadcast.to(roomId).emit('chat', message)
        // console.log(io.sockets.adapter.rooms.get(roomId), "NUMBER OF USERS IN ROOM")
    })


    socket.on("joinRoom", ({ roomId, user }) => {

        // have the socket join the room
        socket.join(roomId)

        // generate message to announce user is joining the room
        const data = {
            message: `${user.username} has joined the room`,
            username: 'ChatBot'
        }

        socket.to(roomId).emit('chat', data)

        // if user is first player to join, give them white
        if (socket.adapter.rooms.get(roomId).size == 1) {
            const updateData = { user, color: 'w' }
            io.in(roomId).emit('chessOrder', updateData)

            // if user is second player to join, give them black
        } else if (socket.adapter.rooms.get(roomId).size == 2) {
            const updateData = { user, color: 'b' }
            io.in(roomId).emit('chessOrder', updateData)
        } else {
            io.emit('chat', { username: 'Chatbot', message: `Sorry ${user.username}, the game already has 2 players` })
        }

    })

    // broadcast the move to everyone in the room on each chess update
    socket.on("chessUpdate", data => {

        // swap turns
        data.turn === 'w' ? data.turn = 'b' : data.turn = 'w'

        // if the pawns are on their first move, remove the y
        if (data.piece === 'wpy') {
            data.piece = 'wp'
        }

        if (data.piece === 'bpy') {
            data.piece = 'bp'
        }

        // broadcast the state
        io.in(data.currentRoom).emit("chessUpdate", data)
    })


    // send chat broadcasts to everyone in the room with io, not socket,
    // so even the user that sent it can see their own messages
    socket.on("sendChat", ({ message, roomId }) => {
        io.in(roomId).emit('chat', message)
    })




});

httpServer.listen(3000);
