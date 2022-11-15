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


let rooms = []
io.on("connection", (socket) => {

    socket.on("create room", (name, callback) => {
        console.log("NAME", name)
        const roomId = nanoid()
        const newRoom = {
            roomId,
            name
        }
        rooms.push(newRoom)
        callback(newRoom)
    })

    socket.on('get rooms', () => {
        io.emit(rooms)
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
