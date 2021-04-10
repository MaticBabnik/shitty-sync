<template>
    <div class="ctx-menu-body" ref="menu" :style="`left:${left}px; top:${top + offset}px;`">
        <div
            v-for="item in items"
            :key="item.name"
            :class="`child ${item.enabled ? 'enabled' : 'disabled'}`"
        >
            <icon file="/icons.svg" :name="item.icon" />
            {{ item.name }}
        </div>
    </div>
</template>

<script>
import Icon from "./Icon.vue";
export default {
    components: { Icon },
    props: {
        aitems: {
            type: Array,
            required: false,
        },
        left: {
            type: Number,
            required: false,
            default: 0,
        },
        top: {
            type: Number,
            required: false,
            default: 0,
        },
    },
    $refs: {
        menu: HTMLDivElement,
    },
    mounted() {
        // it finally works
        // lesgoooooo
        this.$nextTick(() => {
            this.offset = - this.$refs.menu.clientHeight;
            this.$forceUpdate();
        });
    },
    data() {
        return {
            items: [
                { name: "opt1", icon: "dark", enabled: "true" },
                { name: "opt2", icon: "light", enabled: "true" },
            ],
            offset: 0,
        };
    },
};
</script>

<style lang="less">
@import url("@/assets/theme.less");
.ctx-menu-body {
    display: flex;
    flex-direction: column;

    background-color: @background;
    border: 2px solid @background-light;
    border-radius: 5px;
}
</style>