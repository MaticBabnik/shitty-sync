<template>
    <div class="video-container">
        <!-- Video gets created here -->
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
            customOptions: {
                admin: false,
            },
            options: {
                preload: true,
                userActions: {
                    hotkeys: false,
                },
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
            // backup / init volume setting
            if (this.player) this.player.dispose();

            const video = document.createElement("video");
            video.classList = "video-js vjs-theme-orange";
            this.$el.appendChild(video);

            this.options.userActions.hotkeys = this.customOptions.admin;
            this.player = videojs(video, this.options);

            const localVolume = localStorage.getItem("playerVolume");
            if (!localVolume) localStorage.setItem("playerVolume", 0.5);
            this.player.volume(parseFloat(localVolume ?? 0.5));

            this.player.on("volumechange", () => {
                localStorage.setItem("playerVolume", this.player.volume());
            });

            window.pl = this.player;
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

            window.v = this.player;

            if (this.customOptions.admin) {
                this.player.controlBar.progressControl.enable();
                this.player.controlBar.playToggle.enable();
                this.player.removeClass("disable-user");
            } else {
                this.player.controlBar.progressControl.disable();
                this.player.controlBar.playToggle.disable();
                this.player.addClass("disable-user");
            }
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
        setAdmin(val) {
            this.customOptions.admin = val;

            if (this.customOptions.admin) {
                //TODO implement custom hotkey handler, just to be sure...
                this.player.controlBar.progressControl.enable();
                this.player.controlBar.playToggle.enable();
                this.player.removeClass("disable-user");
            } else {
                this.player.controlBar.progressControl.disable();
                this.player.controlBar.playToggle.disable();
                this.player.addClass("disable-user");
            }
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

//I hate this
.disable-user.video-js > *:not(.vjs-control-bar) {
    pointer-events: none;
}
</style>
