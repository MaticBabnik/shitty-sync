<template>
    <div @click="toggleTheme" class="theme-toggle">
        <svg viewBox="0 0 24 24" class="icon">
            <use :xlink:href="`/icons.svg#${dark?'dark':'light'}`"></use>
        </svg>
    </div>
</template>

<script>
export default {
    data() {
        return {
            dark: true,
        };
    },
    methods: {
        toggleTheme() {
            this.dark = !this.dark;
            const theme = this.dark ? "dark" : "light";
            localStorage.setItem("theme", theme);
            document.querySelector("html").dataset["theme"] = theme;
        },
    },
    mounted() {
        const theme = document.querySelector("html").dataset["theme"];
        this.dark = !theme || theme == "dark";
    },
};
</script>

<style lang="less" scoped>
@import url("@/assets/theme.less");
svg {
    width: 24px;
    height: 24px;
    fill: @accent;
}
</style>