<template>
    <div class="main" ref="main">
        <div class="content">
            <div class="media-container"></div>
            <div class="users">
                <user name="TestTestTestTest" :admin="true" :local="true" />
                <user
                    v-for="n in 15"
                    :key="n"
                    :name="`test${n}`"
                    :admin="false"
                    :local="false"
                />
            </div>
        </div>
        <div class="chat">
            <div class="top">
                <span>(room code)</span>
                <icon class="icon" file="/icons.svg" name="share" />
                <icon class="icon" file="/icons.svg" name="edit" />
                <theme-toggle />
            </div>
            <div class="messages"></div>
            <div class="message-box">kek</div>
        </div>
    </div>
</template>

<script>
import Icon from "../components/Icon.vue";
import ThemeToggle from "../components/ThemeToggle.vue";
import User from "../components/User.vue";
export default {
    components: { ThemeToggle, Icon, User },
    data() {
        return {};
    },
    methods: {},
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