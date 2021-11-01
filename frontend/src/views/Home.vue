<template>
    <div class="main">
        <h1 class="title">Shitty<br />Sync</h1>
        <div class="text-btn">
            <input
                class="text"
                type="text"
                spellcheck="false"
                placeholder="Room code"
                @input="removeUnsafeChars"
                @keypress.enter="gotoRoom"
                ref="roomCode"
                size="16"
                maxlength="16"
            />
            <div class="btn" @click="gotoRoom">GO</div>
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
            date: process.env["VUE_APP_DATE"]
        };
    },
    methods: {
        removeUnsafeChars(e) {
            e.target.value = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9\-]/gi, "") //TODO: this code is still quite bad
                .substring(0, 16);
        },
        gotoRoom() {
            const code = this.$refs.roomCode.value
                .toUpperCase()
                .replace(/[^A-Z0-9\-]/gi, "")
                .substring(0, 16);
            if (code.length > 2)
                this.$router.push({ name: "NRoom", params: { id: code } });
            else alert("Invalid code");
        },
    },
};
</script>

<style lang="less" scoped>
@import url("@/assets/theme.less");

.main {
    background-color: @background;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .title {
        background: linear-gradient(@primary 75%, transparent 100%);
        background-clip: text;
        -webkit-text-fill-color: transparent;

        font-size: 144px;
        font-weight: 500px;
        line-height: 150px;
        text-transform: uppercase;
        text-align: center;

        margin: 10px;
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
        color: @background;
        margin: 0;
        font-weight: bold;
        font-size: 18px;
        padding: 0 10px;
        line-height: 48px;
        user-select: none;
        background-color: @background-light;
    }
    .btn:hover {
        background-color: @primary;
    }
}
.stats {
    position: absolute;
    right: 0;
    bottom: 0;

    text-align: right;
    padding: 10px;

    color: @background-light;

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
