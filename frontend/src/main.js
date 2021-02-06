import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueSocketIO from '@maticbabnik/vue3-socket.io' //I am really sorry i had to do this autism
import SocketIO from 'socket.io'


createApp(App).use(router).use(new VueSocketIO({
    debug:true,
    connection: SocketIO()
})).mount('#app')
