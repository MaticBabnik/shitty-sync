<template>
    <div @click="share" class="theme-toggle">
        <svg viewBox="0 0 24 24" class="icon">
            <use xlink:href="/icons.svg#share"></use>
        </svg>
        <span class="notification" v-if="showNotification"> Link copied! </span>
    </div>
</template>

<script>
export default {
    $refs: {
        link: HTMLInputElement,
    },
    data() {
        return {
            showNotification: false,
        };
    },
    methods: {
        async share() {
            if (this.showNotification) return;
            this.showNotification = true;
            setTimeout(() => {
                this.showNotification = false;
            }, 2000);
            try {
                await navigator.clipboard.writeText(this.link);
            } catch {
                var textArea = document.createElement("textarea");
                textArea.value = this.link;

                textArea.style.top = "0";
                textArea.style.left = "0";
                textArea.style.position = "fixed";

                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                textArea.setSelectionRange(0, 1000);

                if (!document.execCommand("copy")) {
                    console.error("Couldn't copy text");
                }
                document.body.removeChild(textArea);
            }
        },
    },
    computed: {
        link() {
            return window.location.href;
        },
    },
};
</script>

<style lang="less" scoped>
@import url("@/assets/theme.less");

input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
}

svg {
    width: 24px;
    height: 24px;
    fill: @accent;
}
.theme-toggle {
    position: relative;
}

@keyframes anim {
    0% {
        opacity: 0%;
        top: -100%;
    }
    25% {
        opacity: 100%;
        top: 100%;
    }
    75% {
        opacity: 100%;
        top: 100%;
    }
    100% {
        opacity: 0%;
        top: 200%;
    }
}

.notification {
    left: -100px;
    top: 100%;
    color: @text;
    padding: 5px;
    border-radius: 3px;
    position: absolute;
    animation: anim 2s linear;
    opacity: 0;
    background-color: @primary;
    user-select: none;
}
</style>