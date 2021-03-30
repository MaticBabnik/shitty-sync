<template>
    <div class="main home">
        <h1 class="title">
            Shitty-sync
            <github-button
                href="https://github.com/fubuki-fanclub/shitty-sync"
                data-color-scheme="no-preference: dark; light: dark; dark: dark;"
                data-icon="octicon-star"
                data-show-count="true"
                aria-label="Star fubuki-fanclub/shitty-sync on GitHub"
                >Star</github-button
            >
        </h1>
        <p class="desc">A pretty shitty way to watch stuff together</p>
        <div class="room-code-container">
            <input
                class="textbox-big"
                type="text"
                @input="removeUnsafeChars"
                ref="roomCode"
            />
            <p class="button-big" @click="gotoRoom">Join/Create</p>
        </div>
    </div>
</template>

<script>
import GithubButton from "vue-github-button";

export default {
    components: {
        GithubButton,
    },
    methods: {
        removeUnsafeChars(e) {
            e.target.value = e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9\-]/gi, "")  //TODO: this code is still quite bad
                .substring(0, 16);
        },
        gotoRoom() {
            const code = this.$refs.roomCode.value
                .toUpperCase()
                .replace(/[^A-Z0-9\-]/gi, "")
                .substring(0, 16);
            if (code.length > 2)
                this.$router.push({ name: "Room", params: { id: code } });
            else alert("Invalid code");
        },
    },
};
</script>

<style lang="less">
@import url("@/assets/colors.less");

.main.home {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    .title {
        margin: 10px 0;
        color: @cyan;
    }
    .desc {
        color: @base00;
    }
    .room-code-container {
        display: flex;
        height: 40px;
        flex-direction: row;
    }
}

.textbox-big {
    border: none;
    background-image: none;
    background-color: transparent;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    box-shadow: none;

    color: @base00;
    background-color: @base02;
    border-radius: 4px;
    box-sizing: border-box;

    font-family: monospace;
    font-size: 24px;
    padding: 3px;
}
.textbox-big:focus {
    border-bottom: 1px solid @base00;
}
.button-big {
    font-size: 18px;
    border: 1px solid @red;
    color: @red;
    border-radius: 4px;
    display: inline;
    padding: 7px;
    user-select: none;
    cursor: pointer;
    margin: 0 10px;
    line-height: 100%;
}
.button-big:hover {
    color: @base03;
    background-color: @red;
}
</style>