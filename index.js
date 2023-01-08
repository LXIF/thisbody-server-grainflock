//jshint: esversion 6

const serveStatic = require('serve-static');
const sslRedirect = require('heroku-ssl-redirect').default;
const express = require('express');
const app = express();
const cors = require('cors');

app.use(sslRedirect());
// app.use(express.static("public"));

// app.get('', (req, res) => {
//     res.sendFile("index.html")
// });
app.use(cors());
app.options('*', cors());

var history = require('connect-history-api-fallback');

app.use(history());
app.use(serveStatic(__dirname + '/dist'));

const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: ['https://thisbody.herokuapp.com/', 'https://www.thisbody.xyz'],
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {



    socket.on('howdy', (message) => {

        console.log(message);

    });

    socket.on('play', (payload) => {
        socket.broadcast.emit('play', payload);
    });

    // socket.on('breath', (breath) => {
    //     socket.broadcast.emit('breath', breath);
    // });
});

http.listen(process.env.PORT || 3000, () => {
    console.log('listnin 3K yeet');
});