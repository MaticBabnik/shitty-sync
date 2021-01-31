const log = document.querySelector('#log');
/**
 * @type {HTMLVideoElement}
 */
const video =document.querySelector('#video');

const l = {
    print(arg) {
        const el = document.createElement('span');
        el.classList.add('log-entry')
        el.innerText = arg;
        log.appendChild(el);
    },
    printC(arg, color) {
        const el = document.createElement('span');
        el.classList.add('log-entry')
        el.innerText = arg;
        el.style.color = color;
        log.appendChild(el);
    }
}

let isAdmin = false;
let timesSkipped = 0;
let state = {playing:true};

fetch('/branch').then(async (res)=>{
    document.querySelector('p.branch').innerText = `branch: ${await res.text()}`; 
})

const socket = io();

socket.on('ping', () => socket.emit('ping'));

socket.on('role',(msg)=>{
    l.print(`got role: ${msg}`);
    isAdmin = msg === 'admin';
})

socket.on('set_status',(msg)=>{
    if (msg.playing !== state.playing) {
        console.log(`state != message`)
        state.playing = msg.playing
        state.playing ? video.play() : video.pause()
    }
    if (Math.abs(msg.time - supposedCurrentTime) > 0.1) {
        video.currentTime = msg.time;
    }
})

video.onpause = () => {
    if (isAdmin) return;
    if (state.playing) video.play();
}

video.onplay = () => {
    if (isAdmin) return;
    if (!state.playing) video.pause();
}

var supposedCurrentTime = 0;


video.addEventListener('timeupdate', function() {
  if (!video.seeking) {
        supposedCurrentTime = video.currentTime;
  }
});

video.addEventListener('seeking', function() {
  var delta = video.currentTime - supposedCurrentTime;
  if (Math.abs(delta) > 0.01 && !isAdmin) {
    
    //ideo.currentTime = supposedCurrentTime;
  }
});

setInterval(() => timesSkipped > 0? timesSkipped-- : null, 5000);

setInterval(() => {
    if (isAdmin) socket.emit('request_ping');
}, 1000)

setInterval(()=>{
    if (isAdmin) {
        socket.emit('video_status', {playing:!video.paused,time:supposedCurrentTime});
    }
},100)