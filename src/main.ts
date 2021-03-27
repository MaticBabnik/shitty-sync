import express from 'express'
import { Server } from 'http'
import historyApi from 'connect-history-api-fallback'
import morgan from './misc/morgan'
import { Socket } from 'socket.io';
import { wsCtx as socketMiddleware } from './room-middleware'
import { Room } from './Room';
//import { Router } from './router'

const app = express();
const http = new Server(app);
const io: Socket = require('socket.io')(http);

//middleware
//app.use(morgan);
app.use(historyApi());
app.use('/', express.static('frontend/dist'));

const rooms = new Map<string,Room>();

// @ts-ignore 
//io.use(socketMiddleware(rooms,io))

io.on('connect',(socket:Socket)=>{
    // socket.on('message',(args)=>{
    //     console.log({args});
    //     console.log({ctx:socket.socketRoom});
    // })

    socket.on('ping',(args)=>{
        socket.emit('pingret')
    });

    socket.on('synctime',(args)=>{
        socket.emit('synctime', Date.now() + (args?.latency ?? 0) / 2);
    });

    socket.on('testtime',(args)=>{
        if (args.time) {
            socket.emit('testtime',Date.now() - args.time);
        }
    })

})

http.listen(8080, () => {
    console.log('Listening on 8080');
})