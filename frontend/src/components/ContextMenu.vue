<template>
    <div class="ctx-menu-body" ref="menu" :style="`left:${left}px; top:${top + offset}px;`">
        <div
            v-for="item in items"
            :key="item.name"
            :class="`child ${item.enabled ? '' : 'disabled'}`"
            @click="(a)=>emitIfEnabled(a,item)"
        >
            <icon file="/icons.svg" :name="item.icon" />
            {{ item.text }}
        </div>
    </div>
</template>

<script>
import Icon from "./Icon.vue";
export default {
    components: { Icon },
    props: {
        items: {
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
    methods: {
        emitIfEnabled (e,item) {
            if (item.enabled) {
                this.$emit('action',item.name);
            }
        }
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

    .child {
        display: flex;
        user-select: none;
        padding: 2px;
        margin: 0;
        line-height: 24px;

        color: @text;

        svg {
            fill: @accent;
        }

    }
    .child:hover {
        background-color: @primary;
        color:@background;
        svg{
            fill: @background;
        }
    }
    .disabled {
        color: @background-light;

        svg {
            fill: @background-light;
        }
    }
    .disabled:hover {
        background-color: @background-light;
        color:@background;
        svg{
            fill: @background;
        }
    }
}
</style>