import express from "express";
import onFinished from "on-finished";
import prometheusClient from "prom-client";
import { RoomManager } from "./sync";

export function expressMetrics(
    app: express.Application,
    registry: prometheusClient.Registry
) {
    const requestCounter = new prometheusClient.Counter({
        name: "express_requests",
        help: "Total number of requests",
        registers: [registry],
    });

    const failedCounter = new prometheusClient.Counter({
        name: "express_requests_failed",
        help: "Total number of requests that returned 4xx or 5xx",
        registers: [registry],
    });

    const summary = new prometheusClient.Summary({
        name: "express_summary",
        help: "IDK how this works",
        labelNames: ["method", "url", "status", "time"],
        registers: [registry],
    });

    return (
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        const startTime = process.hrtime.bigint();

        onFinished(res, (err, nres) => {
            let url = req.url?.split("?")?.[0] || "?";

            summary.observe(
                { method: req.method, url, status: res.statusCode },
                Number(process.hrtime.bigint() - startTime) / 1_000_000
            );

            requestCounter.inc();
            if (res.statusCode >= 400) failedCounter.inc();
        });
        next();
    };
}

export function roomMetrics(
    roomManager: RoomManager,
    registry: prometheusClient.Registry
) {
    const roomGauge = new prometheusClient.Gauge({
        name: "room_manager_rooms",
        help: "Total number of rooms",
        registers: [registry],
    });

    const userGauge = new prometheusClient.Gauge({
        name: "room_manager_users",
        help: "Total number of users",
        registers: [registry],
    });

    const mediaSwapCounter = new prometheusClient.Gauge({
        name: "room_manager_media_changes",
        help: "Total number of media swaps",
        labelNames: ["type"],
        registers: [registry],
    });

    roomManager.on("roomcreate", () => {
        roomGauge.inc();
    });
    roomManager.on("roomdestroy", () => {
        roomGauge.dec();
    });

    roomManager.on("roomjoin", () => {
        userGauge.inc();
    });
    roomManager.on("roomleave", () => {
        userGauge.dec();
    });

    roomManager.on("roomsourcechanged", (r) => {
        if (r.media.type === "none") return;

        mediaSwapCounter.labels(r.media.type).inc();
    });
}
