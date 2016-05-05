var sample = {};
var buffer = [];
var audio_context = new (window.AudioContext || window.webkitAudioContext)();

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
  var sound = buffer[pos].shift().charCodeAt(0);
  if(sample[sound]===0) sound = 0;
  source.buffer = sample[sound];
  source.connect(audio_context.destination);
  source.onended = function(){if(buffer.length != 0 && buffer[pos] != '' ) play(pos);};
  source.start(0);
}

$(function(){
  load(0);
  for(var i=32; i<256; i++) load(i);
});

function load(file){
  var request = new XMLHttpRequest();
  request.onload = function() {
    if (this.status === 404) {sample[file] = 0;}
    else {
      audio_context.decodeAudioData(request.response, function(buffer) {
        sample[file] = buffer;
      }, onError);
    }
  }
  request.open('GET', 'samples/'+file+'.mp3', true);
  request.responseType = 'arraybuffer';
  request.send();
}

function onError(e){
  console.log('Error: '+e);
}
