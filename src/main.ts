import express from 'express'
import Morgan from 'morgan'
import { Server } from 'http'
import { Socket } from 'socket.io';
import historyApi from 'connect-history-api-fallback'

import {RoomManager} from './sync'
import { getIPs } from './misc/misc';
import chalk from 'chalk';

const app = express();

app.use(historyApi());
app.use('/', express.static('./frontend/dist'));
app.use(Morgan('dev'))

const http = new Server(app);

const io: Socket = require('socket.io')(http);

const roomManager = new RoomManager(io);

const port = process.env.PORT ?? 8080;

http.listen(port, () => {
    console.log(chalk.greenBright('Listening on:'));
    getIPs().forEach(x => console.log(chalk.magentaBright(`\thttp://${x}:${port}`)));
})