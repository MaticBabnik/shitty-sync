<template>
    <div class="user-card">
        <span v-if="!editing" class="nickname">
            {{ nickname }}
            <div class="small-btn" v-if="isLocalUser" @click="editing = true">
                Edit
            </div>
        </span>
        <input
            type="text"
            v-else
            @keydown.enter="changeNick"
            @keydown.esc="editing = false"
        />
        <span class="id">
            {{ id }}
        </span>
        <span :class="`role ${role == 'admin' ? 'admin' : ''}`">
            {{ role }}
            <div
                class="small-btn"
                v-if="isLocalUserAdmin && role != 'admin'"
                @click="$emit('promote', id)"
            >
                Promote
            </div>
        </span>
    </div>
</template>

<script>
export default {
    props: {
        nickname: { type: String, required: true },
        id: { type: String, required: true },
        role: { type: String, required: true },
        isLocalUserAdmin: { type: Boolean, required: true },
        isLocalUser: { type: Boolean, required: true },
    },
    emits: ["promote", "changeNick"],
    data() {
        return {
            editing: false,
        };
    },
    methods: {
        changeNick(e) {
            this.editing = false;
            this.$emit("changeNick", e.target.value);
        },
    },
};
</script>

<style lang="less">
@import url("@/assets/colors.less");
.user-card {
    display: flex;
    flex-direction: column;
    padding: 4px;
    border: 1px solid @base01;
    border-radius: 4px;
    font-size: 12px;
    .nickname {
        font-weight: 600;
        color: @green;
        height: fit-content;
        margin: 2px;
        width: fit-content;
    }
    .id {
        margin: 2px;
        width: fit-content;
        background-color: @base02;
        border-radius: 2px;
        font-family: monospace;
        color: @base00;
        border: 1px solid @base01;
        font-size: 9px;
    }
    .role {
        height: fit-content;
        width: fit-content;
        margin: 2px;
        font-weight: 600;
        color: @blue;
    }
    .role.admin {
        color: @yellow;
    }
}
.small-btn {
    font-size: 10px;
    border: 1px solid @red;
    color: @orange;
    border-radius: 2px;
    display: inline;
    padding: 2px;
    user-select: none;
    cursor: pointer;
}
.small-btn:hover {
    background-color: @orange;
    color: @base03;
}
</style>