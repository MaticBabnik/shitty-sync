<template>
    <div>
        <button class="no-btn">
            <s-icon class="icon" file="/icons.svg" name="edit" @click="resetAndShow" />
        </button>
        <teleport to=".main">
            <popup-dialog
                title="Select media"
                class="flex-diag"
                @close="() => (show = false)"
                v-if="show"
            >
                <input
                    type="text"
                    class="input"
                    v-model="query"
                    placeholder="Paste a link or search"
                    v-if="selectedSource == null"
                    @keypress.enter="inputEnter"
                />
                <div class="results" v-if="!selectedSource">
                    <div class="item" v-if="options.includes('youtube-link')" @click="doYoutube">
                        <s-icon file="/icons.svg" name="youtube" />
                        Youtube link
                    </div>
                    <div class="item" v-if="options.includes('url')" @click="doUrl">
                        <s-icon file="/icons.svg" name="url" />Video stream URL
                    </div>
                    <div class="item" v-if="options.includes('youtube')" @click="doSearch">
                        <s-icon file="/icons.svg" name="search" />Search for "{{ query }}"
                    </div>
                    <template v-if="isDev">
                        <div
                            class="item"
                            v-for="(source, index) in devSources"
                            @click="doDebug(source.kind, source.query)"
                            :key="index"
                        >
                            <s-icon file="/icons.svg" name="debug" />
                            {{ source.label }}
                        </div>
                    </template>
                </div>
                <div class="loading" v-else-if="!loaded">
                    <div class="progress-bar"></div>
                </div>
                <div class="url" v-else-if="selectedSource == 'url'">
                    <span class="file-valid">{{
                        result.valid ? 'File is valid' : 'File is invalid'
                    }}</span>
                    <span class="file-info" v-if="result.valid">Type: {{ result?.type }}</span>
                    <span class="file-info" v-if="result.valid">Size: {{ result?.size }}</span>
                </div>
                <div class="yt-search" v-else-if="selectedSource == 'youtube'">
                    <video-card
                        v-for="(video, index) in result"
                        :class="{ selected: video.url == selected }"
                        :key="index"
                        :title="video.title"
                        :author="video.author"
                        :url="video.url"
                        :thumbnail="video.thumbnailUrl"
                        @click="
                            () => {
                                selected = video.url
                            }
                        "
                        class="card-selectable"
                    />
                </div>
                <div
                    :class="{ button: true, disabled: !ready && !selected }"
                    @click="
                        (e) => {
                            if (ready || selected) selectMedia()
                        }
                    "
                >
                    CHANGE
                </div>
            </popup-dialog>
        </teleport>
    </div>
</template>

<script>
import SIcon from '../components/SIcon.vue'
import PopupDialog from './PopupDialog.vue'
import VideoCard from './VideoCard.vue'

const youtubeRegex =
    /^(?:https?:\/\/)?(?:www\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[^&\s?]+(?!\S))\/)|(?:\S*v=|v\/)))([^&\s?]+)$/i
const urlRegex =
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www\.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w\-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[.!/\\\w]*))?)/

