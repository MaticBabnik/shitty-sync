<template>
  <div class="main">
    <div id="content">
      <video controls>
        <source
          src="http://vedro.works.si/%5BRAPE%5D+Kaifuku+Jutsushi+no+Yarinaoshi+-+03+(720p)+%5B0556E66F%5D.m4v"
        />
      </video>
    </div>
    <div id="chat">
      <div class="msg-container">
        <message v-for="(message, index) in messages" :key="index" :username="message.user" :message="message.content" /> 
      </div>
        <textarea ref="chatInput" @input="singleLineAutoGrow" @keypress.enter="sendMessage"></textarea>
    </div>
  </div>
</template>

<script>
import Message from "../components/Message.vue";

export default {
    components: {
        Message,
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
        };
    },
    methods:{
      singleLineAutoGrow(e) {
        e.target.value = e.target.value.replace(/\n/g, '');
        e.target.value = e.target.value.substring(0,140);
        e.target.style.height =(e.target.scrollHeight - 4)+"px" ;
      },
      sendMessage() {
        //mock
        this.messages.unshift({user:"local",content:this.$refs.chatInput.value});
        this.$refs.chatInput.value = '';
        this.singleLineAutoGrow({target:this.$refs.chatInput})
      }
    },
    mounted (){
      this.singleLineAutoGrow({target:this.$refs.chatInput})
    }
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

/* reset input cancer */
textarea,
textarea:active,
textarea:focus {
  border: none;
  outline: none;
  resize: none;
}

video {
  width: 100%;
  max-height: 80%;
  background-color: black;
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