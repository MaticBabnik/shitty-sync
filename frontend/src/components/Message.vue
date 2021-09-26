<template>
  <p class="msg">
    <span class="username">{{ username }}: </span>
    <span class="text" v-html="type != 2 ? emoteHtml : message"></span>
  </p>
</template>

<script>
import emotePaths from "../assets/emotes.json";

const emoteReplacer = emotePaths.map(x=>{
    return [new RegExp(`(^|\\s)${x[0]}(?=$|\\s)`,'gi'),`<img class="emote" src="${x[1]}">`]
})


export default {
    props: {
        type: {
            type: Number
        },
        username: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
    },
    computed: {
        emoteHtml() {
            let msg = this.escapeHtml(this.message)
            emoteReplacer.forEach(replacer => {
                msg = msg.replace(replacer[0],replacer[1]);
            });
            return msg;
        },
    },
    methods: {
        escapeHtml(unsafe) {
            return unsafe
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        },
    },
};
</script>

<style lang="less">
@import url("../assets/theme.less");

.msg {
  color: @text;
  margin: 3px;
  font-size: medium;
  .text {
      line-height: 26px;
      vertical-align: middle;
      word-break: break-all;
      .emote {
          width: 24px;
          height: 24px;
          padding: 0;
          margin: 0;
          display: inline;
          vertical-align: middle;
      }
  }
  .username {
    color: @primary;
    font-weight: bold;
  }
}
</style>