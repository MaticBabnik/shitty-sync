<template>
    <div class="video-picker">
        <h1>Source:</h1>
        <div class="tabs-flex">
            <div
                :class="`tab ${videoType === type ? 'active' : ''}`"
                v-for="(type, index) in videoTypes"
                :key="index"
                @click="
                    () => {
                        videoType = type;
                    }
                "
            >
                {{ type }}
            </div>
        </div>
        <input type="text" name="" id="" ref="url" />
        <div class="small-btn" @click="verify">Set</div>
    </div>
</template>

<script>
export default {
    methods:{
        verifyCDN () {
            
        },
        verifyYT () {

        },
        async verify () {
            if (await this[`verify${videoType}`](this.$refs.url.value)) {

            } else {
                alert('video not work');                
            }
        }
    },
    created() {
        this.videoTypes = ["CDN", "YT"];
    },
    data() {
        return {
            videoType: "CDN",
        };
    },
};
</script>

<style lang="less">
@import url("@/assets/theme.less");

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
            user-select: none;
        }
        .tab.active {
            background-color: @orange;
            color: @base03;
            border-radius: 3px 3px 0 0;
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