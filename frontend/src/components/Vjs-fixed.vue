<template>
    <div class="video-container">
        <!-- The video here gets created in runtime -->
        <!-- I wish there was a better way -->
    </div>
</template>

<script>
import videojs from "video.js";
import "video.js/dist/video-js.css";
import "@/assets/vjs.orange.css";
import "videojs-youtube";
export default {
    props: {
        source: { type: Object },
    },
    data() {
        return {
            player: null,
            options: {
                autoplay: false,
                controls: true,
            },
            reset: false,
        };
    },
    created() {
        this.$watch("source", this.change, true);
    },
    mounted() {
        this.recreate();
    },
    beforeUnmount() {
        if (this.player) {
            this.player.dispose();
        }
    },
    methods: {
        recreate() {
            if (this.player) this.player.dispose();
            const video = document.createElement("video");
            video.classList = "video-js vjs-theme-orange";
            this.$el.appendChild(video);
            this.player = videojs(video, this.options);
        },
        async change(cur, prev) {
            console.log({ cur, prev });

            this.options.techOrder =
                cur.type == "video/youtube" ? ["youtube"] : ["html5"];
            this.options.sources = [{src:cur.src,type:cur.type}];
            this.recreate();
        },
    },
};
</script>