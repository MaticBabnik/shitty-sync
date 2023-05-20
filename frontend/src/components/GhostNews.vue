<script setup>
import { ref } from 'vue'

const props = defineProps(['baseUrl', 'apiKey', 'tag', 'limit'])

const news = ref('')
const loading = ref(true)
const error = ref(false)

//fetch new from ghost api
async function fetchNews(baseUrl, key, tag, limit = 5) {
    const url = new URL(baseUrl)
    url.pathname = '/ghost/api/content/posts'
    url.searchParams.set('key', key)
    url.searchParams.set('filter', `tag:${tag}`)
    url.searchParams.set('limit', limit)

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })

    const data = await response.json()

    news.value = data
}

fetchNews(props.baseUrl, props.apiKey, props.tag, props.limit)
    .then(() => {
        error.value = false
        loading.value = false
    })
    .catch((err) => {
        error.value = true
        loading.value = false
    })

//convert date to time ago
function timeAgo(t) {
    const seconds = Math.floor((new Date() - new Date(t)) / 1000)

    let interval = seconds / 31536000

    if (interval > 1) {
        return Math.floor(interval) + ' years'
    }
    interval = seconds / 2592000
    if (interval > 1) {
        return Math.floor(interval) + ' months'
    }
    interval = seconds / 86400
    if (interval > 1) {
        return Math.floor(interval) + ' days'
    }
    interval = seconds / 3600
    if (interval > 1) {
        return Math.floor(interval) + ' hours'
    }
    interval = seconds / 60
    if (interval > 1) {
        return Math.floor(interval) + ' minutes'
    }
    return Math.floor(seconds) + ' seconds'
}
</script>

<template>
    <div class="news">
        <template v-if="loading">
            <div class="loading">Loading...</div>
        </template>
        <template v-else-if="error">
            <div class="error">Error loading news</div>
        </template>
        <div class="articles-wrapper" v-else>
            <a
                class="news-item"
                v-for="item in news.posts"
                :key="item.id"
                :href="item.url"
                target="_blank"
                rel="noopener noreferrer"
            >
                <div class="img">
                    <img :src="item.feature_image" :alt="item.feature_image_alt" />
                    <span class="time">{{ timeAgo(item.published_at) }}</span>
                </div>
                <span class="title">{{ item.title }} </span>
                <p class="description">{{ item.excerpt }}</p>
            </a>
        </div>
    </div>
</template>

<style lang="less" scoped>
@import url('@/assets/theme.less');

.news {
    margin: 1rem 0;

    overflow: scroll;
    position: relative;

    // add an after element that creates a gradient at the bottom

    &:after {
        content: '';
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 5rem;
        background: linear-gradient(0deg, @background 50%, #0000 100%);
    }

    .articles-wrapper {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        align-items: center;

        padding-bottom: 4rem;
        .news-item {
            display: flex;
            flex-direction: column;
            text-decoration: none;
            width: 21rem;
            padding: 0.5rem;
            border-radius: 0.5rem;
            gap: 0.2rem;

            &:hover {
                background-color: @background-light;
            }

            .title {
                font-weight: bold;
                color: @primary;
            }

            .description {
                margin: 0;
            }
            .img {
                position: relative;
                width: 100%;
                aspect-ratio: 20/9;
                overflow: hidden;
                box-sizing: border-box;
                border-radius: 0.3rem;
                border: 1px solid @background-dark;

                img {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;

                    image-rendering: optimizeQuality;
                }
                .time {
                    position: absolute;
                    right: 0.5rem;
                    bottom: 0.5rem;

                    float: right;
                    color: @accent;
                    background-color: @background;
                    border: 1px solid @accent;
                    border-radius: 1000px;
                    padding: 0.2rem 0.4rem;
                    box-shadow: @background 0 0 4px 0px;
                }
            }
        }
    }
}
</style>
