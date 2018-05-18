$(function () {
  /* var colors = ['white', 'lightgrey', 'grey', 'black', 'pink', 'red',
  'orange', 'brown', 'yellow', 'lightgreen', 'green', 'Aquamarine',
  'Aqua', 'blue', 'violet', 'purple']; */
  var colors = [[255, 255, 255], [228, 228, 228], [136, 136, 136], [34, 34, 34], [255, 167, 209], [229, 0, 0],
  [229, 149, 0], [160, 106, 66], [229, 217, 0], [148, 224, 68], [2, 190, 1], [0, 211, 211],
  [0, 131, 199], [0, 0, 234], [207, 110, 228], [130, 0, 128]];
  var swatch = 0;

  var socket = io();
  var sessionID = null;

  var isTimeout = false;

  var pagePixels = [];

  $('.palette').children('.color').each(function (i) {
    $(this).css('background-color', 'rgb(' + colors[i] + ')').click(function() {
      swatch = $(this).index();
    });
  });

  socket.on('connect', function() {
    sessionID = socket.id;

    socket.emit('init', {id: socket.id});
    socket.on('init', function(pixels) {
      console.log('event: init');
      len = pixels.length;
      for (var i = 0; i < len; i++) {
        $('.canvas').append('<div class="pixel" style="background-color:rgb(' + colors[pixels[i]] + ');"></div>');
        pagePixels[i] = pixels[i];
      }
    });

    $('.canvas').on('click', '.pixel', function() {
      if (isTimeout) return;
      $(this).css('background-color', colors[swatch]);
      var pixel = {pos: $(this).index(), color: swatch};
      pagePixels[$(this).index()] = swatch;
      socket.emit('draw', {pixel: pixel, pixels: pagePixels});
      startTimeout(15);
    });

    socket.on('draw', function(pixel) {
      console.log(pixel);
      $(".pixel:eq(" + pixel.pos + ")").css('background-color', 'rgb(' + colors[pixel.color] + ')');
    });

  });

  function startTimeout(duration) {
    isTimeout = true;

    $('.timer').show();
    var minute = Math.floor(duration / 60);
    var second = duration - minute * 60
    $('.timer').text(minute + ':' + (second < 10? '0' + second : second));
    duration--;

    var setIntervalID = setInterval(function() {
      minute = Math.floor(duration / 60);
      second = duration - minute * 60
      $('.timer').text(minute + ':' + (second < 10? '0' + second : second));
      duration--;
      if (duration < -1) {
        clearInterval(setIntervalID);
        isTimeout = false;
        $('.timer').hide();
      }
    }, 1000)
  }

});
