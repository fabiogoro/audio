var sample = {};
var audio_context = new (window.AudioContext || window.webkitAudioContext)();

function chat(event) {
  if(event.keyCode===13){
    var text = $('#chat').val();
    $('#chat').val('');
    send({text: text});
  }
};

$(function(){
  var files = 'abcdefghijklmnopqrstuvwxyz';
  for(var i=0; i<files.length; i++) load(files[i]);
});
  
function play(buffer){
  if(buffer){
    var source = audio_context.createBufferSource();
    source.buffer = sample[buffer[0]];
    source.connect(audio_context.destination);
    source.onended = function(){buffer = buffer.slice(1,buffer.length);play(buffer);};
    source.start();
  }
}

function load(file){
  var request = new XMLHttpRequest();
  request.onload = function() {
    audio_context.decodeAudioData(request.response, function(buffer) {
      sample[file] = buffer;
    }, onError);
  }
  request.open('GET', 'samples/'+file+'.mp3', true);
  request.responseType = 'arraybuffer';
  request.send();
}

function onError(e){
  console.log('Error: '+e);
}

