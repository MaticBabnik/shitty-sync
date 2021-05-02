import express from 'express'
import ytsr from 'ytsr'
import ytdl from 'ytdl-core'
import morgan from 'morgan';


const router = express.Router();

router.use(express.urlencoded({ extended: false }));

interface video {
    title?: string,
    url?: string,
    thumbnails?: [{ url: string, width: number }],
    author?: { name: string }
}

router.post('/search', async (req, res) => {
    try {

        if (typeof (req.body['query']) !== 'string') {
            res.status(400).send();
            return;
        }

        const filters = await ytsr.getFilters(req.body['query']);
        const nfilter = filters.get('Type')?.get('Video');
        const results = (await ytsr(nfilter?.url ?? req.body['query'], { limit: 5 }))?.['items'] as Array<video>;

        const minimalResults = results.map(x => ({
            title: x?.['title'],
            url: x?.['url'],
            thumbnailUrl: x?.thumbnails?.sort((l, r) => l.width == r.width ? 0 : l.width > r.width ? 1 : -1)[0].url,
            author: x?.['author']?.name
        }))

        res.send(minimalResults ?? "something went wrong");
    } catch {
        res.status(503).send();
    }
});

export async function test(url: string) {
    const r = (await ytdl.getBasicInfo(url))['player_response'].videoDetails;
    return {
        title: r.title,
        url: `https://www.youtube.com/watch?v=${r.videoId}`,
        thumbnailUrl: r.thumbnail.thumbnails.sort((l, r) => l.width == r.width ? 0 : l.width > r.width ? 1 : -1)[0].url,
        author: r.author
    }
}

router.post('/test', async (req, res) => {
    try {

        if (typeof (req.body['url']) !== 'string') {
            res.status(400).send();
            return;
        }

        res.send(await test(req.body['url']) ?? "something went wrong");
    } catch {
        res.status(503).send();
    }
})

export default router;