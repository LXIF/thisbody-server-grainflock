//jshint: esversion 6

const serveStatic = require('serve-static');
const sslRedirect = require('heroku-ssl-redirect').default;
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const grainStorage = multer.diskStorage({
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    },
    destination: function (req, file, cb) {
      cb(null, './samples/grainflocker')
    },
  });
const welcomeStorage = multer.diskStorage({
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    },
    destination: function (req, file, cb) {
      cb(null, './samples/welcome')
    },
  });
// const upload = multer( {
//     dest: './uploads',
    
// } );
const uploadGrainSamples = multer( { storage: grainStorage } );
const uploadWelcome = multer( { storage: welcomeStorage } );
const app = express();
const cors = require('cors');

app.use(sslRedirect());
// app.use(express.static("public"));

// app.get('', (req, res) => {
//     res.sendFile("index.html")
// });
app.use(cors());
app.options('*', cors());

app.use(express.json());

app.get('/sampleslist',(req,res) => {
    let samplesList;
    fs.readdir('./samples/grainflocker', (err, files) => {
        samplesList = [...files]
        res.send({
            list: files
        });
    });
});


app.post('/grain', uploadGrainSamples.any('sounds'), (req,res) => {
    res.send({ message: 'omnomnom' });
});

app.post('/welcome', uploadWelcome.single('sounds'), (req,res) => {
    res.send({ message: 'omnomnom' });
});

app.get('/welcomesound', (req,res) => {
    fs.readdir('./samples/welcome', (err, files) => {
        res.send({
            name: files[0]
        });
    });
});

app.get('/welcome', (req,res) => {
    let path;
    fs.readdir(__dirname + '/samples/welcome', (err, files) => {
        path = __dirname + '/samples/welcome/' + files[0];
        res.sendFile(path)
    });
});

app.post('/deletegrain/:name', (req,res) => {
    path = __dirname + '/samples/grainflocker/' + req.params.name;
    fs.unlink(path, (err) => {
        if(!err) {
            res.send({
                message: 'deleted ' + req.params.name
            });
        } else {
            res.send({
                message: err
            });
        }
    });
});

app.get('/grain/:name', (req,res) => {
    path = __dirname + '/samples/grainflocker/' + req.params.name
    res.sendFile(path);
});

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

    socket.on('midi', (payload) => {
        socket.broadcast.emit('midi', payload);
    });

    // socket.on('breath', (breath) => {
    //     socket.broadcast.emit('breath', breath);
    // });
});

http.listen(process.env.PORT || 3000, () => {
    console.log('listnin 3K yeet');
});