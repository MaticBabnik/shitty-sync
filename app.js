const express = require('express');
const app = express();
// noinspection JSValidateTypes
const http = require('http').Server(app);
const io = require('socket.io')(http);
const branchName = require('current-git-branch')() || '?';
const { Socket } = require('socket.io')

const rooms = new Map();
const pingMap = new Map();
const mediaMap = new Map();
const socketsMap = new Map();

const roomRegex = /(?<=\?room=)[^&]+/;

app.use('/', express.static('static'))

app.get('/branch',(req,res)=>{
    res.send(branchName);
})


/**
 *
 * @param {Socket.id | string} id
 * @param newData
 * @param property
 */
const updateUser = (id, newData, property) => {
    const roomId = socketsMap.get(id);
    const room = rooms.get(roomId);
    const userIndex = rooms.get(roomId).findIndex(user => user.id === id)
    if ( property ) {
        room[userIndex][property] = newData
    } else  {
        room[userIndex] = newData
    }
    rooms.set(roomId, room);
    return room[userIndex];
}

/**
 * @param {Socket.id | string} id
 * @param property
 */
const getUser = (id, property) => {
    const roomId = socketsMap.get(id);
    const user = rooms.get(roomId).find(user => user.id === id);
    return property? user[property] : user;
}

/**
 * @param {Socket.id} id
 * @return boolean
 */
const isAdmin = (id) => rooms.get(socketsMap.get(id)).find(user => user.id === id).role === 'admin';

const onPing = function () {
    const pingStartTime = pingMap.get(socketsMap.get(this.id));
    const latency = (new Date() -  pingStartTime) / 1000 // in seconds
    updateUser(this.id, latency, 'latency')
}

const onPingRequest = function () {
    if (!isAdmin(this.id)) return null;
    const roomId = socketsMap.get(this.id);

    pingMap.set(roomId, new Date());
    io.to(roomId).emit('ping');
}

const onMessage = function (message) {
    const roomId = socketsMap.get(this.id);
    io.to(roomId).emit('message', { message, sender: this.id});
}

const onUsernameChange = function (newUsername) {
    updateUser(this.id , newUsername, 'username');
    const roomId = socketsMap.get(this.id);
    io.to(roomId).emit('users', rooms.get(roomId));
}

const onVideoStatus = function ({ playing, time}) {
    if (!isAdmin(this.id)) return null;

    const roomId = socketsMap.get(this.id);
    const adminPing = rooms.get(roomId).find(user => user.role === 'admin').latency;

    const correctedTime = time - getUser(this.id, 'latency') - adminPing;
    this.to(roomId).emit('set_status', { playing, time: correctedTime });
}

const onNewVideoSource = function (newVideoSource) {
    if (!isAdmin(this.id)) return null;
    const roomId = socketsMap.get(this.id);
    mediaMap.set(roomId, newVideoSource);
    io.to(roomId).emit('set_media', newVideoSource)
}

const onDisconnect = function () {
    const socket = this;
    const roomId = socketsMap.get(socket.id)
    const room = rooms.get(roomId);

    const disconnectedUserIndex = room.findIndex(({ id }) => id === socket.id);
    const disconnectedUser = room.splice(disconnectedUserIndex, 1)[0];

    socketsMap.delete(socket.id)

    if (disconnectedUser.role === 'admin' && room.length) {
        console.log(`Gave admin to ${room[0].id}`)
        room[0].role = 'admin';
        rooms.set(roomId, room)
        io.to(room[0].id).emit('role', 'admin')
    }

    if (room.length) {
        rooms.set(roomId, room)
        io.to(roomId).emit('users', room);
    } else {
        rooms.delete(roomId);
        pingMap.delete(roomId);
        mediaMap.delete(roomId);
    }
}

/**
 *
 * @param { Socket }socket
 */
const onConnection = (socket) => {
    console.log('New user connected');
    const regexMatch = roomRegex.exec(socket.request.headers.referer)
    const roomId = regexMatch===null? 'default' : regexMatch[0];
    console.log(roomId)
    socket.join(roomId);
    socketsMap.set(socket.id, roomId)

    rooms.set(roomId, [{ id: socket.id, username: 'Anonymous', role: rooms.has(roomId)? 'user' : 'admin', latency: 0 }, ...(rooms.get(roomId) || [])])
    console.log(rooms)

    io.to(roomId).emit('users', rooms.get(roomId));
    socket.emit('role', rooms.get(roomId).find(({ id }) => id === socket.id).role);
    socket.emit('set_media', mediaMap.get(roomId) || mediaMap.set(roomId, 'http://vedro.works.si/%5BZ4ST1N%5D+Kaifuku+Jutsushi+no+Yarinaoshi+-+02+%5BB141BC23%5D.m4v') && mediaMap.get(roomId));

    socket.on('request_ping', onPingRequest);
    socket.on('video_status', onVideoStatus);
    socket.on('video_source', onNewVideoSource);

    socket.on('message', onMessage);
    socket.on('username', onUsernameChange);
    socket.on('ping', onPing);
    socket.on('disconnect', onDisconnect);
}


io.on("connection", onConnection);

http.listen(5500);
