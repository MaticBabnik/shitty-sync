<script setup lang="ts">
import { ref } from 'vue';

const peopleExpanded = ref(true),
    chatExpanded = ref(true);

function togglePeople() {
    peopleExpanded.value = !peopleExpanded.value;
}

function toggleChat() {
    chatExpanded.value = !chatExpanded.value;
}

</script>

<template>
    <main>
        <div class="sidebar" :class="{ open: peopleExpanded }" id="people">
            <div class="sidebar-header">

                <div class="sidebar-title">
                    <h1>Sync3</h1>
                </div>

                <div class="toggle-button-container">
                    <button class="toggle-button" @click="togglePeople">{{ peopleExpanded ? '<' : '>' }}</button>
                </div>


            </div>
            <hr>


            <div class="sidebar-list-body">
                <div class="user" v-for="id in 100" :title="`user ${id}`">
                    <div class="avatar"></div>
                    <span>
                        user {{ id }}
                    </span>
                </div>
            </div>
        </div>

        <div id="video-container">
            <div class="toggle-button-container toggle-chat" v-if="!chatExpanded">
                <button class="toggle-button" @click="toggleChat">&lt;</button>
            </div>
        </div>


        <div class="sidebar" id="chat" :class="{ open: chatExpanded }">
            <div class="sidebar-header">

                <div class="toggle-button-container">
                    <button class="toggle-button" @click="toggleChat">&gt;</button>
                </div>

                <div class="sidebar-title">
                    <h2>Room title</h2>
                </div>
            </div>
            <hr>


            <div class="sidebar-list-body"></div>
        </div>
    </main>
</template>

<style lang="scss" scoped>
main {
    min-height: 100vh;
    max-height: 100vh;
    padding: 1rem 0;
    display: flex;
    flex-direction: row;
    gap: 1rem;
}


#video-container {
    background-color: black;
    flex: 1;
    border-radius: 10px;
    position: relative;
}

#people {
    display: flex;
    flex-direction: column;
    width: 48px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-inline-start: none;
    border-radius: 0 10px 10px 0;

    transition: .1s ease-in-out width;

    &.open {
        width: 248px;
    }
}

#chat {
    display: flex;
    flex-direction: column;
    width: 0px;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-inline-end: none;
    border-radius: 10px 0 0 10px;

    transition: .1s ease-in-out width;

    &.open {
        width: 360px;
    }
}

.sidebar-header {
    height: 48px;
    width: 100%;
    display: flex;
    overflow: hidden;

    .sidebar-title {
        display: flex;
        flex: 1 1 auto;
        min-width: 0;
        white-space: nowrap;
        overflow: hidden;

        align-items: center;

        h1 {
            margin: 0;
            padding: 0 .5rem;
            font-weight: 500;
        }
    }

    .toggle-button-container {
        width: 48px;
        height: 48px;
        min-width: 48px;
        min-height: 48px;

        .toggle-button {
            width: 36px;
            height: 36px;
            margin: 6px;
            border-radius: 4px;

            &:hover {
                background-color: #ddd8;
            }
        }
    }
}

@keyframes a1 {}

.toggle-chat {
    position: absolute;
    right: 0;
    top: 0;

    width: 48px;
    height: 48px;
    min-width: 48px;
    min-height: 48px;

    .toggle-button {
        width: 36px;
        height: 36px;
        margin: 6px;
        border-radius: 4px;
        color: white;

        &:hover {
            background-color: #ddd8;
        }
    }
}

.open .sidebar-list-body {
    scrollbar-width: thin;
}

.sidebar-list-body {
    flex: 1;
    overflow-y: auto;

    scrollbar-width: none;
}

hr {
    margin: 0 10px;
    border: none;
    border-top: 1px solid #ddd;
}


button {
    appearance: none;
    outline: none;
    border: none;
    background-color: transparent;
}

.sidebar {
    overflow: hidden;
}

.user {
    margin-top: 10px;
    display: flex;
    padding: 0 10px;
    gap: 10px;

    align-items: center;
    overflow: hidden;

    .avatar {
        width: 28px;
        height: 28px;
        background-color: gray;
        border-radius: 50%;

        flex: 0 1 auto;
        min-width: 28px;
    }

    span {
        flex: 1 1 auto;
        overflow: hidden;
        text-wrap: nowrap;
    }
}
</style>