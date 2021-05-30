/*
*   Room.js
?   A mixin for handling all of the socket.io communication
*/

import { io } from "socket.io-client";

import util from "@/util";
import constants from "@/constants";
import { waitFor, delay } from "@/async-utils";

export default {
    data() {
        return {
            latency: {
                start: null,
                records: [],
                last: 0,
            },
            timeOffset: 0,
            roomCode: "",
            roomValid: false,
            status: "Waiting for WS",
            roomReady: false,
            kicked: false,
            messages: [],
            users: [],
            admin: false,
            source: null,
            player: {
                playing: false,
                time: 0,
            },
            debug: {
                isDev: false,
                lastSyncRecv: 0,
                lastSyncSent: 0,
                lastEvent: '?',
                timeError: 0,
            }
        };
    },
    methods: {
        //Return the corrected time to decrease latency
        getTime() {
            return Date.now() + this.timeOffset;
        },
        //? ------------------------------------------------------------------------
        //? Socket event emitters
        //? ------------------------------------------------------------------------
        kick(id) {
            this.socket.emit("kick", { target: id });
        },
        promote(id) {
            this.socket.emit("promote", { target: id });
        },
        changeNick(newNick) {
            if (constants.nameRegex.test(newNick)) {
                this.socket.emit("changenick", { nickname: newNick });
            }
        },
        async ping() {
            this.latency.start = Date.now();
            this.socket.emit("ping");
            await waitFor(this.socket, "pingret");
        },
        sendMessage(text) {
            if (text === '/dev') {
                this.debug.isDev = !this.debug.isDev;
                localStorage.setItem('dev',this.debug.isDev.toString());
                return;
            }

            this.socket.emit("msg", { text });
        },
        changeMedia(media) {
            this.socket.emit("changemedia", media);
        },

        syncPlay(time) {
            console.log({time})

            if (!this.admin) return;

            const tO = this.getTime() - time;

            this.debug.lastSyncSent = Date.now();
            this.debug.lastEvent = 'PLAY';

            this.socket.emit('sync',{status:'PLAYING',offset:tO});
        },
        syncPause(time) {
            console.log({time})

            if (!this.admin) return;

            // For pause we send the actual timestap, so that it is *perfect*
            this.debug.lastSyncSent = Date.now();
            this.debug.lastEvent = 'PAUSE';

            this.socket.emit('sync',{status:'PAUSED',timestamp:time});
        },
        syncSeek(time,isPlaying) {
            if (!this.admin) return;
            const tO = this.getTime() - time;
            console.log({time,isPlaying})
            this.debug.lastSyncSent = Date.now();
            this.debug.lastEvent = `SEEK (${isPlaying ? 'play' : 'pause'})`;

            this.socket.emit('sync',{status:isPlaying? 'PLAYING' : 'PAUSED',timestamp: time,offset:tO});
        },


        //? ------------------------------------------------------------------------
        //? Socket event handlers
        //? ------------------------------------------------------------------------

        onPingReturn() {
            const latency = Date.now() - this.latency.start;
            this.latency.records.push(latency);
            this.latency.last = latency;
        },
        updateRoom(args) {
            this.users = args.users;

            if (args.media.type == 'youtube-search')
                this.source = { src: args.media.src, type: 'video/youtube' };
            else
                this.source = args.media;

            this.admin =
                this.users.find((x) => x.id === this.socket.id)?.role ===
                "admin";
        },
        sync (args) {
            console.log(args);

            this.debug.lastSyncRecv = Date.now();
            
            if (this.admin) return;

            if (args.status === 'PLAYING') {
                this.time = this.getTime() - args.offset;
                this.playing = true;
            }else {
                this.time = args.timestamp;
                this.playing = false;
            }
        },
        msg(args) {
            this.messages.unshift({
                type: 0,
                username: args.username,
                text: args.text,
            });
        },
        sysmsg(args) {
            this.messages.unshift({
                type: 1,
                level: args.level,
                username: '[!]',
                text: args.text,
            });
        },
        onKicked(args) {
            this.kicked = true;
        }
    },
    async mounted() {
        console.log('room.js mixin mounted');

        if (localStorage.getItem('dev') == 'true') {
            this.debug.isDev = true;
        }

        let roomCode = this.$route.params.id;
        this.roomCode = roomCode;
        this.socket = io();

        await waitFor(this.socket, "connect");

        this.socket.on("pingret", this.onPingReturn);
        await delay(200);
        for (let i = 1; i <= 10; i++) {
            this.status = `Calculating latency ${i}/10`;
            await this.ping();
        }
        const latency = util.average(util.ignoreWorst(this.latency.records));

        this.status = "Syncing time...";
        this.socket.emit("synctime", { latency });
        const serverTime = await waitFor(this.socket, "synctime");

        this.timeOffset = serverTime - Date.now();
        this.socket.emit("testtime", { time: this.getTime() + latency / 2 });

        this.debug.timeError = await waitFor(this.socket, "testtime");

        this.status = "Getting room info";
        this.socket.emit("joinroom", this.$route?.params?.id ?? '');
        
        const roomdata = await waitFor(this.socket, "joinroom");
        this.updateRoom(roomdata);

        this.socket.on("updateroom", this.updateRoom);
        this.socket.on("msg", this.msg);
        this.socket.on("sysmsg", this.sysmsg);
        this.socket.on("sync", this.sync)
        this.socket.on("kicked", this.onKicked);

        this.roomReady = true;
    },

    beforeUnmount() {
        this.socket.disconnect()
    },
}