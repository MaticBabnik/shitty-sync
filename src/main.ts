import express from 'express'
import morgan from 'morgan'
import compress from 'compression';
import history from 'connect-history-api-fallback'

import { Server } from 'http'
import { Socket } from 'socket.io';

import {RoomManager} from './sync'
import { getIPs } from './misc/misc';
import chalk from 'chalk';

const app = express();

//logging
app.use(morgan('dev'))
//history for vue
app.use(history());
//compression
app.use(compress({level: 7}));
//vue frontend
app.use('/', express.static('./frontend/dist'));

const http = new Server(app);
const io: Socket = require('socket.io')(http);

const roomManager = new RoomManager(io);

const port = process.env.PORT ?? 8080;
http.listen(port, () => {
    console.log(chalk.greenBright('Listening on:'));
    getIPs().forEach(x => console.log(chalk.magentaBright(`\thttp://${x}:${port}`)));
})