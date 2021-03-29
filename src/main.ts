import express from 'express'
import { Server } from 'http'
import historyApi from 'connect-history-api-fallback'
import morgan from './misc/morgan'
import { Socket } from 'socket.io';
import { Room } from './Room';
import User from './User';

const roomRegex = /(room\/)([a-z0-9\-]{3,16})(\/|$)/i;
const app = express();
const http = new Server(app);
const io: Socket = require('socket.io')(http);

//middleware
app.use(morgan);
app.use(historyApi());
app.use('/', express.static('frontend/dist'));

const rooms = new Map<string, Room>();

// @ts-ignore 
// io.use(socketMiddleware(rooms,false));

io.on('connect', (socket: Socket) => {
    // socket.on('message',(args)=>{
    //     console.log({args});
    //     console.log({ctx:socket.socketRoom});
    // })

    socket.on('ping', (args) => {
        socket.emit('pingret')
    });

    socket.on('synctime', (args) => {
        socket.emit('synctime', Date.now() + (args?.latency ?? 0) / 2);
    });

    socket.on('testtime', (args) => {
        if (args.time) {
            socket.emit('testtime', Date.now() - args.time);
        }
    })
    socket.on('joinroom', (args) => {
        const roomId = socket.request.headers.referer?.match(roomRegex)?.[2].toUpperCase();
        if (roomId) {
            let room = rooms.get(roomId);
            if (!room) //create the room if it doesn't exist
            {
                console.log(`${socket.id} created room ${roomId}`);
                room = new Room(roomId, socket.id);
                rooms.set(roomId, room);
            } else {
                room.users.set(socket.id, new User(socket.id));
                console.log(`${socket.id} joined ${roomId}`);
            }
            //join the socket.io room
            socket.join(roomId);
            socket.emit('joinroom', room.serialize());
            socket.to(roomId).emit('updateroom', room.serialize());
            
            socket.on('promote',args=>{
                const targetUser =  room?.users.get(args.target ?? 'null');
                if (room?.ownerId == socket.id && targetUser) {
                    room.ownerId = args.target;
                }
                io.to(roomId).emit('sysmsg',{text:`${socket.id} set ${args.target} as new owner`,level:'info'})
                io.to(roomId).emit('updateroom', room?.serialize());
            });

            socket.on('changenick',args=>{
                if (typeof(args.nickname) === 'string') {
                    
                    const e = room?.users.get(socket.id)?.changeName(args.nickname);
                    if (e) {
                        socket.emit('sysmsg',{text:e,level:'warn'});
                    }
                    io.to(roomId).emit('updateroom',room?.serialize());
                }
            })
            socket.on('msg', args=>{
                if (typeof(args.text) === 'string') {
                    if (room?.users.get(socket.id)?.canSendMessage()) {
                        io.to(roomId).emit('msg',{username: room.users.get(socket.id)?.name,text:args.text})
                    } else {
                        socket.emit('sysmsg',{text:"You are sending messages to fast.",level:"warn"});
                    }
                } else {
                    socket.emit('sysmsg',{text:"Invalid message"});
                }
            })
            socket.on('disconnect', () => {
                console.log(`${socket.id} left ${roomId}`);
                room?.users.delete(socket.id);
                if (room?.users.size === 0) {
                    rooms.delete(roomId);
                    console.log(`${roomId} is empty, deleting`);
                    return;
                }
                if (room?.ownerId === socket.id) {
                    console.log(`${socket.id} was admin`);
                    room.ownerId = room.users.keys().next().value;
                    console.log(`set ${room.ownerId} as admin of ${roomId}`);
                }
                io.to(roomId).emit('updateroom',room?.serialize());

            })
        } else {
            socket.emit('joinroom', { error: "invalid room" });
        }
    });
})

http.listen(8080, () => {
    console.log('Listening on 8080');
})