/*
*   Room.js
?   A mixin for handling all of the socket.io communication
*/

/* eslint-disable indent*/

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
            interactionNeeded: false,
            roomReady: false,
            kicked: false,
            messages: [{ type: 2, username: "System", text: "List of all emotes can be found <a href=\"/emotes\">here</a>" }],
            users: [],
            admin: false,
            source: null,
            player: {
                playing: false,
                time: 0,
            },
            syncState: null,
            debug: {
                isDev: false,
                lastSyncRecv: 0,
                lastSyncSent: 0,
                lastEvent: "?",
                lastRecvType: "?",
                timeError: 0,
                t: 0
            },
            intervals: []
        };
    },
    methods: {
        //Return the corrected time to decrease latency
        getTime() {
            return Date.now() + this.timeOffset;
        },

        getTimeSeconds() { //same as get time but in seconds
            return (Date.now() + this.timeOffset) / 1_000;
        },
        addMessage(msg) {
            const scroll = this.isAtBottom()
            this.messages.push(msg);

            if (this.messages.length > 100) {
                this.messages.shift();
            } else if (!scroll)
                this.$nextTick(() =>
                    this.scrollToBottom());
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
            if (text.startsWith("/")) {
                switch (text.slice(1)) {
                    case "dev":
                        this.debug.isDev = !this.debug.isDev;
                        localStorage.setItem(
                            "dev",
                            this.debug.isDev.toString()
                        );
                        return;

                    case "fuck-you":
                        setInterval(() => {
                            this.addMessage({
                                type: 0,
                                username: "god@heaven",
                                text: "fuck you",
                            });
                        }, 100);
                        return;
                }
            }

            this.socket.emit("msg", { text });
        },
        changeMedia(media) {
            this.socket.emit("changemedia", media);
        },

        syncPlay(time) {
            if (!this.admin) return;

            const tO = this.getTimeSeconds() - time;

            this.debug.lastSyncSent = Date.now();
            this.debug.lastEvent = "PLAY";

            this.socket.emit("sync", { status: "PLAYING", offset: tO });
        },
        syncPause(time) {
            if (!this.admin) return;

            // For pause we send the actual timestap, so that it is *perfect*
            this.debug.lastSyncSent = Date.now();
            this.debug.lastEvent = "PAUSE";

            this.socket.emit("sync", { status: "PAUSED", timestamp: time });
        },
        syncSeek(time, isPlaying) {
            if (!this.admin) return;
            const tO = this.getTimeSeconds() - time;
            this.debug.lastSyncSent = Date.now();
            this.debug.lastEvent = `SEEK (${isPlaying ? "play" : "pause"})`;

            this.socket.emit("sync", {
                status: isPlaying ? "PLAYING" : "PAUSED",
                timestamp: time,
                offset: tO,
            });
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

            if (args.media?.src !== this?.source?.src) {
                if (args.media.type == "youtube-search") {
                    this.source = {
                        src: args.media.src,
                        type: "video/youtube",
                    };
                } else {
                    this.source = args.media;
                }
                this.$refs.vjsContainer.change(this.source);
            }

            this.admin =
                this.users.find((x) => x.id === this.socket.id)?.role ===
                "admin";
            this.$refs.vjsContainer.setAdmin(this.admin);
        },
        sync(args) {
            this.debug.lastSyncRecv = Date.now();

            if (this.admin) return;

            this.debug.lastRecvType = args.status;
            this.syncState = args;

            if (args.status === 'PLAYING') {
                this.$refs.vjsContainer.seek(this.getTimeSeconds() - args.offset);
                this.$refs.vjsContainer.play(true);
            } else {
                this.$refs.vjsContainer.seek(args.timestamp);
                this.$refs.vjsContainer.play(false);
            }
        },
        msg(args) {
            this.addMessage({
                type: 0,
                username: args.username,
                text: args.text,
            });
        },
        sysmsg(args) {
            this.addMessage({
                type: 1,
                level: args.level,
                username: "[!]",
                text: args.text,
            });
        },
        onKicked(args) {
            this.kicked = true;
        },
        time() {
            this.debug.t = this.getTime();

            if (this.debug.isDev) requestAnimationFrame(this.time);
        },

        async joinroom() {
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
            const latency = util.average(
                util.ignoreWorst(this.latency.records)
            );

            this.status = "Syncing time...";
            this.socket.emit("synctime", { latency });
            const serverTime = await waitFor(this.socket, "synctime");

            this.timeOffset = serverTime - Date.now();
            this.socket.emit("testtime", {
                time: this.getTime() + latency / 2,
            });

            this.debug.timeError = await waitFor(this.socket, "testtime");

            this.status = "Getting room info";
            this.socket.emit("joinroom", this.$route?.params?.id ?? "");

            const roomdata = await waitFor(this.socket, "joinroom");
            this.updateRoom(roomdata);

            this.socket.on("updateroom", this.updateRoom);
            this.socket.on("msg", this.msg);
            this.socket.on("sysmsg", this.sysmsg);
            this.socket.on("sync", this.sync);
            this.socket.on("kicked", this.onKicked);

            this.roomReady = true;
            this.intervals.push(setInterval(this.watchdog, 100));

            if (this.debug.isDev) requestAnimationFrame(this.time);
        },

        interaction() {
            this.joinroom();
            this.interactionNeeded = false;
        },

        watchdog() {
            if (this.admin) return;
            if (this.syncState === null) return;


            if (this.syncState.status === 'PLAYING') {

                if (this.$refs.vjsContainer.player.paused()) {
                    console.warn("[WD] Player should be playing!");

                    if (this.$refs.vjsContainer.player.readyState < 3) //dont bother playing if no data is ready
                        console.warn("[WD] player.readyState is less than HAVE_FUTURE_DATA");
                    else
                        this.$refs.vjsContainer.play(true);
                }
                const delta = Math.abs(this.$refs.vjsContainer.player.currentTime() - (this.getTimeSeconds() - this.syncState.offset));
                if (delta > constants.desyncTolerance) {
                    console.warn(`[WD] Player sync failing (delta =${delta})`);

                    this.$refs.vjsContainer.seek(this.getTimeSeconds() - this.syncState.offset);

                }

            } else {

                if (!this.$refs.vjsContainer.player.paused()) {
                    console.warn("[WD] Player not paused");

                    this.$refs.vjsContainer.play(false); //make sure the player is paused
                }

                const delta = Math.abs(this.$refs.vjsContainer.player.currentTime() - this.syncState.timestamp);
                if (delta > constants.desyncTolerance) {
                    console.warn(`[WD] Player at wrong timestamp (delta = ${delta})`);

                    this.$refs.vjsContainer.seek(this.syncState.timestamp);
                }
            }

        }
    },
    async mounted() {
        console.log("room.js mixin mounted");

        if (localStorage.getItem("dev") == "true") {
            this.debug.isDev = true;
        }

        const canJoin = await util.checkAutoplay();

        if (canJoin) {
            await this.joinroom();
        } else {
            this.status = "Click the button bellow to enable autoplay";
            this.interactionNeeded = true;
        }
    },
    beforeUnmount() {
        this.socket.disconnect()
        this.intervals.forEach(x => clearInterval(x));
    },
};
