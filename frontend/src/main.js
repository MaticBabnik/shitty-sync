import App from './App.vue'
import { createApp } from 'vue'
import router from './router'
import SWorker from '@/worker?sharedworker'

import '@/assets/main.less'

try {
  window.worker = new SWorker()
  window.worker.port.start()
} catch (e) {
  console.warn('Could not create shared worker')
  console.warn(e)
}

handleTheme()
createApp(App).use(router).mount('#app')

function handleTheme() {
  const root = document.querySelector('html')
  const theme = localStorage.getItem('theme')

  if (['dark', 'light'].includes(theme)) {
    root.dataset['theme'] = theme
  } else {
    localStorage.setItem('theme', 'dark')
    root.dataset['theme'] = 'dark'
  }
}
