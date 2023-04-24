<template>
  <div class="overlay">
    <div class="dialog">
      <div class="titlebar">
        <span>{{ title }}</span>
        <s-icon @click="close" file="/icons.svg" name="close" class="close-btn" />
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import SIcon from './SIcon.vue'
export default {
  components: { SIcon },
  props: {
    title: { type: String, default: () => 'Popup' }
  },
  methods: {
    close() {
      this.$emit('close')
    }
  }
}
</script>

<style lang="less">
@import url('@/assets/theme.less');

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  backdrop-filter: grayscale(50%) blur(4px);

  display: flex;
  align-items: center;
  justify-content: center;

  .dialog {
    background-color: @background;
    border: 2px @background-light solid;

    display: flex;
    flex-direction: column;
    align-items: stretch;

    border-radius: 5px;
    padding: 3px;

    min-width: 300px;
    min-height: 100px;

    .titlebar {
      user-select: none;
      display: flex;
      flex-direction: row;
      width: 100%;
      span {
        flex: 1;
        vertical-align: middle;
      }
      .close-btn {
        fill: @text;
        cursor: pointer;
      }
      margin-bottom: 10px;
    }
  }
}
</style>
