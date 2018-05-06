$(function () {
  var colors = ['white', 'red', 'blue', 'yellow', 'green', 'brown'];
  var swatch = 0;

  var socket = io();

  $('.palette').children('.color').each(function (i) {
    $(this).css('background-color', colors[i]).click(function() {
      swatch = $(this).index();
    });
  });

  socket.on('connect', function() {

    socket.emit('init', {id: socket.id});
    socket.on('init', function(pixels) {
      console.log('event: init');
      len = pixels.length;
      for (var i = 0; i < len; i++)
        $('.canvas').append('<div class="pixel" style="background-color:' + colors[pixels[i]] + ';"></div>');
    });

    $('.canvas').on('click', '.pixel', function() {
      $(this).css('background-color', colors[swatch]);
      console.log({pos: $(this).index(), color: swatch});
      socket.emit('draw', {pos: $(this).index(), color: swatch});
    });

    socket.on('draw', function(pixel) {
      console.log('sync');
      console.log(pixel);
      //$('.canvas .pixel:nth-child(' + pixel.pos + ')').css('background-color', 'red');
      $(".pixel:eq(" + pixel.pos + ")").css('background-color', colors[pixel.color]);
    });

  });


});
