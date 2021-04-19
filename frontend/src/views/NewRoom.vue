<template>
    <div class="main" ref="main">
        <div class="content">
            <div class="media-container">
                <videojs class="video" :options="videoOptions" />
            </div>
            <div class="users" ref="users">
                <user
                    name="TestTestTestTest"
                    :admin="true"
                    :local="true"
                    id="admin"
                />
                <user
                    v-for="n in 15"
                    :key="n"
                    :name="`test${n}`"
                    :admin="false"
                    :local="false"
                    :islocaladmin="true"
                    :id="`${n}a${n * n}`"
                />
            </div>
        </div>
        <div class="chat">
            <div class="top">
                <span>(room code)</span>
                <share />
                <media-picker />
                <theme-toggle />
            </div>
            <div class="messages">
                <message
                    v-for="n in 100"
                    :key="n"
                    username="m"
                    :message="`kek ${n}`"
                />
            </div>
            <chat-textbox :maxlength="120" />
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
import Videojs from "../components/videojs.vue";
export default {
    components: {
        ThemeToggle,
        User,
        Share,
        ChatTextbox,
        Message,
        MediaPicker,
        Videojs,
    },
    $refs: {
        users: HTMLDivElement,
    },
    data() {
        return {
            videoOptions: {
                autoplay: false,
                controls: true,
                sources: [],
            },
        };
    },
    methods: {
        userScroll(e) {
            this.$refs.users.scrollLeft += e.deltaY;
        },
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

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
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
            .video{
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
        }
        .message-box {
            height: fit-content;
            background-color: @background;
            box-shadow: 0px 0px 10px 5px #0004;
        }
    }
}
</style>