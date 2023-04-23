import express from "express";
import morgan from "morgan";
import { Server } from "http";
import { Server as SocketIO } from "socket.io";
import history from "connect-history-api-fallback";
import chalk from "chalk";
import prometheusClient, { register } from "prom-client";
import registerVideoSources from "./video-sources";
import { RoomManager } from "./sync";
import { expressMetrics, roomMetrics } from "./metrics";

const app = express();

if (!process.env.NO_METRICS) app.use(expressMetrics(app, register));

app.use(morgan("dev"));
registerVideoSources(app);

if (process.env.EXPRESS_STATIC) {
    console.log(chalk.yellowBright("Serving fronted with express static"));
    //history for vue
    app.use(history());
    //vue frontend
    app.use("/", express.static("./frontend/dist"));
}

const http = new Server(app);
const io = new SocketIO(http);

const roomManager = new RoomManager(io);

if (!process.env.NO_METRICS) roomMetrics(roomManager, register);

const port = process.env.PORT ?? 8080;

http.listen(port, () => {
    console.log(chalk.greenBright("Listening on:"));
    console.log(chalk.gray(`\thttp://0.0.0.0:${port}/`));
});

//Prometheus
if (!process.env.NO_METRICS) {
    const app_prom = express();

    prometheusClient.collectDefaultMetrics();

    app_prom.get("/metrics", async (req, res) => {
        try {
            res.set("Content-Type", register.contentType);
            res.end(await register.metrics());
        } catch (ex) {
            res.status(500).end(ex);
        }
    });

    const port_metrics = process.env.PORT_METRICS ?? 9090;
    app_prom.listen(port_metrics, () => {
        console.log(chalk.blueBright("Metrics on:"));
        console.log(chalk.gray(`\thttp://0.0.0.0:${port_metrics}/metrics`));
    });
}
