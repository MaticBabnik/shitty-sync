import App from './App.vue'
import { createApp } from 'vue'
import router from './router'

import * as Sentry from "@sentry/vue";
import { Integrations } from "@sentry/tracing";

import '@/assets/main.less'

//THEME
const root = document.querySelector('html');
const theme = localStorage.getItem('theme');

if (['dark', 'light'].includes(theme)) {
    root.dataset['theme'] = theme;
} else {
    localStorage.setItem('theme', 'dark');
    root.dataset['theme'] = 'dark';
}

const app = createApp(App);

Sentry.init({
    app,
    dsn: "https://e86b78dbaaa34538bc5c0cefdf313436@o1023361.ingest.sentry.io/5989682",
    integrations: [
        new Integrations.BrowserTracing({
            routingInstrumentation: Sentry.vueRouterInstrumentation(router),
            tracingOrigins: ["localhost", "sync.si", /^\//],
        }),
    ],
    tracesSampleRate: 1.0,
});

app.use(router);
app.mount('#app');
console.log('%c Shitty Sync ', 'color: #FF8C00; font-size: 48px; text-shadow: #FC0 0 0 10px;')
console.log('%chi', 'font-size:5px');