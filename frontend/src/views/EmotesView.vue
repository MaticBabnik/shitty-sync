<template>
    <div>
        <h1>Emotes</h1>
        <div class="emotes">
            <div class="emote" v-for="emote in emotes" :key="emote[0]">
                <img :src="emote[1]" :alt="emote[0]" :title="emote[0]" />
                <p>{{ emote[0] }}</p>
            </div>
        </div>
    </div>
</template>

<script>
import emotes from '../assets/emotes.json'

export default {
    data() {
        return {
            emotes
        }
    },
}
</script>

<style lang="less">
@import url('@/assets/theme.less');
.emotes {
    display: grid;
    gap: 4px;
    grid-template-columns: repeat(auto-fill, 7em);
    grid-template-rows: masonry;
}

.emote {
    .transition;
    display: flex;
    flex-direction: column;
    align-items: center;
    p {
        font-size: 0.7rem;
    }
    img {
        width: 3em;
        height: 3em;
    }
    &:hover {
        background-color: #fff2;
    }
}
</style>
