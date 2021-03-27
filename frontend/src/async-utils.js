module.exports = {
    waitFor(socket, event) {
        return new Promise(resolve => {
            socket.once(event, resolve);
        });
    },
    delay(time) {
        return new Promise(resolve => {
            setTimeout(resolve, time);
        });
    }
}