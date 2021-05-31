<template>
 <div class="progress-bar">
     <div class="progress" :style="`width: ${value}%;`">

     </div>
 </div> 
</template>

<script>
export default {
    props:{
        value: {
            type:Number,
            required:true
        }
    }
}
</script>

<style lang="less">
@import url('@/assets/theme.less');

.progress-bar 
{
    width: 100%;
    height: 2px;
    margin: 0;
    padding: 0;
    position: relative;
    .progress{
        background-color: @primary;
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
    }
}

</style>