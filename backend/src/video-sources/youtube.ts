import express from "express";
import ytsr from "ytsr";
import ytdl from "ytdl-core";
import { TestResult } from ".";
import { PlayerMediaType } from "../sync";

const router = express.Router();

router.use(express.urlencoded({ extended: false }));

interface video {
    title?: string;
    url?: string;
    thumbnails?: [{ url: string; width: number }];
    author?: { name: string };
}

router.post("/search", async (req, res) => {
    try {
        if (typeof req.body["query"] !== "string") {
            res.status(400).send();
            return;
        }

        const filters = await ytsr.getFilters(req.body["query"]);
        const nfilter = filters.get("Type")?.get("Video");
        const results = (
            await ytsr(nfilter?.url ?? req.body["query"], { limit: 5 })
        )?.["items"] as Array<video>;

        const minimalResults = results.map((x) => ({
            title: x?.["title"],
            url: x?.["url"],
            thumbnailUrl: x?.thumbnails?.sort((l, r) =>
                l.width == r.width ? 0 : l.width > r.width ? 1 : -1
            )[0].url,
            author: x?.["author"]?.name,
        }));

        res.send(minimalResults ?? "something went wrong");
    } catch (e) {
        console.error(e);
        res.status(503).send();
    }
});

export async function test(url: string): Promise<TestResult> {
    try {
        const r = (await ytdl.getBasicInfo(url)).videoDetails;

        return {
            valid: true,
            type: PlayerMediaType.youtube,

            title: r.title,
            url: `https://www.youtube.com/watch?v=${r.videoId}`,
            thumbnailUrl: (r.thumbnails ?? []).sort((l, r) =>
                l.width == r.width ? 0 : l.width > r.width ? 1 : -1
            )?.[0]?.url,
            author: r.author.name,
        };
    } catch (e) {
        console.error("Error tesing YouTube", e);

        return {
            valid: false,
            type: PlayerMediaType.none,
        };
    }
}

router.post("/test", async (req, res) => {
    try {
        if (typeof req.body["url"] !== "string") {
            res.status(400).send();
            return;
        }

        res.send((await test(req.body["url"])) ?? "something went wrong");
    } catch (e) {
        console.error(e);
        res.status(503).send();
    }
});

export default router;
