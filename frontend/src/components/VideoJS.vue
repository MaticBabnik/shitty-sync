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
    mounted() {
        this.recreate();
    },
    beforeUnmount() {
        if (this.player) {
            this.player.dispose();
        }
    },
    emits: ["vplay", "vpause", "vseek"],
    methods: {
        recreate() {
            if (this.player) this.player.dispose();

            const video = document.createElement("video");
            video.classList = "video-js vjs-theme-orange";
            this.$el.appendChild(video);

            this.player = videojs(video, this.options);

            this.player.on("play", () => {
                this.$emit("vplay", this.player.currentTime());
            });

            this.player.on("pause", () => {
                this.$emit("vpause", this.player.currentTime());
            });

            this.player.on("seeked", (args) => {
                this.$emit(
                    "vseek",
                    this.player.currentTime(),
                    !this.player.paused()
                );
            });
        },
        change(src) {
            if (src.type == "video/youtube") {
                this.options.sources = [
                    { src: src.src, type: "video/youtube" },
                ];
                this.options.techOrder = ["youtube"];
            } else {
                this.options.sources = [{ src: src.src }];
                this.options.techOrder = ["html5"];
            }
            this.recreate();
        },

        seek(cur) {
            //console.log('seeking')
            this.player.currentTime(cur);
        },
        play(cur) {
            //console.log('changing play state')
            if (cur) this.player.play();
            else this.player.pause();
        },
    },
};
</script>

<style lang="less">
.video-container {
    position: relative;

    min-width: 300px;
    width: fit-content;
    height: fit-content;
    min-height: 150px;

    .video-js {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
}
</style>