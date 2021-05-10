<template>
    <video ref="videoPlayer" class="video-js vjs-theme-orange" width="800" height="600"></video>
</template>

<script>
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@/assets/vjs.orange.css";
import "videojs-youtube";

export default {
    props: {
        options: {
            type: Object,
            default() {
                return {
                    autoplay: false,
                    controls: true,
                    techOrder: ["youtube", "html5"],
                    sources: [
                    ],
                };
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
            function onPlayerReady() {}
        );
    },
    beforeUnmount() {
        if (this.player) {
            this.player.dispose();
        }
    },
};
</script>