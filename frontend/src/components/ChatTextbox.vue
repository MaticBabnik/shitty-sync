<template>
  <div class="chat-textbox">
    <progress-bar :value="nextMsgProgress" />

    <textarea
      rows="1"
      ref="textarea"
      class="textbox"
      :maxlength="maxlength"
      placeholder="Message..."
      @keypress.enter="send"
      @input="change"
      @change="change"
    />
    <span class="char-limit">{{ len }}/{{ maxlength }}</span>
  </div>
</template>

<script>
import ProgressBar from './ProgressBar.vue'
export default {
  components: { ProgressBar },
  data() {
    return {
      len: 0,
      nextMsgTime: Date.now(),
      nextMsgProgress: 100
    }
  },
  $refs: {
    textarea: HTMLTextAreaElement
  },
  props: {
    maxlength: { type: Number, required: true },
    timeout: { type: Number, default: () => 2000 }
  },
  methods: {
    send(e) {
      e.preventDefault()

      if (this.nextMsgProgress !== 100) return

      if (this.$refs.textarea.value.trim().length === 0) return

      this.$emit('send', this.$refs.textarea.value.replace(/\s+/g, ' '))
      this.$refs.textarea.value = ''
      this.nextMsgTime = Date.now() + this.timeout
      this.change(e)
      requestAnimationFrame(this.autoGrow)
      this.updateProgress()
    },
    updateProgress() {
      this.nextMsgProgress =
        ((this.timeout - Math.max(this.nextMsgTime - Date.now(), 0)) / this.timeout) * 100
      if (this.nextMsgProgress < 100) requestAnimationFrame(this.updateProgress)
    },
    change(e) {
      this.len = e.target.value.length
      this.autoGrow()
    },
    autoGrow() {
      const style = window.getComputedStyle(this.$refs.textarea)
      this.$refs.textarea.style.height = 'auto'
      this.$refs.textarea.style.height = `calc(${style.borderTopWidth} + ${style.borderBottomWidth} + ${this.$refs.textarea.scrollHeight}px)`

      if (
        parseFloat(this.$refs.textarea.style.height) >=
        parseFloat(this.$refs.textarea.style.maxHeight)
      ) {
        this.$refs.textarea.style.overflowY = 'scroll'
        this.$refs.textarea.style.height = this.$refs.textarea.style.maxHeight
      } else {
        this.$refs.textarea.style.overflow = 'hidden'
      }
    }
  },
  mounted() {
    this.autoGrow()
  }
}
</script>

<style lang="less">
@import url('@/assets/theme.less');
.chat-textbox {
  display: flex;
  flex-direction: column;

  background-color: @background;
  color: @text;
  align-items: stretch;
  textarea {
    background-color: @background;
    color: @text;
    font-size: 1.2rem;
    border: 0px !important;
    padding: 2;
    resize: none;
    overflow: hidden;
  }
  span.char-limit {
    color: @background-light;
    text-align: right;
    font-size: 0.6rem;
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
