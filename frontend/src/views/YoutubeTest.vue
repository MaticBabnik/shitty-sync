<template>
    <div>
        <h1>Youtube source switch test</h1>
        <videojs id="test" ref="vjs" :source="source"></videojs>

        <div id="btns">
            <div class="button" @click="()=>src(0)">Source 1</div>
            <div class="button" @click="()=>src(1)">Source 2</div>
            <div class="button" @click="()=>src(2)">Source 3</div>
        </div>
    </div>
</template>

<script>
import videojs from "../components/VideoJS.vue";
import vjs from "video.js";

export default {
    components: { videojs },
    data() {
        return {
            source: {},
        };
    },
    methods: {
        src(n) {
            this.$refs.vjs.change([
                { src: "http://cdn.femboy.si/floppa.mp4", type: "video/mp4" },
                {
                    src: "https://www.youtube.com/watch?v=TZ1V33GqeLM",
                    type: "video/youtube",
                },
                {
                    src: "https://www.youtube.com/watch?v=jPFNKhWlHqU",
                    type: "video/youtube",
                },
            ][n]);
        },
    },
};
</script>

<style>
#btns {
    display:flex;
    flex-direction: row;
}
#btns>div {
    margin: 5px;
}
</style>