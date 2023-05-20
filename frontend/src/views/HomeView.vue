<template>
    <div class="home">
        <div class="tl desktop-only">
            <span class="stats">
                Built on: {{ date }}<br />
                Commit: {{ commit }}<br />
                Branch: {{ branch }}<br />
                <a href="https://github.com/maticbabnik/shitty-sync.git">Repo</a>
            </span>
        </div>
        <div class="tr">
            <theme-toggle class="theme-toggle" />
        </div>

        <div class="middle">
            <img class="logo" src="@/assets/logo.svg" alt="Sync" />
            <div class="text-btn">
                <input
                    class="text"
                    type="text"
                    spellcheck="false"
                    placeholder="Room code"
                    @keypress.enter="gotoRoom"
                    ref="roomCode"
                    size="16"
                    maxlength="16"
                />
                <button class="btn" @click="gotoRoom">Join</button>
            </div>
        </div>

        <ghost-news
            class="home-news"
            :base-url="news.baseUrl"
            :api-key="news.apiKey"
            :tag="news.tag"
            limit="5"
        />
    </div>
</template>

<script>
import GhostNews from '@/components/GhostNews.vue'
import ThemeToggle from '../components/ThemeToggle.vue'

export default {
    components: {
        ThemeToggle,
        GhostNews
    },
    data() {
        return {
            branch: import.meta.env['VITE_BRANCH'] ?? 'unknown',
            commit: (import.meta.env['VITE_COMMIT'] ?? 'unknown').substring(0, 7),
            date: import.meta.env['VITE_DATE'],
            news: {
                baseUrl: import.meta.env['VITE_NEWS_BASE_URL'],
                apiKey: import.meta.env['VITE_NEWS_API_KEY'],
                tag: import.meta.env['VITE_NEWS_TAG']
            }
        }
    },
    methods: {
        gotoRoom() {
            const code = this.$refs.roomCode.value
            if (code.length >= 1) this.$router.push({ name: 'Room', params: { id: code } })
            else alert('Invalid code')
        }
    }
}
</script>

<style lang="less" scoped>
@import url('@/assets/theme.less');

button {
    border: none;
    outline: none;
}

@media screen and (max-width: 900px) {
    .home {
        grid-template-columns: 1rem 1fr 1rem !important;
    }
    .desktop-only {
        display: none !important;
    }
}

.home {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-template-rows: 1fr auto 1fr;
    grid-template-areas: 'fl fl fr' 'ml main mr' 'bl news br';

    max-height: 100svh;
    overflow: hidden;
    max-width: 100%;
}

.tl {
    grid-area: fl;

    user-select: text;
    padding: 10px;

    color: @text;

    opacity: 0.8;

    a {
        color: @accent;
    }
}
.tr {
    grid-area: fr;
    display: flex;
    justify-content: flex-end;
    align-items: flex-start;

    .theme-toggle {
        padding: 0.5rem;
    }
}

.middle {
    grid-area: main;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    user-select: none;
    background-color: @background;
    gap: 1rem;
    width: 100%;

    .logo {
        width: 100%;
        max-width: 352px;
    }
}
.home-news {
    grid-area: news;
}

.text-btn {
    height: 48px;
    width: 100%;
    max-width: 50rem;
    border-radius: 24px;
    display: flex;
    align-items: stretch;
    overflow: hidden;
    border: 2px solid @background-light;
    max-width: 28rem;

    .text {
        flex: 1;
        min-width: 0 !important;
        width: 100%;
        background-color: @background;
        color: @text;
        font-size: 36px;
        border: 0px !important;
        padding: 0;
        margin-left: 12px;
    }
    .btn {
        transition: 0.3s ease;
        color: @primary;
        cursor: pointer;
        margin: 0;
        font-weight: bold;
        font-size: 18px;
        padding: 0 10px;
        line-height: 48px;
        user-select: none;
        background-color: @background-light;
    }
    .btn:hover {
        color: @background;
        background-color: @primary;
    }
}
</style>
