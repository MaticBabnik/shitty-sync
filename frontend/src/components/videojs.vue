<template>
        <video ref="videoPlayer" class="video-js vjs-theme-fr-solarized"></video>
</template>

<script>
import videojs from 'video.js';

export default {
    props: {
        options: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    data() {
        return {
            player: null
        }
    },
    mounted() {
        this.player = videojs(this.$refs.videoPlayer, this.options, function onPlayerReady() {
            //console.log('onPlayerReady', this);
        })
    },
    beforeUnmount() {
        if (this.player) {
            this.player.dispose()
        }
    }
}
</script>