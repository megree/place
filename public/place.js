$(function () {
  var colors = ['white', 'lightgrey', 'grey', 'black', 'pink', 'red', 'orange', 'brown', 'yellow', 'lightgreen', 'green', 'Aquamarine', 'Aqua', 'blue', 'violet', 'purple'];
  var swatch = 0;

  var socket = io();
  var sessionID = null;

  var pagePixels = [];

  $('.palette').children('.color').each(function (i) {
    $(this).css('background-color', colors[i]).click(function() {
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
        $('.canvas').append('<div class="pixel" style="background-color:' + colors[pixels[i]] + ';"></div>');
        pagePixels[i] = pixels[i];
      }
    });

    socket.on('ask', function() {
      console.log('im asked');
      socket.emit('answer', {pixels: pagePixels});
    });

    $('.canvas').on('click', '.pixel', function() {
      $(this).css('background-color', colors[swatch]);
      var pixel = {pos: $(this).index(), color: swatch};
      pagePixels[pixel.pos] = pixel.color;
      socket.emit('draw', pixel);
    });

    socket.on('draw', function(pixel) {
      console.log(pixel);
      pagePixels[pixel.pos] = pixel.color;
      //$('.canvas .pixel:nth-child(' + pixel.pos + ')').css('background-color', 'red');
      $(".pixel:eq(" + pixel.pos + ")").css('background-color', colors[pixel.color]);
    });

  });

  $(window).on('beforeunload', function(){
    socket.emit('save', {pixels: pagePixels, id: sessionID});
  });

});
