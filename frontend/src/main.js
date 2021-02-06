import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import VueSocketIO from '@maticbabnik/vue-socket.io' //I am really sorry i had to do this autism
import {io} from 'socket.io-client'


window.vue = createApp(App).use(router).use(new VueSocketIO({
    debug:true,
    connection: io()
})).mount('#app')
