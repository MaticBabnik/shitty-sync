<template>
  <div class="user" @click="openMenu" @contextmenu.prevent.capture.stop="openMenu">
    <div class="pfp" :style="{ backgroundImage: `url('${pfp}')` }">
      <img v-if="admin" src="@/assets/admin.svg" />
    </div>
    <span :class="{ local: local }">{{ name }}</span>
    <teleport to=".main">
      <context-menu
        v-if="menuShow"
        ref="ctxMenu"
        class="ctx-menu"
        :left="menuLeft"
        :top="menuTop"
        :items="options"
        @action="action"
      ></context-menu>
      <popup-dialog
        v-if="rename"
        @close="() => (rename = false)"
        :title="`Change nickname for ${name}`"
      >
        <input
          type="text"
          v-model="newName"
          :class="{
            input: true,
            invalid: !(nameValid.len && nameValid.chars)
          }"
          placeholder="New nickname"
          @keypress.enter="renamee"
        />
        <input
          type="text"
          class="input"
          placeholder="Gravatar"
          v-model="gravatar"
          @keypress.enter="renamee"
        />
        <div class="rules">
          <span>New nickname:</span>
          <ul>
            <li :class="{ invalid: !nameValid.len }">Must be 3-24 characters long</li>
          </ul>
        </div>
        <button
          :class="{
            button: true,
            disabled: !(nameValid.len && nameValid.chars)
          }"
          @click="renamee"
        >
          Apply
        </button>
      </popup-dialog>
    </teleport>
  </div>
</template>

<script>
/* eslint-disable */
//keep eslint from being annoying (indent issues on switch statements)
import constants from '../constants.js'

import ContextMenu from './ContextMenu.vue'
import PopupDialog from './PopupDialog.vue'
export default {
  components: {
    ContextMenu,
    PopupDialog
  },
  $refs: {
    ctxMenu: HTMLDivElement
  },
  data() {
    return {
      menuShow: false,
      menuLeft: 0,
      menuTop: 0,
      options: [
        { name: 'kick', text: 'Kick', icon: 'close', enabled: false },
        {
          name: 'promote',
          text: 'Promote',
          icon: 'admin',
          enabled: false
        },
        {
          name: 'rename',
          text: 'Change nickname',
          icon: 'edit',
          enabled: false
        }
      ],
      nameValid: {
        len: false,
        chars: true
      },
      rename: false,
      newName: '',
      gravatar: ''
    }
  },
  watch: {
    newName(newVal, oldVal) {
      this.nameValid.len = constants.nameRegexes.len.test(newVal)
      this.nameValid.chars = true
    }
  },
  mounted() {
    this.options[0].enabled = this.islocaladmin && !this.local
    this.options[1].enabled = this.islocaladmin && !this.local
    this.options[2].enabled = this.local
  },
  methods: {
    openMenu(e) {
      if (this.menuShow) return

      this.options[0].enabled = this.islocaladmin && !this.local
      this.options[1].enabled = this.islocaladmin && !this.local
      this.options[2].enabled = this.local

      this.menuShow = true
      this.$nextTick(() => {
        this.menuLeft = e.clientX
        this.menuTop = e.clientY
        requestAnimationFrame(() => {
          document.addEventListener('click', this.closeMenu)
        })
      })
    },
    closeMenu(e) {
      document.removeEventListener('click', this.closeMenu)
      this.menuShow = false
    },
    action(a) {
      switch (a) {
        case 'kick':
          this.$emit('kick', this.id)
          break
        case 'promote':
          this.$emit('promote', this.id)
          break
        case 'rename':
          this.rename = true
          this.newName = this.name
          this.gravatar = localStorage.getItem('gravatar') ?? ''
          break
      }
    },
    renamee() {
      if (!(this.nameValid.len && this.nameValid.chars)) return

      this.rename = false
      let gravatar = this.gravatar.trim()
      if (gravatar.length == 0) gravatar = undefined

      localStorage.setItem('username', this.newName)

      if (gravatar) localStorage.setItem('gravatar', gravatar)
      else localStorage.removeItem('gravatar')

      this.$emit('rename', this.newName, gravatar)
    }
  },
  props: {
    name: { type: String, required: true },
    id: { type: String, required: true },
    admin: { type: Boolean, required: true },
    local: { type: Boolean, required: true },
    islocaladmin: { type: Boolean, required: true },
    pfp: { type: String, required: true }
  }
}
</script>

<style lang="less">
@import url('@/assets/theme.less');

.user {
  user-select: none;

  display: flex;
  flex-direction: column;

  cursor: pointer;

  position: relative;

  align-items: center;
  align-content: center;
  justify-items: center;
  justify-content: center;
  border-radius: 10px;

  .pfp {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    position: relative;
    object-fit: fill;
    background-size: 100%;

    img {
      position: absolute;
      bottom: 3px;
      right: 3px;
      width: 20px;
      height: 20px;
    }
  }

  span {
    width: 96px;
    font-size: 12px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.user:hover {
  transition: 100ms ease;
  background-color: @background-light;
}

.local {
  color: @accent !important;
}

.ctx-menu {
  position: absolute;
  z-index: 5;
  width: fit-content;
  height: fit-content;
  left: 50%;
  right: 50%;
}

.dialog {
  .input {
    margin: 0.2rem 0;
  }
}

.rules {
  padding: 0;
  margin: 10px 0;

  ul {
    margin: 0;

    li {
      color: @background-light;

      &.invalid {
        color: @error;
      }
    }
  }
}
</style>
