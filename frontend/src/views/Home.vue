<template>
    <div class="main">
        <h1 class="title">Sync</h1>
        <div class="text-btn">
            <input
                class="text"
                type="text"
                spellcheck="false"
                placeholder="Room code"
                @keypress.enter="gotoRoom"
                ref="roomCode"
                size="16"
                maxlength="16"
            />
            <button class="btn" @click="gotoRoom">Join</button>
        </div>
        <theme-toggle class="theme-toggle" />
        <span class="stats">
            <a href="https://github.com/maticbabnik/shitty-sync.git">Repo</a
            ><br />
            Branch: {{ branch }}<br />
            Commit: {{ commit }}<br />
            Built on: {{ date }}
        </span>
    </div>
</template>

<script>
import ThemeToggle from "../components/ThemeToggle.vue";
export default {
    components: {
        ThemeToggle,
    },
    data() {
        return {
            branch: process.env["VUE_APP_BRANCH"] ?? "unknown",
            commit: (process.env["VUE_APP_COMMIT"] ?? "unknown").substr(0, 7),
            date: process.env["VUE_APP_DATE"],
        };
    },
    methods: {
        gotoRoom() {
            const code = this.$refs.roomCode.value;
            if (code.length >= 1)
                this.$router.push({ name: "Room", params: { id: code } });
            else alert("Invalid code");
        },
    },
};
</script>

<style lang="less" scoped>
@import url("@/assets/theme.less");

button {
    border: none;
    outline: none;
}

.main {
    user-select: none;
    background-color: @background;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .title {
        color: @primary;
        font-size: 7rem;
        margin: 1rem;
    }
}

.text-btn {
    height: 48px;
    border-radius: 24px;
    display: flex;
    align-items: stretch;
    overflow: hidden;
    border: 2px solid @background-light;

    .text {
        background-color: @background;
        color: @text;
        font-size: 36px;
        border: 0px !important;
        padding: 0;
        margin-left: 12px;
    }
    .btn {
        transition: 0.3s ease;
        color: @primary;
        cursor: pointer;
        margin: 0;
        font-weight: bold;
        font-size: 18px;
        padding: 0 10px;
        line-height: 48px;
        user-select: none;
        background-color: @background-light;
    }
    .btn:hover {
        color: @background;
        background-color: @primary;
    }
}
.stats {
    user-select: text;
    position: absolute;
    right: 0;
    bottom: 0;

    text-align: right;
    padding: 10px;

    color: @text;

    opacity: 0.8;

    a {
        color: @accent;
    }
}
.theme-toggle {
    position: absolute;
    top: 0;
    right: 0;
}
</style>
