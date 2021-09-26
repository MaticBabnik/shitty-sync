<template>
    <div class="main" ref="main">
        <div class="content">
            <div class="media-container">
                <videojs
                    class="video"
                    id="video-main"
                    ref="vjsContainer"
                    @vplay="syncPlay"
                    @vpause="syncPause"
                    @vseek="syncSeek"
                />
            </div>
            <div class="users" ref="users">
                <user
                    v-for="user in users"
                    :key="user.id"
                    :name="user.nickname"
                    :admin="user.role === 'admin'"
                    :local="user.id === socket.id"
                    :islocaladmin="admin"
                    :id="user.id"
                    @kick="kick"
                    @promote="promote"
                    @rename="changeNick"
                />
            </div>
        </div>
        <div class="chat">
            <div class="top">
                <span>{{ roomCode }}</span>
                <share />
                <media-picker v-if="admin" @select="changeMedia" />
                <theme-toggle />
            </div>
            <devtools
                :debug="debug"
                :admin="admin"
                :latency="latency"
                :timeOffset="timeOffset"
                v-if="debug.isDev"
            />
            <div class="messages" ref="msgbox">
                <message
                    v-for="(msg, index) in messages"
                    :key="index"
                    :username="msg.username"
                    :message="msg.text"
                    :type="msg.type"
                />
            </div>
            <chat-textbox :maxlength="120" @send="sendMessage" />
        </div>
        <div class="l-overlay" v-if="!roomReady">
            <h1>Joining...</h1>
            <div class="progress-bar"></div>
            <p>{{ status }}</p>
            <div class="button" v-if="interactionNeeded" @click="interaction">
                Continue
            </div>
        </div>
        <div class="l-overlay" v-if="kicked">
            <h1>Kicked from room</h1>
            <p>
                #unlucky
                <br />
                <i>psst! nothing is stopping you from reloading the page 🙃</i>
            </p>
        </div>
    </div>
</template>

<script>
import ChatTextbox from "../components/ChatTextbox.vue";
import MediaPicker from "../components/MediaPicker.vue";
import Message from "../components/Message.vue";
import Share from "../components/Share.vue";
import ThemeToggle from "../components/ThemeToggle.vue";
import User from "../components/User.vue";
import Videojs from "../components/VideoJS.vue";
import Devtools from "../components/Devtools.vue";

import roomMixin from "@/room.js";

export default {
    mixins: [roomMixin],
    components: {
        ThemeToggle,
        User,
        Share,
        ChatTextbox,
        Message,
        MediaPicker,
        Videojs,
        Devtools,
    },
    data() {
        return {
            branch: process.env["VUE_APP_BRANCH"] ?? "unknown",
            commit: (process.env["VUE_APP_COMMIT"] ?? "unknown").substr(0, 7),
        };
    },
    methods: {
        userScroll(e) {
            this.$refs.users.scrollLeft += e.deltaY;
        },
        isAtBottom() {
            const el = this.$refs.msgbox;
            return el.scrollTop + el.clientHeight === el.scrollHeight;
        },
        scrollToBottom() {
            const el = this.$refs.msgbox;
            el.scrollTo({left:0,top:el.scrollHeight+10000, behavior:"smooth"});
        }
    },
    mounted() {
        this.$refs.users.addEventListener("wheel", this.userScroll, {
            passive: true,
        });
    },
};
</script>

<style lang="less">
@import url("@/assets/theme.less");

.cm {
    position: absolute;
    z-index: 3;
}

.l-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}

.l-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: @background;

    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;

    h1 {
        color: @text;
        font-family: "Roboto";
        font-weight: 300;
    }
    .progress-bar {
        width: 500px;
        height: 4px;
        background-color: #222;
        background: linear-gradient(90deg, #0000 40%, @primary 50%, #0000 60%);
        background-size: 220%;
        animation: Loading 1s cubic-bezier(0.3, 0, 0.7, 1) infinite;
        border-radius: 2px;
    }

    @keyframes Loading {
        0% {
            background-position: 0% 50%;
        }
        50% {
            background-position: 100% 50%;
        }
        100% {
            background-position: 0% 50%;
        }
    }
}

.main {
    width: 100vw;
    height: 100vh;

    display: flex;
    flex-direction: row;

    background-color: @background;

    .content {
        flex: 1;

        display: flex;
        flex-direction: column;
        align-items: stretch;

        .media-container {
            background-color: #000;
            flex: 1;
            .video-container {
                width: 100%;
                height: 100%;
            }
        }
        .users {
            height: 96px;
            width: calc(100vw - 400px);

            display: flex;
            flex-direction: row;

            overflow-x: scroll;
        }
    }

    .chat {
        width: 400px;

        display: flex;
        flex-direction: column;

        background-color: @background-light;
        box-shadow: 0px 0px 10px 5px #0004;
        overflow: hidden;

        .top {
            height: 36px;

            display: flex;
            flex-direction: row;
            align-items: center;
            padding-left: 10px;

            background-color: @background;
            box-shadow: 0px 0px 10px 5px #0004;

            span {
                flex: 1;
            }
        }
        .messages {
            flex: 1;
            overflow-y: scroll;
            display: flex;
            flex-direction: column;
        }
        .message-box {
            height: fit-content;
            background-color: @background;
            box-shadow: 0px 0px 10px 5px #0004;
        }
    }
}
</style>
