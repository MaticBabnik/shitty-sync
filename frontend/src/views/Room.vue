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
  </div>
</template>

<script>
import Message from "../components/Message.vue";
import Videojs from "../components/videojs.vue";
import Person from "@/components/Person.vue";

export default {
    components: {
        Message,
        Videojs,
        Person,
    },
    data() {
        return {
            messages: [
                { user: "Test1", content: "lmfaodasdas" },
                { user: "Test2", content: "lmdasdasdfao" },
                { user: "Test3", content: "lmfaasdasdo" },
                { user: "Test4", content: "lmfdasdaao" },
                { user: "Test5", content: "lmfasdao" },
                { user: "Test6", content: "lmsdadasfao" },
                {
                    user: "Test7",
                    content:
            "Any gifters in the chat? xqcL Any gifters in the chat? xqcL Any gifters in the chat? xqcL Any gifters in the chat? xqcL Any gifters in the chat? xqcL ",
                },
                { user: "Test8", content: "lmfao" },
                { user: "Test9", content: "lmfaadso" },
                { user: "Test10", content: "lmfasdao" },
                { user: "Test1", content: "lmfadsado" },
            ],
            people: [
                { username: "Matic", role: "admin", id: "3127912874912" },
                { username: "David", role: "user", id: "2142549168942" },
                { username: "MrPandaBear", role: "user", id: "4525287443915" },
                { username: "GeorgeFloyd", role: "user", id: "2158891989212" },
                { username: "xd", role: "user", id: "8421941284899" },
                { username: "tilen", role: "user", id: "1241242125124" },
                { username: "xd2", role: "user", id: "3128423841912" },
            ],
            videoOptions: {
                autoplay: true,
                controls: true,
                sources: [
                    {
                        src:
              "http://vedro.works.si/%5BRAPE%5D+Kaifuku+Jutsushi+no+Yarinaoshi+-+03+(720p)+%5B0556E66F%5D.m4v",
                        type: "video/mp4",
                    },
                ],
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
            this.$refs.chatInput.value = "";
            this.singleLineAutoGrow({ target: this.$refs.chatInput });
        },
    },
    mounted() {
        this.singleLineAutoGrow({ target: this.$refs.chatInput });
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
</style>