<template>
  <p class="msg">
    <span class="username">{{ displayUsername }}: </span>
    <span class="text" v-html="type != 2 ? emoteHtml : message"></span>
  </p>
</template>

<script>
import emotePaths from '../assets/emotes.json'

const emoteReplacer = emotePaths.map(([name, path]) => {
  return [
    new RegExp(`\\b${name}\\b`, 'gi'),
    `<img class="emote" alt="${name}" title="${name}" src="${path}">`
  ]
})

export default {
  props: {
    type: {
      type: Number
    },
    username: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    }
  },
  computed: {
    emoteHtml() {
      const escapedMsg = this.message.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')

      const msg = emoteReplacer.reduce((msg, [reg, img]) => msg.replace(reg, img), escapedMsg).replace(/>\s+</g, '><');
      return msg
    },
    displayUsername() {
      return this.type == 2 ? `⚙️ ${this.username}` : this.username
    }
  },
}
</script>

<style lang="less">
@import url('../assets/theme.less');

.msg {
  color: @text;
  margin: 3px;
  font-size: medium;
  .text {
    line-height: 26px;
    vertical-align: middle;
    word-break: break-word;
    .emote {
      height: 24px;
      vertical-align: middle;
    }
  }
  .username {
    color: @primary;
    font-weight: bold;
  }
}
</style>
