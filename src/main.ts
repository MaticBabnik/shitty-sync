import express from 'express'
import morgan from 'morgan'
import compress from 'compression';
import history from 'connect-history-api-fallback';

import { Server } from 'http';
import { Socket } from 'socket.io';

import chalk from 'chalk';

import prometheusClient, { register } from 'prom-client'

import registerVideoSources from './video-sources';


import { RoomManager } from './sync';
import { getIPs } from './misc/misc';
import expressMetrics from './misc/express-metrics'

const app = express();

if (!process.env.NO_METRICS)
    app.use(expressMetrics(app, register))

//logging
app.use(morgan('dev'))
//media selection stuff
registerVideoSources(app);
//history for vue
app.use(history());
//compression
app.use(compress({ level: 7 }));
//vue frontend
app.use('/', express.static('./frontend/dist'));

const http = new Server(app);
const io: Socket = require('socket.io')(http);

const roomManager = new RoomManager(io);

const port = process.env.PORT ?? 8080;

http.listen(port, () => {
    console.log(chalk.greenBright('Listening on:'));
    getIPs().forEach(x => console.log(chalk.black(`\thttp://${x}:${port}`)));
})

//Prometheus
if (!process.env.NO_METRICS) {
    const app_prom = express();

    prometheusClient.collectDefaultMetrics();

    app_prom.get('/metrics', async (req, res) => {
        try {
            res.set('Content-Type', register.contentType);
            res.end(await register.metrics());
        } catch (ex) {
            res.status(500).end(ex);
        }
    })

    const port_metrics = process.env.PORT_METRICS ?? 9080;
    app_prom.listen(port_metrics, () => {
        console.log(chalk.cyanBright('Metrics on:'));
        getIPs().forEach(x => console.log(chalk.black(`\thttp://${x}:${port_metrics}/metrics`)));
    })
}