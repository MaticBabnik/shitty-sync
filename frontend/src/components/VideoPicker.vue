<template>
    <div class="video-picker">
        <h1>Source:</h1>
        <div class="tabs-flex">
            <div class="tab">CDN file</div>
            <div class="tab active">Youtube video</div>
        </div>
        <input type="text" name="" id="" />
        <div class="small-btn">Set</div>
    </div>
</template>

<script>
export default {};
</script>

<style lang="less">
@import url("@/assets/colors.less");

.video-picker {
    border: 1px solid @base00;
    border-radius: 3px;

    display: block;
    width: fit-content;
    margin: 5px;
    padding: 5px;
    h1 {
        color: @magenta;
        font-size: 24px;
    }
    .tabs-flex {
        display: flex;
        flex-direction: row;
        .tab {
            background-color: @base03;
            color: @orange;
            margin: 0;
            padding: 1px 4px;
        }
        .tab.active {
            background-color: @orange;
            color: @base03;
        }
        margin-bottom: 0;
    }
    input {
        background-color: @base02;
        display: block;
        color: @base00;
        margin-top: 0;
        border: 1px solid @orange !important;
        border-radius: 0px 3px 3px 3px;
    }
}

/* reset input cancer */
textarea,
textarea:active,
textarea:focus input,
input:active,
input:focus {
    border: none;
    outline: none;
    resize: none;
}
</style>