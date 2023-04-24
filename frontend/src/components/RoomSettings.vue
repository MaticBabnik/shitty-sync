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
            <icon file="/icons.svg" name="youtube" />
            Youtube link
          </div>
          <div class="item" v-if="options.includes('cdn')" @click="doCdn">
            <icon file="/icons.svg" name="cdn" />CDN file
          </div>
          <div class="item" v-if="options.includes('youtube-search')" @click="doSearch">
            <icon file="/icons.svg" name="search" />Search for "{{ query }}"
          </div>
          <div class="item" v-if="isDev" @click="doDebugCDN">
            <icon file="/icons.svg" name="debug" />
            Test CDN file
          </div>
          <div class="item" v-if="isDev" @click="doDebugYT">
            <icon file="/icons.svg" name="debug" />
            Test YT
          </div>
        </div>
        <div class="loading" v-else-if="!loaded">
          <div class="progress-bar"></div>
        </div>
        <div class="cdn" v-else-if="selectedSource == 'cdn'">
          <span class="file-valid">{{ result.valid ? 'File is valid' : 'File is invalid' }}</span>
          <span class="file-info" v-if="result.valid">{{ result.type }}</span>
          <span class="file-info" v-if="result.valid">{{ result.size }}</span>
        </div>
        <div class="yt-search" v-else-if="selectedSource == 'youtube-search'">
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
      isDev: false
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
        case 'cdn':
          this.doCdn()
          break
        case 'youtube-link':
          this.doYoutube()
          break
        case 'youtube-search':
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
        src: this.selectedSource == 'youtube-search' ? this.selected : this.query
      }
      this.$emit('select', newSelected)

      this.show = false
    },
    change() {
      this.options = []

      if (this.query === '') return

      if (youtubeRegex.test(this.query)) this.options.push('youtube-link')
      if (urlRegex.test(this.query)) this.options.push('cdn')
      if (this.options.length === 0) {
        this.options.push('youtube-search')
      }
    },
    async doDebugCDN() {
      this.query = 'https://cdn.femboy.si/floppa.mp4'
      await this.doCdn()
    },
    async doDebugYT() {
      this.query = 'https://www.youtube.com/watch?v=ybHUgHVCtNs'
      await this.doYoutube()
    },
    async doSearch() {
      this.selectedSource = 'youtube-search'
      this.result = await this.ytSearch(this.query)
      this.loaded = true
    },
    async doCdn() {
      this.selectedSource = 'cdn'
      this.result = await this.cdnTest(this.query)
      this.loaded = true
      this.ready = this.result.valid
    },
    async doYoutube() {
      this.selectedSource = 'youtube-search'
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
    async cdnTest(src) {
      return await (
        await fetch('/cdn/test', {
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

  height: 72px;
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

.cdn {
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
