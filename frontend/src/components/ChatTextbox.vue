<template>
    <div class="chat-textbox">
        <span class="textbox" contenteditable placeholder="Message..." @input="change"></span>
        <span class="char-limit">{{ len }}/{{ maxlength }}</span>
    </div>
</template>

<script>
export default {
    data() {
        return {
            len: 0,
        };
    },
    props: {
        maxlength: { type: Number, required: true },
    },
    methods: {
        change(e) {
            this.len = e.target.innerText.length;
            e.target.innerText = e.target.innerText.substr(0,120);
        },
    },
};
</script>

<style lang="less">
@import url("@/assets/theme.less");
.chat-textbox {
    display: flex;
    flex-direction: column;

    background-color: @background;
    color: @text;
    align-items: stretch;

    span[contenteditable] {
        font-size: 20px;
        background-color: @background;
        color: @text;
        border: none !important;
    }
    span.char-limit {
        color: @background-light;
        text-align: right;
    }
}
.textbox,
.textbox:active,
.textbox:focus {
    border: none;
    outline: none;
    resize: none;
}
</style>