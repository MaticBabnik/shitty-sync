<template>
    <div class="dev">
        <span>Stats [ /dev to toggle ]</span>
        <br />
        <span>Info </span>
        <span>---------------------------------------</span>
        <span>T: {{ debug.t }}</span>
        <span>Last ping: {{ latency?.last ?? "error"}}</span>
        <span>Time offset: {{timeOffset ?? "error"}} </span>
        <span>Time error: {{ debug.timeError ?? "error"}}</span>

        <br />
        <template v-if="admin">
            <span>Sync host stats </span>
            <span>---------------------------------------</span>
            <span>Last sync: {{ debug.lastSyncSent ?? "error"}}</span>
            <span>Last event: {{ debug.lastEvent ?? "error"}}</span>
        </template>
        <template v-else>
            <span>Sync client stats </span>
            <span>---------------------------------------</span>
            <span>Last sync: {{ debug.lastSyncRecv ?? "error"}}</span>
            <span>Last type: {{ debug.lastRecvType ?? "error"}}</span>
        </template>
        <br />
        <span>Build info </span>
        <span>---------------------------------------</span>
        <span>Built from: fubuki-fanclub/shitty-sync</span>
        <span>Branch: {{ branch ?? "error"}}</span>
        <span>Commit: {{ commit ?? "error"}}</span>
    </div>
</template>

<script>
export default {
    data() {
        return {
            branch: process.env["VUE_APP_BRANCH"] ?? "unknown",
            commit: (process.env["VUE_APP_COMMIT"] ?? "unknown").substr(0, 7),
        };
    },
    props: [
        "debug","admin","latency","timeOffset"
    ]
};
</script>

<style lang="less">
@import url("@/assets/theme.less");

.dev {
    background-color: #000;
    border: 2px solid @primary;
    * {
        color: #aaa;
        font-family: monospace;
    }
    flex: 0.5;
    flex-direction: column;
    overflow-y: scroll;
    display: flex;
}
</style>
