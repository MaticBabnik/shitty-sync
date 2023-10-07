import youtube from "./youtube";
import url from "./url";
import type { Express } from "express";
import { PlayerMediaType } from "../sync";

export interface TestResult {
    valid: boolean;
    type: PlayerMediaType;

    title?: string;
    url?: string;
    thumbnailUrl?: string;
    author?: string;
    size?: string;
}

export default function register(app: Express) {
    app.use("/youtube", youtube);
    app.use("/url", url);
}
