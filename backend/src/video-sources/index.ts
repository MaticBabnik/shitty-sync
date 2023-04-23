import youtube from './youtube'
import cdn from './cdn'

import * as core from 'express-serve-static-core'

export default function register(app: core.Express) {
    app.use('/youtube', youtube)
    app.use('/cdn', cdn)
}