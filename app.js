const express = require('express');
const app = express();

const branchName = require('current-git-branch')() || '?';
const connectHistoryApiFallback = require('connect-history-api-fallback');
const morgan = require('morgan')
const { listen } = require('socket.io');

const http = require('http').Server(app);

const io = require('socket.io')(http);

//express middleware
app.use(morgan('tiny'));
app.use(connectHistoryApiFallback());
app.use('/', express.static('frontend/dist'))

const socketsMap = new Map();
const pingMap = {};
const roomRegex = /(?<=\?room=)[^&]+/


let adminPing = 0;
let pingStart = 0;
let rooms = new Map();

const onPing = function () {
    const roomId = socketsMap.get(this.id);
    if (rooms.get(roomId).find(({ id }) => id === this.id).role === "admin") {
        adminPing = (new Date() - pingStart) / 2 / 1000; // in seconds
    };
    const room = rooms.get(roomId);
    room[rooms.get(roomId).findIndex(({id}) => id === this.id)].latency = (new Date() - pingStart) / 1000
    rooms.set(roomId, room);
}

const onPingRequest = function () {
    const roomId = socketsMap.get(this.id);
    if (rooms.get(roomId).find(({ id }) => id === this.id).role !== "admin") return null;

    pingStart = new Date();
    io.to(roomId).emit('ping');
}

const onVideoStatus = function ({ playing, time}) {
    const roomId = socketsMap.get(this.id);
    if (rooms.get(roomId).find(({ id }) => id === this.id).role !== "admin") return null;
    const correctedTime = time - rooms.get(roomId).find(({id}) => this.id).latency - adminPing;
    this.to(roomId).emit('set_status', { playing, time: correctedTime });
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
        rooms.set(roomId, room)
        io.to(room[0].id).emit('role', 'admin')
    }
}

/**
 *
 * @param socket
 */
const onConnection = (socket) => {
    console.log(`referer: ${socket.request.headers.referer}`)

    return;
    console.log('New user connected');
    const regexMatch = roomRegex.exec(socket.request.headers.referer)
    const roomId = regexMatch===null? 'default' : regexMatch[0];
    console.log(roomId)
    socket.join(roomId);
    socketsMap.set(socket.id, roomId)
    pingMap[socket.id] = new Date();

    rooms.set(roomId, [{ id: socket.id, role: rooms.has(roomId)? 'user' : 'admin', latency: 0 }, ...(rooms.get(roomId) || [])])
    console.log(rooms)

    socket.emit('role', rooms.get(roomId).find(({ id }) => id === socket.id).role);

    socket.on('request_ping', onPingRequest);
    socket.on('video_status', onVideoStatus);
    socket.on('ping', onPing);
    socket.on('disconnect', onDisconnect);


    console.log(socket.request.headers.referer);
}


io.on("connection", onConnection);

http.listen(8080,()=>{
    console.log('Listening on 8080');
});
