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

app.use(express.static('./public'));

app.get('/', function(req, res){

  res.sendFile(__dirname + '/views/index.html');
});

io.on('connection', function(socket) {

  console.log('a user connected');

  // <filter> is {'_id': '5aedbfa63e58ad3f74d92862'}
  socket.on('init', function(req) {
    canvas.find({}, function(err, data) {
      console.log('event: init');
      io.to(req.id).emit('init', data[0].pixels);
    });
  });

  socket.on('draw', function(pixel) {
    console.log('event: draw');
    io.emit('draw', pixel);
    canvas.find({}, function(err, data) {
      pixels = data[0].pixels;
      pixels[pixel.pos] = pixel.color;
      canvas.update(
         {},
         { $set: {"pixels": pixels} },
         function(err, numAffected) {
           return;
         }
      );
    });
  });

});

http.listen(3000, function(){
  console.log('listening on port 3000');
});
