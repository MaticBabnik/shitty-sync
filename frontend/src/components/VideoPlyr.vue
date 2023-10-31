<script setup>
/*
TODO: custom theme 
TODO: keep all sync related state in a store so player can access it
        vue's reactivity should be good enough to handle syncing the player
TODO: steal jellyfin's idea and modify playback speed to make up for small desyncs
*/

import 'plyr/dist/plyr.css'

import Plyr from 'plyr'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { MediaPlayer } from 'dashjs/dist/dash.mediaplayer.min.js'

/** @type {Plyr} */
let player
/** @type {dashjs.MediaPlayerClass} */
let dashInstance
/** @type {Plyr.Options} */
const CONFIG = {
    captions: { active: true, update: true },
    settings: ['captions', 'quality', 'loop']
}
/** @type {Plyr.Options} */
const ADMIN_CONFIG = {
    controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'duration',
        'mute',
        'volume',
        'captions',
        'settings',
        'pip',
        'fullscreen'
    ],
    keyboard: {
        focused: true,
        global: true
    }
}

/** @type {Plyr.Options} */
const USER_CONFIG = {
    controls: [
        'current-time',
        'duration',
        'mute',
        'volume',
        'captions',
        'settings',
        'pip',
        'fullscreen'
    ],
    keyboard: {
        focused: false,
        global: false
    }
}

let isYtReady = false
let admin = false

const root = ref(null),
    videoEl = ref(null)

const playerType = ref('none')
let src = ''

const emit = defineEmits(['vplay', 'vpause', 'vseek'])

function createPlayer(element) {
    if (player) {
        console.warn('Player was not cleaned up!')
    }

    const newConf = { ...CONFIG, ...(admin ? ADMIN_CONFIG : USER_CONFIG) }
    const p = new Plyr(element, newConf)

    p.elements.container.addEventListener(
        'click',
        (e) =>
            !admin &&
            e.target.tagName !== 'INPUT' &&
            e.target.tagName !== 'BUTTON' &&
            e.stopPropagation(), // this prevents pausing by clicking on the player
        true
    )

    p.speed = 1
    p.on('play', () => {
        emit('vplay', p.currentTime)
    })
    p.on('pause', () => {
        emit('vpause', p.currentTime)
    })
    p.on('seeked', () => {
        emit('vseek', p.currentTime, p.playing)
    })
    p.on('volumechange', () => {
        storeVolume(p.volume)
    })
    p.volume = getVolume()

    p.on('ready', (e) => {
        console.log('ready', e)
        isYtReady = true
    })

    return p
}

function genericTeardown() {
    if (player) {
        for (let e in player.elements) {
            if (player.elements[e] instanceof HTMLElement) player.elements[e].remove()
        }
    }
    player?.destroy()
    player = null

    videoEl.value?.remove()
    videoEl.value = null
}

function applyAdmin() {
    // Like with VideoJS we need to recreate the player to apply
    // new settings (blocking/unblocking certain controls) :(

    console.log('applying admin to ', playerType.value)

    PLAYERS[playerType.value].teardown()
    PLAYERS[playerType.value].create(src)
}

const PLAYERS = {
    none: {
        create() {},
        change() {},
        teardown() {}
    },
    video: {
        create(src) {
            videoEl.value = document.createElement('video')
            videoEl.value.src = src
            root.value.appendChild(videoEl.value)

            player = createPlayer(videoEl.value)
        },
        change(src) {
            player.source = { type: 'video', sources: [{ src }] }
        },
        teardown() {
            genericTeardown()
        }
    },
    youtube: {
        create(src) {
            videoEl.value = document.createElement('div')
            videoEl.value.dataset.plyrProvider = 'youtube'
            videoEl.value.dataset.plyrEmbedId = src

            console.log(videoEl.value)

            root.value.appendChild(videoEl.value)

            player = createPlayer(videoEl.value)
        },
        change(src) {
            player.source = { type: 'video', sources: [{ src, provider: 'youtube' }] }
        },
        teardown() {
            genericTeardown()
        }
    },
    dash: {
        create(src) {
            videoEl.value = document.createElement('video')
            dashInstance = MediaPlayer().create()
            dashInstance.initialize(videoEl.value, src, false)
            root.value.appendChild(videoEl.value)

            player = createPlayer(videoEl.value)
        },
        change(src) {
            // dash.js's player thingy doesn't want to cooperate with plyr
            // when changing sources, so we have to recreate it
            this.teardown()
            this.create(src)
        },
        teardown() {
            genericTeardown()

            dashInstance?.destroy()
            dashInstance = null
        }
    }
}

function storeVolume(v) {
    localStorage.setItem('playerVolume', v)
    return v
}

function getVolume() {
    let v = localStorage.getItem('playerVolume') ?? storeVolume(0.5)
    return parseFloat(v)
}

onMounted(() => PLAYERS[playerType.value].create(src))
onBeforeUnmount(() => PLAYERS[playerType.value].teardown())

function change({ src: newSrc, type }) {
    src = newSrc

    if (type == playerType.value) {
        // don't recreate the player if we don't have to
        PLAYERS[type].change(newSrc)
        return
    }

    PLAYERS[playerType.value].teardown()
    PLAYERS[type].create(src)

    playerType.value = type
}

function seek(v) {
    if (!player) return
    console.log('seek', v)
    player.currentTime = v
}

async function stupidYoutubePlayerReadyHack() {
    if (playerType.value !== 'youtube') return 0

    if (isYtReady) return 0

    const start = Date.now()
    await new Promise((resolve) => player.once('ready', resolve))
    isYtReady = true

    return (Date.now() - start) / 1000
}

async function play(v, t) {
    if (!player) return
    console.log('play', v)

    if (v) {
        t += await stupidYoutubePlayerReadyHack()
        try {
            await player.play()
            player.currentTime = t
        } catch (e) {
            console.error('Failed to play', e)
        }
    } else player.pause()
}

function setAdmin(v) {
    if (v == admin) return
    admin = v
    applyAdmin()
}

defineExpose({ change, seek, play, setAdmin })
</script>

<template>
    <div class="video-container" ref="root">
        <div class="no-media" v-if="playerType == 'none'">
            <img src="@/assets/warn.svg" />
            <h2>No source</h2>
        </div>
        <!-- Video gets created here -->
    </div>
</template>

<style lang="less">
@import url('@/assets/theme.less');

.video-container {
    position: relative;

    min-width: 300px;
    width: fit-content;
    height: fit-content;
    min-height: 150px;

    .no-media {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }

    .plyr {
        width: 100%;
        height: 100%;
    }

    .no-media {
        user-select: none;
        padding: 1rem;
        background-color: @background-dark;
        font-size: 1.5rem;
        padding-left: 3rem;
        z-index: 5;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        h2 {
            margin: 0;
        }
    }
}
</style>
