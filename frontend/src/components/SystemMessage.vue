<template>
  <p class="s-msg">
    <span class="system">System: </span>
    <span :class="`text ${level}`">{{message}}</span>
  </p>
</template>

<script>
export default {
    props: {
        message: {
            type: String,
            required: true,
        },
        level:{
            type: String
        }
    },
};
</script>

<style lang="less">
@import url("../assets/theme.less");

.s-msg {
  color: @base00;
  margin: 3px;
  font-size: medium;
  font-weight: 800;
  .text {
      line-height: 26px;
      vertical-align: middle;
  }
  .system {
    color: @magenta;
  }
}
.error {
    color: @red;
}
.warn {
    color: @yellow;
}
.info {
    color: @blue;
}
</style>