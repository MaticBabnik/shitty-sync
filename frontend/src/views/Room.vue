<template>
  <div class="main">
    <div id="content">
      <videojs class="video" :options="videoOptions"> </videojs>
      <h1 class="section-title">Party ({{ people.length }} members):</h1>
      <div class="user-grid">
        <person
          v-for="(person, index) in people"
          :key="index"
          :nickname="person.username"
          :id="person.id"
          :role="person.role"
          :isLocalUserAdmin="index != 0"
          :isLocalUser="index == 0"
        />
      </div>
      <h1 class="section-title">Source:</h1>
      <input type="text" ref="source" class="input-url" />
    </div>
    <div id="chat">
      <div class="msg-container">
        <message
          v-for="(message, index) in messages"
          :key="index"
          :username="message.user"
          :message="message.content"
        />
      </div>
      <textarea
        ref="chatInput"
        @input="singleLineAutoGrow"
        @keypress.enter="sendMessage"
      ></textarea>
    </div>
    <div class="popup" v-if="!roomReady">
      <img src="@/assets/Spinner.svg" />
      <p>{{ status }}</p>
    </div>
  </div>
</template>

<script>
import { io } from "socket.io-client";
//const roomCodeRegex= /^[A-Z0-9\-]{3,16}$/i

import Message from "../components/Message.vue";
import Videojs from "../components/videojs.vue";
import Person from "@/components/Person.vue";
import { waitFor, delay } from "../async-utils";
import util from "@/util";
export default {
  components: {
    Message,
    Videojs,
    Person,
  },
  data() {
    return {
      latency: {
        start: null,
        records: [],
        last: 0,
      },
      timeOffset: 0,
      roomCode: "",
      roomValid: false,
      status: "Waiting for WS",
      roomReady: false,
      socket: null,
      messages: [],
      people: [],
      videoOptions: {
        autoplay: false,
        controls: true,
        sources: [],
      },
    };
  },
  methods: {
    singleLineAutoGrow(e) {
      e.target.value = e.target.value.replace(/\n/g, "");
      e.target.value = e.target.value.substring(0, 140);
      e.target.style.height = e.target.scrollHeight - 4 + "px";
    },
    sendMessage() {
      //mock
      this.messages.unshift({
        user: "local",
        content: this.$refs.chatInput.value,
      });
      this.socket.send("msg", { msg: this.$refs.chatInput.value });
      this.$refs.chatInput.value = "";
      this.singleLineAutoGrow({ target: this.$refs.chatInput });
    },
    async ping() {
      this.latency.start = Date.now();
      this.socket.emit("ping");
      await waitFor(this.socket, "pingret");
    },
    onPingReturn() {
      let latency = Date.now() - this.latency.start;
      this.latency.records.push(latency);
      this.latency.last = latency;
      console.log(`Ping: ${latency}`);
    },
    getTime() {
      return Date.now() + this.timeOffset;
    }
  },
  async mounted() {
    this.singleLineAutoGrow({ target: this.$refs.chatInput });

    // if (this.$route.path)
    let roomCode = this.$route.path.split("/")[1];
    this.roomCode = roomCode;
    this.socket = io();

    await waitFor(this.socket, "connect");
    this.socket.on("pingret", this.onPingReturn);

    await delay(200);

    for (let i = 1; i <= 10; i++) {
      this.status = `Calculating latency ${i}/10`;
      await this.ping();
    }

    const latency = util.average(util.ignoreWorst(this.latency.records));

    console.log({ latency });
    this.status = "Syncing time...";

    this.socket.emit("synctime", { latency });
    const serverTime = await waitFor(this.socket, "synctime");
    console.log(`The server time is ${serverTime}`);
    this.timeOffset = serverTime - Date.now();

    this.socket.emit('testtime',{time: this.getTime() + latency/2});
    const delta = await waitFor(this.socket,'testtime');

    console.log(`delta @ client : ${this.timeOffset}\ndelta @ sever : ${delta}`);

    this.status = 'Getting room info';


    this.roomReady = true ;
  },
};
</script>

<style lang="less">
@import url("../assets/colors.less");
* {
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
}
.main {
  background-color: @base03;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: row;
  overflow: hidden;
}

#content {
  flex: 1;
  overflow-y: scroll;
}

#chat {
  width: 400px;
  display: flex;
  flex-direction: column;
  padding: 0;

  .msg-container {
    flex: 1;
    display: flex;
    flex-direction: column-reverse;
    overflow-y: scroll;
  }
  textarea {
    width: 100%;
    height: fit-content;
    background-color: @base02;
    color: @base00;
    font-size: 20px;
    padding: 2px;
    line-height: 24px;
    margin: 0;
  }
}
.input-url {
  background-color: @base02;
  color: @base00;
}

/* reset input cancer */
textarea,
textarea:active,
textarea:focus input,
input:active,
input:focus {
  border: none;
  outline: none;
  resize: none;
}

.video {
  width: 100%;
  height: 100%;
  max-height: 80vh;
  background-color: black;
}

.section-title {
  font-size: 24px;
  color: @magenta;
  margin: 5px;
}

.user-grid {
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  grid-gap: 1rem;
}

/* width */
::-webkit-scrollbar {
  width: 5px;
}

/* Track */
::-webkit-scrollbar-track {
  background-color: #8884;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background: #2aa198;
}

.popup {
  position: absolute;
  z-index: 10;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  backdrop-filter: blur(4px);

  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  img {
    height: 40%;
    width: 40%;
  }
  p {
    color: @base00;
    font-size: 32px;
  }
}
</style>