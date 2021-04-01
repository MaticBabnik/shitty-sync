<template>
    <div class="main">
        <div id="content">
            <videojs class="video" :options="videoOptions"> </videojs>
            <h1 class="section-title">Party ({{ users.length }} members):</h1>
            <div class="user-grid">
                <person
                    v-for="(user, index) in users"
                    :key="index"
                    :nickname="user.nickname"
                    :id="user.id"
                    :role="user.role"
                    :isLocalUserAdmin="admin"
                    :isLocalUser="socket.id === user.id"
                    @promote="promote"
                    @changeNick="changeNick"
                />
            </div>
            <video-picker v-if="admin" />
        </div>
        <div id="chat">
            <div class="msg-container">
                <template v-for="(message, index) in messages">
                    <message
                        v-if="message.type == 0"
                        :key="index * 2"
                        :username="message.username"
                        :message="message.text"
                    />
                    <system-message
                        v-else
                        :key="index * 2 + 1"
                        :message="message.text"
                        :level="message.level"
                    />
                </template>
            </div>
            <textarea
                ref="chatInput"
                @input="singleLineAutoGrow"
                @keypress.enter="sendMessage"
            ></textarea>
            <progress-bar :value="nextMessage.progress" />
        </div>
        <div class="popup" v-if="!roomReady">
            <img src="@/assets/Spinner.svg" />
            <p>{{ status }}</p>
        </div>
    </div>
</template>

<script>
import { io } from "socket.io-client";

import SystemMessage from "@/components/SystemMessage.vue";
import ProgressBar from "@/components/ProgressBar.vue";
import VideoPicker from "@/components/VideoPicker.vue";
import Message from "@/components/Message.vue";
import Videojs from "@/components/videojs.vue";
import Person from "@/components/Person.vue";

import { waitFor, delay } from "../async-utils";
import constants from "@/constants";
import util from "@/util";

export default {
    components: {
        Message,
        Videojs,
        Person,
        ProgressBar,
        SystemMessage,
        Message,
        VideoPicker
    },
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
            nextMessage: {
                time: Date.now(),
                progress: 100,
            },
            status: "Waiting for WS",
            roomReady: false,
            socket: null,
            messages: [],
            users: [],
            admin: false,
            videoOptions: {
                autoplay: false,
                controls: true,
                sources: [],
            },
        };
    },
    methods: {
        
        //? ------------------------------------------------------------------------
        //? UI CODE
        //? ------------------------------------------------------------------------

        singleLineAutoGrow(e) {
            e.target.value = e.target.value.replace(/\n/g, "");
            e.target.value = e.target.value.substring(0, 140);
            e.target.style.height = e.target.scrollHeight - 4 + "px";
        },

        updateProgressbar() {
            const d =
                Date.now() - this.nextMessage.time + constants.messageCooldown;

            this.nextMessage.progress =
                Math.min(d, constants.messageCooldown) / 10.0;
            if (this.nextMessage.progress !== 100)
                requestAnimationFrame(this.updateProgressbar);
        },

        getTime() {
            return Date.now() + this.timeOffset;
        },

        //? ------------------------------------------------------------------------
        //? Socket event emitters
        //? ------------------------------------------------------------------------
        
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

        sendMessage() {
            if (this.nextMessage.progress !== 100) return;
            if (this.$refs.chatInput.value.trim().length < 1) return;
            this.socket.emit("msg", { text: this.$refs.chatInput.value });
            this.$refs.chatInput.value = "";
            this.singleLineAutoGrow({ target: this.$refs.chatInput });
            this.nextMessage.time = Date.now() + constants.messageCooldown;
            requestAnimationFrame(this.updateProgressbar);
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
                this.users.find((x) => x.id === this.socket.id).role ===
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
                text: args.text,
            });
        },

    },
    async mounted() {
        //make sure the input is sized properly 
        this.singleLineAutoGrow({ target: this.$refs.chatInput });
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

        this.socket.emit("joinroom");

        const roomdata = await waitFor(this.socket, "joinroom");

        this.updateRoom(roomdata);

        this.socket.on("updateroom", this.updateRoom);
        this.socket.on("msg", this.msg);
        this.socket.on("sysmsg", this.sysmsg);
        this.roomReady = true;
    },
    beforeUnmount() {
        this.socket.disconnect()
    },
};
</script>

<style lang="less">
@import url("../assets/colors.less");
* {
    font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
.main {
    background-color: @base03;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    overflow: hidden;
}

#content {
    flex: 1;
    overflow-y: scroll;
}

#chat {
    width: 400px;
    display: flex;
    flex-direction: column;
    padding: 0;

    .msg-container {
        flex: 1;
        display: flex;
        flex-direction: column-reverse;
        overflow-y: scroll;
    }
    textarea {
        width: 100%;
        height: fit-content;
        background-color: @base02;
        color: @base00;
        font-size: 20px;
        padding: 2px;
        line-height: 24px;
        margin: 0;
    }
}
.input-url {
    background-color: @base02;
    color: @base00;
    border: 1px solid @base00 !important;
    border-radius: 3px;
}

/* reset input cancer */
textarea,
textarea:active,
textarea:focus input,
input:active,
input:focus {
    border: none;
    outline: none;
    resize: none;
}

.video {
    width: 100%;
    height: 100%;
    max-height: 80vh;
    background-color: black;
}

.section-title {
    font-size: 24px;
    color: @magenta;
    margin: 5px;
}

.user-grid {
    padding: 1rem;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    grid-gap: 1rem;
}

/* width */
::-webkit-scrollbar {
    width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
    background-color: #8884;
}

/* Handle */
::-webkit-scrollbar-thumb {
    background: #2aa198;
}

.popup {
    position: absolute;
    z-index: 10;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;

    backdrop-filter: blur(4px);

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    img {
        height: 40%;
        width: 40%;
    }
    p {
        color: @base00;
        font-size: 32px;
    }
}
</style>