import express from 'express'
import ytsr from 'ytsr'

const router = express.Router();

router.use(express.urlencoded({ extended: false }));

interface video {
    title?: string,
    url?: string,
    thumbnails?: [{ url: string, width: number }],
    author?: { name: string }
}

router.get('/search', async (req, res) => {
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
        thubnailUrl: x?.thumbnails?.sort((l, r) => l.width == r.width ? 0 : l.width > r.width ? 1 : -1)[0].url,
        author: x?.['author']?.name
    }))

    res.send(minimalResults ?? "something went wrong");
});

export default router;