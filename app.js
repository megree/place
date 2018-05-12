var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var mongoose = require('mongoose');

mongoose.connect('mongodb://place:places@ds113200.mlab.com:13200/place');
var canvasSchema = new mongoose.Schema({
  pixels: [Number]
});
var canvas = mongoose.model('canvas', canvasSchema);
// canvas({pixels: Array(64 * 64).fill(0)}).save();

var queue = [];

app.use(express.static('./public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/views/index.html');
});

io.on('connection', function(socket) {
  console.log('a user connected');

  // <filter> is {'_id': '5aedbfa63e58ad3f74d92862'}
  socket.on('init', function(req) {
    queue.push(req);
    console.log(queue);
    if (queue.length == 1) {
      canvas.find({}, function(err, data) {
        io.to(req.id).emit('init', data[0].pixels);
      });
      return;
    }
    io.to(queue[0].id).emit('ask', {});
  });

  socket.on('answer', function(pagePixels) {
    io.to(queue[queue.length - 1].id).emit('init', pagePixels.pixels);
  });

  socket.on('draw', function(pixel) {
    io.emit('draw', pixel);
  });

  socket.on('save', function(data) {
    console.log('heehee! session id', data.id);
    if (!data.pixels || data.pixels.length !== 6) return;
    queue = queue.filter(function(req) {
      return req.id != data.id;
    });
    console.log('new queue', queue);
    if (queue.length != 0) return;
    canvas.update(
       {},
       { $set: {"pixels": data.pixels} },
       function(err, numAffected) {
         return;
       }
    );
  });

});

http.listen(3000, function(){
  console.log('listening on port 3000');
});
