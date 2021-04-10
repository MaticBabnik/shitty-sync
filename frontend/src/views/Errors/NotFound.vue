<template>
<div class="main error-page">
  <h1 class="error">Error 4<span class="gray">xx</span></h1>
  <router-link to="/" class="link"> Go home </router-link>
</div>
</template>

<style lang="less">
@import url('@/assets/theme.less');
.main.error-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  .error {
    color:@red;
    text-align: center;
    font-size: 72px;
    .gray {
      color:@base01;
    }
  }
  .link{
    color:@cyan;
    text-align: center;
  }
}
</style>