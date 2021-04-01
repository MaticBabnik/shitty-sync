import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

if (!navigator.brave)
    window.vue = createApp(App).use(router).mount('#app')
else {
    document.body.innerHTML = `<img src="https://cdn.discordapp.com/attachments/745913145624756234/827226568320745502/N4AAAAASUVORK5CYII.png"> <h1>Get a real browser</h1>`;    
}
