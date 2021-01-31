const log = document.querySelector('#log');
const membersTab = document.querySelector('#member-list');
/**
 *
 * @type {HTMLInputElement}
 */
const messageTextbox = document.querySelector('#message-textbox');
const sendButton = document.querySelector('#message-send-btn');
const loadMediaButton = document.querySelector('#Media .btn');
const mediaTextbox = document.querySelector('#Media .textbox');
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

const handleSendUsername = (inputElement) => {
    socket.emit('username', inputElement.value);
}

const handleSendMessage = () => {
    const message = messageTextbox.value;
    messageTextbox.value = '';
    socket.emit('message', message);
}

let isAdmin = false;
let timesSkipped = 0;
let state = {playing:true};
let members = []

fetch('/branch').then(async (res)=>{
    document.querySelector('p.branch').innerText = `branch: ${await res.text()}`; 
})

const socket = io();

socket.on('message', ({ message, sender }) => {
    const s = (sender === socket.id ? '(YOU)': '') + members.find(m =>m.id === sender).username;
    l.print(`${s}: ${message}`);
})

socket.on('users', membersList => {
    members = membersList;
    membersTab.innerHTML = '';
    membersList.forEach(m => {
        let el
        if  (m.id === socket.id ) {
            el = document.createElement( 'input');
            el.value = '(YOU)' + m.username;
            el.autocomplete = 'off';
            el.classList.add('textbox');
            el.addEventListener('keydown', e => e.key === 'Enter'? handleSendUsername(e.target): null )

        } else  {
            el = document.createElement( 'span');
            el.innerText = m.username

        }
        el.classList.add('log-entry');
        el.style.color = m.role === 'admin'? '#dc322f' : '#586e75'
        membersTab.appendChild(el)
    })
});

socket.on('ping', () => socket.emit('ping'));

socket.on('role',(msg)=>{
    l.print(`got role: ${msg}`);
    isAdmin = msg === 'admin';
})

socket.on('set_media', videoSrc => {
    video.src = videoSrc;
    video.currentTime = 0;
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

messageTextbox.addEventListener('keydown', e => e.key === 'Enter'? handleSendMessage(): null ) // on enter send message
sendButton.addEventListener('click', handleSendMessage);



const sendMediaSource = () => socket.emit('video_source', mediaTextbox.value);
loadMediaButton.addEventListener('click', sendMediaSource);
mediaTextbox.addEventListener('keydown', e => e.key === 'Enter' ?  sendMediaSource(): null)



setInterval(() => timesSkipped > 0? timesSkipped-- : null, 5000);

setInterval(() => {
    if (isAdmin) socket.emit('request_ping');
}, 5000)

setInterval(()=>{
    if (isAdmin) socket.emit('video_status', {playing:!video.paused,time:supposedCurrentTime});
},500)