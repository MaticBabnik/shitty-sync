const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

let users = [];

app.use('/', express.static('static'))


io.on('connection', (socket) => {

    console.log('a user connected')
    const user ={ socket, role: users.length == 0 ? 'admin' : 'user' };
    users.push(user);
    console.log(`assigned role: ${user.role}`)
    socket.emit('role',user.role);

    socket.on('disconnect', () => {
        users = users.filter((usr) => usr.socket.id != socket.id);

        if (!users.find(x => x.role == 'admin') && users.length > 0) {
            users[0].role = 'admin';
            users[0].socket.emit('role','admin');
            console.log(`gave admin to ${users[0].socket.id}`)
        }
    })
    socket.on('video_status',(msg)=>{
        if (users.find(x => x.socket.id == socket.id).role == 'admin'){
            console.log(`admin sent: ${JSON.stringify(msg)}`);
            socket.broadcast.emit('set_status',msg);
        }
    })
});



http.listen(5500);