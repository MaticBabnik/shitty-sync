import express from 'express'
import { Server } from 'http'
import historyApi from 'connect-history-api-fallback'
import morgan from 'morgan'
import { Socket } from 'socket.io';
import socketOnConnect from './ws'

const app = express();
const http = new Server(app);
const io: Socket = require('socket.io')(http);

//middleware
app.use(morgan('tiny'));
app.use(historyApi());
app.use('/', express.static('frontend/dist'));


io.on('connect',socketOnConnect);


http.listen(8080, () => {
    console.log('Listening on 8080');
})