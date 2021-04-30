<template>
    <div>
        <icon
            class="icon"
            file="/icons.svg"
            name="edit"
            @click="() => (show = true)"
        />
        <teleport to="body">
            <popup-dialog
                title="Select media"
                @close="() => (show = false)"
                v-if="show"
            >
                <input
                    type="text"
                    class="input"
                    v-model="query"
                    placeholder="Paste a link or search"
                />
                <div class="results" v-if="!selectedSource">
                    <div
                        class="item"
                        v-if="options.includes('youtube-link')"
                        @click="
                            () => {
                                selectedSource = 'youtube-link';
                            }
                        "
                    >
                        <icon file="/icons.svg" name="youtube" />
                        Youtube link
                    </div>
                    <div
                        class="item"
                        v-if="options.includes('cdn')"
                        @click="
                            () => {
                                selectedSource = 'cdn';
                            }
                        "
                    >
                        <icon file="/icons.svg" name="cdn" />CDN file
                    </div>
                    <div
                        class="item"
                        v-if="options.includes('youtube-search')"
                        @click="
                            () => {
                                selectedSource = 'youtube-search';
                            }
                        "
                    >
                        <icon file="/icons.svg" name="search" />Search for "{{
                            query
                        }}"
                    </div>
                </div>
                <div class="cdn" v-else-if="selectedSource == 'cdn'">
                    Show file info
                </div>
                <div
                    class="yt-search"
                    v-else-if="selectedSource == 'youtube-search'"
                >
                    Show results
                </div>
                <div
                    class="yt-link"
                    v-else-if="selectedSource == 'youtube-link'"
                >
                    show video info
                </div>
                <div v-if="ready" class="button" @click="selectMedia">
                    CHANGE
                </div>
            </popup-dialog>
        </teleport>
    </div>
</template>

<script>
import Icon from "../components/Icon";
import PopupDialog from "./PopupDialog.vue";

const youtubeRegex = /^(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[^&\s\?]+(?!\S))\/)|(?:\S*v=|v\/)))([^&\s\?]+)$/i;
const urlRegex = /^((https?|ftp|smtp):\/\/)?(www.)?[a-z0-9]+(\.[a-z]{2,}){1,3}(#?\/?[a-zA-Z0-9#]+)*\/?(\?[a-zA-Z0-9-_]+=[a-zA-Z0-9-%]+&?)?$/;

export default {
    components: {
        Icon,
        PopupDialog,
    },
    data() {
        return {
            show: false,
            ready: false,
            options: [],
            selectedSource: null,
            selected: null,
            query: "",
        };
    },
    watch: {
        query(val, oldVal) {
            this.change();
        },
    },
    methods: {
        selectMedia() {
            console.log("SELECT");
            this.show = false;
        },
        change() {
            this.options = [];
            if (youtubeRegex.test(this.query))
                this.options.push("youtube-link");
            if (urlRegex.test(this.query)) this.options.push("cdn");
            if (this.options.length === 0) {
                this.options.push("youtube-search");
            }
        },
        async ytSearch(query) {
            return await (
                await fetch("/youtube/search", {
                    method: "GET",
                    body: new URLSearchParams({
                        query,
                    }),
                })
            ).json();
        },
        async cdnTest(src) {
            return await (
                await fetch("/cdn/test", {
                    method: "GET",
                    body: new URLSearchParams({
                        src
                    }),
                })
            ).json();
        },
    },
};
</script>

<style lang="less" scoped>
@import url("../assets/theme.less");

input.input[type="text"] {
    margin-right: none;
    font-size: 0.7rem;
    line-height: 1.5rem;
}

.results {
    margin-top: 10px;

    display: flex;
    flex-direction: column;

    height: 20vh;
    border: 1px solid @background-light;
    border-radius: 4px;
    overflow-x: scroll;
    overflow-y: none;

    .item {
        display: flex;
        user-select: none;
        padding: 2px;
        margin: 0;
        line-height: 24px;

        color: @text;

        svg {
            fill: @accent;
        }

        &:hover {
            background-color: @primary;
            color: @background;
            svg {
                fill: @background;
            }
        }
    }
}
</style>