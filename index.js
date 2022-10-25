const WebSocket = require('ws');
var amqp = require('amqplib/callback_api');

// web socket
const server = new WebSocket.Server({
    port: 4444
  });
console.log("websockets running")
let sockets = [];
server.on('connection', function(socket) {
    console.log("alguem se conectou")
    var Conn = {
        socket,
        email: ""
    }
    sockets.push(Conn);
    socket.on('message', function(msg) {
        console.log(`email enviado foi: ${JSON.parse(msg.toString()).message}`)
        var email = JSON.parse(msg.toString()).message
        sockets.map(con => {
            if (con.socket === socket) {
                con.email = email
            }

            return con
        });
    });
    socket.on('close', function() {
        sockets = sockets.filter(s => s.socket !== socket);
    });
});


amqp.connect('amqp://localhost', function(error0, connection) {
    console.log("connected")
    if (error0) {
        throw error0;
    }
    connection.createChannel(function(error1, channel) {
        if (error1) {
            throw error1;
        }

        var queue = 'RENTAL_FOUND';

        channel.assertQueue(queue, {
            durable: true,
        });

        console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);

        channel.consume(queue, function(msg) {
            var rental = JSON.parse(msg.content)
            console.log(rental)
            sockets.forEach(Con => {
                if (Con.email == rental.destinationEmail) {
                    Con.socket.send(JSON.stringify(rental))
                }
            })
        }, {
            noAck: true
        });

    });
});