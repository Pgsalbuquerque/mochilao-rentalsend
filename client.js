const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:4444');

ws.onopen = function() {
    ws.send("pgsa@cin.ufpe.br")
};

ws.onmessage = function(msg) {
    console.log(msg.data)
};