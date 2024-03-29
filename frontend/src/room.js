/*
*   Room.js
?   A mixin for handling all of the socket.io communication
*/

import { io } from 'socket.io-client'

import * as util from '@/util'
import { waitFor, delay } from '@/async-utils'

export default {
    data() {
        return {
            latency: {
                start: null,
                records: [],
                last: 0
            },
            timeOffset: 0,
            roomCode: '',
            roomValid: false,
            status: 'Waiting for WS',
            interactionNeeded: false,
            roomReady: false,
            kicked: false,
            messages: [
                {
                    type: 2,
                    username: 'System',
                    text: 'List of all emotes can be found <a href="/emote-list">here</a>'
                }
            ],
            users: [],
            admin: false,
            source: null,
            player: {
                playing: false,
                time: 0
            },
            syncState: null,
            debug: {
                isDev: false,
                lastSyncRecv: 0,
                lastSyncSent: 0,
                lastEvent: '?',
                lastRecvType: '?',
                timeError: 0,
                t: 0
            },
            intervals: []
        }
    },
    methods: {
        //Return the corrected time to decrease latency
        getTime() {
            return Date.now() + this.timeOffset
        },

        getTimeSeconds() {
            //same as get time but in seconds
            return (Date.now() + this.timeOffset) / 1000
        },
        addMessage(msg) {
            const wasAtBottom = this.isAtBottom()
            this.messages.push(msg)

            //TODO: Fix the scrolling when there are >500 messages
            if (this.messages.length > 500) {
                this.messages.shift()
            }

            if (wasAtBottom) {
                this.$nextTick(() => this.scrollToBottom())
            } else {
                this.showScrollToBottom = true
            }
        },
        //? ------------------------------------------------------------------------
        //? Socket event emitters
        //? ------------------------------------------------------------------------
        kick(id) {
            this.socket.emit('kick', { target: id })
        },
        promote(id) {
            this.socket.emit('promote', { target: id })
        },
        changeNick(newNick, gravatar) {
            this.socket.emit('changenick', { nickname: newNick, gravatar })
        },
        async ping() {
            this.latency.start = Date.now()
            this.socket.emit('ping')
            await waitFor(this.socket, 'pingret')
        },
        sendMessage(text) {
            if (text.startsWith('/')) {
                switch (text.slice(1)) {
                    case 'dev':
                        this.debug.isDev = !this.debug.isDev
                        localStorage.setItem('dev', this.debug.isDev.toString())
                        return

                    case 'fuck-you':
                        this.addMessage({
                            type: 2,
                            username: 'Sync',
                            text: 'No, fuck you.'
                        })
                        return
                }
            }

            this.socket.emit('msg', { text })
        },
        changeMedia(media) {
            this.socket.emit('changemedia', media)
        },

        syncPlay(time) {
            if (!this.admin) return

            const tO = this.getTimeSeconds() - time

            this.debug.lastSyncSent = Date.now()
            this.debug.lastEvent = 'PLAY'

            this.socket.emit('sync', { status: 'PLAYING', offset: tO })
        },
        syncPause(time) {
            if (!this.admin) return

            // For pause we send the actual timestap, so that it is *perfect*
            this.debug.lastSyncSent = Date.now()
            this.debug.lastEvent = 'PAUSE'

            this.socket.emit('sync', { status: 'PAUSED', timestamp: time })
        },
        syncSeek(time, isPlaying) {
            if (!this.admin) return
            const tO = this.getTimeSeconds() - time
            this.debug.lastSyncSent = Date.now()
            this.debug.lastEvent = `SEEK (${isPlaying ? 'play' : 'pause'})`

            this.socket.emit('sync', {
                status: isPlaying ? 'PLAYING' : 'PAUSED',
                timestamp: time,
                offset: tO
            })
        },

        //? ------------------------------------------------------------------------
        //? Socket event handlers
        //? ------------------------------------------------------------------------
        onPingReturn() {
            const latency = Date.now() - this.latency.start
            this.latency.records.push(latency)
            this.latency.last = latency
        },
        updateRoom(args) {
            this.users = args.users

            if (args.media?.src !== this?.source?.src) {
                this.source = args.media
                this.$refs.vjsContainer.change(this.source)
            }

            this.admin = this.users.find((x) => x.id === this.socket.id)?.role === 'admin'
            this.$refs.vjsContainer.setAdmin(this.admin)
        },
        sync(args) {
            this.debug.lastSyncRecv = Date.now()

            if (this.admin) return

            this.debug.lastRecvType = args.status
            this.syncState = args

            if (args.status === 'PLAYING') {
                this.$refs.vjsContainer.seek(this.getTimeSeconds() - args.offset)
                this.$refs.vjsContainer.play(true, this.getTimeSeconds() - args.offset)
            } else {
                this.$refs.vjsContainer.seek(args.timestamp)
                this.$refs.vjsContainer.play(false, args.timestamp)
            }
        },
        msg(args) {
            this.addMessage({
                type: 0,
                username: args.username,
                text: args.text
            })
        },
        sysmsg(args) {
            this.addMessage({
                type: 1,
                level: args.level,
                username: '[!]',
                text: args.text
            })
        },
        onKicked() {
            this.kicked = true
        },
        time() {
            this.debug.t = this.getTime()

            if (this.debug.isDev) requestAnimationFrame(this.time)
        },

        async joinroom() {
            let roomCode = this.$route.params.id
            this.roomCode = roomCode
            this.socket = io({ transports: ['websocket'] })

            await waitFor(this.socket, 'connect')

            this.socket.on('pingret', this.onPingReturn)
            await delay(200)
            for (let i = 1; i <= 10; i++) {
                this.status = `Calculating latency ${i}/10`
                await this.ping()
            }
            const latency = util.average(util.ignoreWorst(this.latency.records))

            this.status = 'Syncing time...'
            this.socket.emit('synctime', { latency })
            const serverTime = await waitFor(this.socket, 'synctime')

            this.timeOffset = serverTime - Date.now()
            this.socket.emit('testtime', {
                time: this.getTime() + latency / 2
            })

            this.debug.timeError = await waitFor(this.socket, 'testtime')

            this.status = 'Getting room info'

            const joinargs = { roomId: this.$route?.params?.id }
            const username = localStorage.getItem('username') ?? undefined
            const gravatar = localStorage.getItem('gravatar') ?? undefined

            if (username) {
                joinargs.nickname = username
                joinargs.gravatar = gravatar
            }

            this.socket.emit('joinroom', joinargs)

            const roomdata = await waitFor(this.socket, 'joinroom')
            this.updateRoom(roomdata)

            this.socket.on('updateroom', this.updateRoom)
            this.socket.on('msg', this.msg)
            this.socket.on('sysmsg', this.sysmsg)
            this.socket.on('sync', this.sync)
            this.socket.on('kicked', this.onKicked)

            this.roomReady = true
            document.title = `Sync | ${roomCode}`

            if (this.debug.isDev) requestAnimationFrame(this.time)
        },

        interaction() {
            this.joinroom()
            this.interactionNeeded = false
        },
        //? ------------------------------------------------------------------------
        //? Shared workers
        //? ------------------------------------------------------------------------
        handleMessage(event) {
            const [eventType] = event.data
            switch (eventType) {
                case 'discovery':
                    if (this.admin && this.roomReady && !this.kicked) {
                        window.worker.port.postMessage(['alive', this.roomCode])
                    }
                    break
                case 'setmedia': {
                    let [room, mediaType, src, origin] = event.data.slice(1)
                    if (room != this.roomCode) break
                    if ((!this.admin && !this.roomReady) || this.kicked) break

                    const media = {
                        type: mediaType,
                        src: src
                    }

                    this.messages.push({
                        type: 2,
                        username: 'System',
                        text: `Media changed from ${origin ?? 'unknown origin'}`
                    })

                    this.socket.emit('changemedia', media)
                    break
                }
            }
        }
    },

    async mounted() {
        console.log('room.js mixin mounted')

        if (localStorage.getItem('dev') == 'true') {
            this.debug.isDev = true
        }

        const canJoin = await util.checkAutoplay()

        if (canJoin) {
            await this.joinroom()
        } else {
            this.status = 'Click the button bellow to enable autoplay'
            this.interactionNeeded = true
        }

        if (window.worker.port) window.worker.port.onmessage = (e) => this.handleMessage(e)
    },
    beforeUnmount() {
        if (window.worker.port) window.worker.port.onmessage = () => {}

        this.socket.disconnect()
        this.intervals.forEach((x) => clearInterval(x))
    }
}
