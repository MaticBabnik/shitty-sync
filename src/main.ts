import express from 'express'
import { Server } from 'http'
import historyApi from 'connect-history-api-fallback'
import morgan from './misc/morgan'
import { Socket } from 'socket.io';
import { wsCtx } from './ws-context'
import { Room } from './Room';
//import { Router } from './router'

const app = express();
const http = new Server(app);
const io: Socket = require('socket.io')(http);

//middleware
app.use(morgan);
app.use(historyApi());
app.use('/', express.static('frontend/dist'));

const rmap = new Map<string,Room>();

// @ts-ignore 
io.use(wsCtx(rmap,io))

io.on('connect',(socket:Socket)=>{
    console.log('got connection');
    socket.on('message',(args)=>{
        console.log({args});
        console.log({ctx:socket.ctx});
    })
})

http.listen(8080, () => {
    console.log('Listening on 8080');
})