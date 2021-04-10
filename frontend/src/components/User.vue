<template>
    <div class="user" @mouseup="openMenu">
        <img :src="admin ? '/admin.jpg' : '/user.jpg'" />
        <span :class="local ? 'local' : ''">{{ name }}</span>
        <teleport to="#app">
            <context-menu
                v-if="menuShow"
                ref="ctxMenu"
                class="ctx-menu"
                :left="menuLeft" :top="menuTop"
            ></context-menu>
        </teleport>
    </div>
</template>

<script>
import ContextMenu from "./ContextMenu.vue";
export default {
    components: {
        ContextMenu,
    },
    $refs: {
        ctxMenu: HTMLDivElement,
    },
    data() {
        return {
            menuShow: false,
            menuLeft: 0,
            menuTop: 0,
        };
    },
    methods: {
        openMenu(e) {
            if (this.menuShow) return;
            this.menuShow = true;
            this.$nextTick(() => {
                this.menuLeft = e.clientX;
                this.menuTop = e.clientY;
                document.addEventListener("mousedown", this.closeMenu);
            });
        },
        closeMenu(e) {
            document.removeEventListener("mousedown", this.closeMenu);
            this.menuShow = false;
        },
    },
    props: {
        name: { type: String, required: true },
        admin: { type: Boolean, required: true },
        local: { type: Boolean, required: true },
    },
};
</script>

<style lang="less">
@import url("@/assets/theme.less");

.user {
    user-select: none;

    display: flex;
    flex-direction: column;

    position: relative;

    align-items: center;
    align-content: center;
    justify-items: center;
    justify-content: center;
    border-radius: 10px;

    img {
        width: 64px;
        height: 64px;
        border-radius: 50%;
    }
    span {
        width: 96px;
        font-size: 12px;
        text-align: center;
    }
}

.user:hover {
    transition: 100ms ease;
    background-color: @background-light;
}

.local {
    color: @accent;
}

.ctx-menu {
    position: absolute;
    z-index: 5;
    width: fit-content;
    height: fit-content;
    left: 50%;
    right: 50%;
}
</style>