const allPorts = [];

function broadcast(message) {
    allPorts.forEach((port) => {
        port.postMessage(message);
    });
}

onconnect = function (e) {
    var port = e.ports[0];
    allPorts.push(port);

    port.addEventListener('message', function (e) {
        var message = e.data;
        
        console.log({message});

        broadcast(message);
    });

    port.start();
}