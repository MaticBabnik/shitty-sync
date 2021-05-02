<template>
    <video ref="videoPlayer" class="video-js vjs-theme-orange"></video>
</template>

<script>

import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@/assets/vjs.orange.css";

export default {
    props: {
        options: {
            type: Object,
            default() {
                return {};
            },
        },
    },
    data() {
        return {
            player: null,
        };
    },
    mounted() {
        this.player = videojs(
            this.$refs.videoPlayer,
            this.options,
            function onPlayerReady() {
            }
        );
    },
    beforeUnmount() {
        if (this.player) {
            this.player.dispose();
        }
    },
};
</script>