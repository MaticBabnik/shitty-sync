const express = require('express');
const app = express();
// noinspection JSValidateTypes
const http = require('http').Server(app);
const io = require('socket.io')(http);

let users = [];

const socketsMap = new Map();

let rooms = new Map();

app.use('/', express.static('static'))

const onVideoStatus = function (message) {
    const roomId = socketsMap.get(this.id);
    if (rooms.get(roomId).find(({ id }) => id === this.id).role !== "admin") return null;

    io.to(roomId).emit('set_status', message);
}

const onDisconnect = function () {
    const socket = this;
    const roomId = socketsMap.get(socket.id)
    const room = rooms.get(roomId);

    const disconnectedUserIndex = room.findIndex(({ id }) => id === socket.id);
    const disconnectedUser = room.splice(disconnectedUserIndex, 1)[0];

    room.length ? rooms.set(roomId, room) : rooms.delete(roomId);
    socketsMap.delete(socket.id)

    if (disconnectedUser.role === 'admin' && room.length) {
        console.log(`Gave admin to ${room[0].id}`)
        room[0].role = 'admin';
        io.to(room[0].id).emit('role', 'admin')
    }
}

/**
 *
 * @param socket
 */
const onConnection = (socket) => {
    console.log('New user connected');
    const roomId = socket.request.headers.referer;
    socket.join(roomId);

    socketsMap.set(socket.id, roomId)

    rooms.set(roomId, [{ id: socket.id, role: rooms.has(roomId)? 'user' : 'admin', latency: 0 }, ...(rooms.get(roomId) || [])])
    console.log(rooms)

    const user = { socket, role: rooms[roomId] === undefined ? 'admin' : 'user' };

    users.push(user);
    socket.emit('role', rooms.get(roomId).find(({ id }) => id === socket.id).role);

    socket.on('video_status', onVideoStatus);
    socket.on('disconnect', onDisconnect);

    console.log(socket.request.headers.referer);
}

io.on("connection", onConnection);

http.listen(5500);