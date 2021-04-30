import express from 'express'
import needle from 'needle'

const router = express.Router();

router.use(express.urlencoded({ extended: false }));

const KIBIBYTE = 1 << 10;
const MIBIBYTE = 1 << 20;
const GIBIBYTE = 1 << 30;

function prettifySize(size: any): string {
    let pSize: number;
    if (!['string','number'].includes(typeof(size)))
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

router.post('/test', async (req, res) => {
    try {
    if (typeof (req.body['src']) !== 'string') {
        res.status(400).send()
        return;
    }

    const response = await needle('head', req.body['src']);

    res.send({
        valid: response.headers['content-type']?.includes('video'),
        type: response.headers['content-type'],
        size: prettifySize(response.headers['content-length'])
    })
    } catch {
        res.status(503).send();
    }
});

export default router;