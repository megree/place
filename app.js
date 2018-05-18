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
      io.to(req.id).emit('init', data[0].pixels);
    });
  });

  socket.on('draw', function(data) {
    var timestart = Date.now();
    io.emit('draw', data.pixel);
    if (data.pixels.length != 100 * 100) return;
    canvas.update(
       {},
       { $set: {"pixels": data.pixels} },
       function(err, numAffected) {
         console.log('processing time for database update is', Date.now() / 1000 - timestart / 1000, 's');
       }
    );
    /*
    canvas.find({}, function(err, data) {
      data[0].pixels[pixel.pos] = pixel.color;
      canvas.update(
         {},
         { $set: {"pixels": data[0].pixels} },
         function(err, numAffected) {
           console.log('processing time is', Date.now() / 1000 - timestart / 1000, 's');
         }
      );
    });
    */
  });

});

http.listen(3000, function(){
  console.log('listening on port 3000');
});
