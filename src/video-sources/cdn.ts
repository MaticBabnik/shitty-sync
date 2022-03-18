import express from 'express'
import needle from 'needle'

const router = express.Router();

router.use(express.urlencoded({ extended: false }));

const KIBIBYTE = 1 << 10;
const MIBIBYTE = 1 << 20;
const GIBIBYTE = 1 << 30;

function prettifySize(size: any): string {
    let pSize: number;
    if (!['string', 'number'].includes(typeof (size)))
        return '???'
    if (typeof (size) === 'string')
        pSize = parseInt(size);
    else
        pSize = size;

    if (pSize > GIBIBYTE)
        return `${(pSize / GIBIBYTE).toFixed(1)} GiB`;
    else if (pSize > MIBIBYTE)
        return `${(pSize / MIBIBYTE).toFixed(1)} MiB`;
    else if (pSize > KIBIBYTE)
        return `${(pSize / KIBIBYTE).toFixed(1)} KiB`;
    else
        return `${pSize} B`
}

const DASH_TYPES = ['application/dash+xml', 'application/dash', 'application/xml', 'application/octet-stream'];

export async function test(url: string) {
    const r = await needle('head', url);
    const headers = r.headers;

    const isNormalVideo = headers['content-type']?.includes('video')

    if (isNormalVideo) return {
        valid: true,
        type: headers['content-type'],
        size: prettifySize(headers['content-length'])
    }

    const isDash = url.toLowerCase().endsWith('.mpd')
        && DASH_TYPES.includes(headers['content-type'] as string);

    if (isDash) return {
        valid: true,
        type: 'mpeg/dash manifest',
        size: 'unkown size'
    }

    return {
        valid: false
    }
}

router.post('/test', async (req, res) => {
    try {
        if (typeof (req.body['src']) !== 'string') {
            res.status(400).send()
            return;
        }

        res.send(await test(req.body['src']));

    } catch {
        res.status(503).send();
    }
});

export default router;