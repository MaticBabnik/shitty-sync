/*
*   Room.js
?   A mixin for handling all of the socket.io communication
!   prolly a bad idea...
!   IDFK what im doing
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
            admin: false
        };
    },
    methods: {

        getTime() {
            return Date.now() + this.timeOffset;
        },


        //? ------------------------------------------------------------------------
        //? Socket event emitters
        //? ------------------------------------------------------------------------
        kick(id) {
            this.socket.emit("kick",{target:id});
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
            this.socket.emit("msg", { text });
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
            this.admin =
                this.users.find((x) => x.id === this.socket.id)?.role ===
                "admin";
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
        const delta = await waitFor(this.socket, "testtime");
        console.log(
            `delta @ client : ${this.timeOffset}\ndelta @ sever : ${delta}`
        );
        this.status = "Getting room info";
        this.socket.emit("joinroom",this.$route?.params?.id ?? '');
        const roomdata = await waitFor(this.socket, "joinroom");
        this.updateRoom(roomdata);
        this.socket.on("updateroom", this.updateRoom);
        this.socket.on("msg", this.msg);
        this.socket.on("sysmsg", this.sysmsg);

        this.socket.on("kicked",this.onKicked);
        this.roomReady = true;
    },

    beforeUnmount() {
        this.socket.disconnect()
    },
}