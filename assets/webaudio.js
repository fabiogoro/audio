var sample = {};
var buffer = [];

function chat(event) {
  if(event.keyCode===13){
    var text = $('#chat').val();
    $('#chat').val('');
    if(text != '') send(text,0);
  }
};

$(document).on('click', '.msg', function(){
  var text = $(this).text();
  send(text, $(this).prop('id'));
});

function play(pos){
  var source = audio_context.createBufferSource();
  var sound = buffer[pos].shift();
  if(sound === ' ') sound = 'space';
  source.buffer = sample[sound];
  source.connect(audio_context.destination);
  source.onended = function(){if(buffer.length != 0 && buffer[pos] != '' ) play(pos);};
  source.start(0);
}