export default {
    components: {
        SIcon,
        PopupDialog,
        VideoCard
    },
    data() {
        return {
            show: false,
            ready: false,
            options: [],
            selectedSource: null,
            loaded: false,
            selected: null,
            query: '',
            result: null,
            isDev: false,
            devSources: [
                { kind: 'Url', label: 'Static MP4', query: 'https://cdn.femboy.si/floppa.mp4' },
                {
                    kind: 'Url',
                    label: 'Dash h264 + TTML (American Psycho)',
                    query: 'https://s3.eu-central-1.wasabisys.com/cdn.femboy.si/serial_experiments_weebify/american_psycho/manifest.mpd'
                },
                {
                    kind: 'Url',
                    label: 'Dash AV1 (Spiderman)',
                    query: 'https://s3.eu-central-1.wasabisys.com/cdn.femboy.si/serial_experiments_weebify/spiderman/spiderman.mpd'
                },
                {
                    kind: 'Url',
                    label: 'Dash AV1 + VTT (Drive)',
                    query: 'https://s3.eu-central-1.wasabisys.com/cdn.femboy.si/serial_experiments_weebify/drive/drive.mpd'
                },
                {
                    kind: 'Youtube',
                    label: 'Test Youtube',
                    query: 'https://www.youtube.com/watch?v=i6UNajF-EAM'
                },
                { kind: 'Search', label: 'Test search', query: 'matter satelit' }
            ]
        }
    },
    watch: {
        query() {
            this.change()
        }
    },
    methods: {
        inputEnter() {
            switch (this.options?.[0]) {
                case 'url':
                    this.doUrl()
                    break
                case 'youtube-link':
                    this.doYoutube()
                    break
                case 'youtube':
                    this.doSearch()
                    break
            }
        },
        resetAndShow() {
            this.ready = false
            this.options = []
            this.selectedSource = null
            this.loaded = false
            this.selected = null
            this.query = ''
            this.result = null

            this.show = true
            this.isDev = localStorage.getItem('dev') == 'true'
        },
        selectMedia() {
            const newSelected = {
                type: this.selectedSource,
                src: this.selectedSource == 'youtube' ? this.selected : this.query
            }
            this.$emit('select', newSelected)

            this.show = false
        },
        change() {
            this.options = []

            if (this.query === '') return

            if (youtubeRegex.test(this.query)) this.options.push('youtube-link')
            if (urlRegex.test(this.query)) this.options.push('url')
            if (this.options.length === 0) {
                this.options.push('youtube')
            }
        },
        async doDebug(kind, query) {
            this.query = query
            await this[`do${kind}`]?.()
        },
        async doSearch() {
            this.selectedSource = 'youtube'
            this.result = await this.ytSearch(this.query)
            this.loaded = true
        },
        async doUrl() {
            this.selectedSource = 'url'
            this.result = await this.urlTest(this.query)
            this.loaded = true
            this.ready = this.result.valid
        },
        async doYoutube() {
            this.selectedSource = 'youtube'
            this.result = [await this.ytTest(this.query)]

            this.selected = this.result[0].url

            this.loaded = true
            this.ready = true
        },
        async ytTest(url) {
            return await (
                await fetch('/youtube/test', {
                    method: 'POST',
                    body: new URLSearchParams({
                        url
                    })
                })
            ).json()
        },
        async ytSearch(query) {
            return await (
                await fetch('/youtube/search', {
                    method: 'POST',
                    body: new URLSearchParams({
                        query
                    })
                })
            ).json()
        },
        async urlTest(src) {
            return await (
                await fetch('/url/test', {
                    method: 'POST',
                    body: new URLSearchParams({
                        src
                    })
                })
            ).json()
        }
    }
}
</script>

<style lang="less" scoped>
@import url('../assets/theme.less');

.icon {
    cursor: pointer;
}

input.input[type='text'] {
    margin-right: none;
    font-size: 0.7rem;
    line-height: 1.5rem;
    color: @text;
}

.video-card.selected {
    background-color: @background-light;
    overflow: hidden;
    box-shadow: 0px 0px 5px @primary;
    border-radius: 3px;
}

.card-selectable {
    cursor: pointer;
}

.results {
    margin: 10px 0;

    display: flex;
    flex-direction: column;

    height: 144px;
    border: 1px solid @background-light;
    border-radius: 4px;
    overflow-x: scroll;
    overflow-y: none;

    .item {
        .transition;
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

.loading {
    .progress-bar {
        width: 100%;
        height: 4px;
        background-color: #222;
        background: linear-gradient(90deg, #0000 40%, @primary 50%, #0000 60%);
        background-size: 220%;
        animation: Loading 1s cubic-bezier(0.3, 0, 0.7, 1) infinite;
        border-radius: 2px;
    }
}

.url {
    padding: 10px;

    .file-valid {
        color: @accent;
        font-size: 1rem;
        display: block;
    }

    .file-info {
        color: @text;
        font-size: 0.7rem;
        display: block;
    }
}
</style>
