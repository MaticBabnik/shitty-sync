<template>
    <div class="overlay">
        <div class="dialog">
            <div class="titlebar">
                <span>{{ title }}</span>
                <icon
                    @click="close"
                    file="icons.svg"
                    name="close"
                    class="close-btn"
                />
            </div>
            <slot></slot>
        </div>
    </div>
</template>

<script>
import Icon from "./Icon.vue";
export default {
    components: { Icon },
    props: {
        title: { type: String, default: () => "Popup" },
    },
    methods: {
        close() {
            this.$emit("close");
        },
    },
};
</script>

<style lang="less">
@import url("@/assets/theme.less");

.overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    backdrop-filter: grayscale(50%) blur(4px);

    display: flex;
    align-items: center;
    justify-content: center;

    .dialog {
        background-color: @background;
        border: 2px @background-light solid;

        border-radius: 5px;
        padding: 3px;

        min-width: 400px;
        min-height: 200px;

        .titlebar {
            user-select: none;
            display: flex;
            flex-direction: row;
            width: 100%;
            span {
                flex: 1;
            }
            .close-btn {
                fill: @text;
            }
        }
    }
}
</style>