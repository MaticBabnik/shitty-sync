<template>
    <div class="video-card">
        <img :src="thumbnail" />
        <div class="info">
            <span class="title">{{ title }}</span>
            <span class="author">{{ author }}</span>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        title: { type: String, required: true },
        author: { type: String, required: true },
        thumbnail: { type: String, required: true },
        url: { type: String, required: true }
    }
}
</script>

<style lang="less">
@import url('../assets/theme.less');

.video-card {
    .transition;
    display: flex;
    flex-direction: row;
    margin: 5px;
    width: 350px;

    &:hover {
        background: @background-light;
    }

    img {
        width: 112px;
        height: 62px;
    }

    .info {
        padding-left: 5px;

        .title {
            color: @primary;
            font-size: 0.7rem;
            display: block;
            word-wrap: break-word;
        }
        .author {
            color: @text;
            font-size: 0.6rem;
            display: block;
        }
    }
}
</style>
