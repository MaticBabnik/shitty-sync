const allPorts = [];

function broadcast(message) {
    allPorts.forEach((port) => {
        port.postMessage(message);
    });
}

//TODO: find out how to fix this
// eslint-disable-next-line no-undef
onconnect = (e) => {
    const port = e.ports[0];
    allPorts.push(port);

    port.addEventListener('message', (e) => {
        const message = e.data;
        console.log({ message });
        broadcast(message);
    });

    port.start();
}
