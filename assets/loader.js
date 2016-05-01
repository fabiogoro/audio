var sound = {};
var audio_context = new (window.AudioContext || window.webkitAudioContext)();

$(function(){
  var files = 'abcdefghijklmnopqrstuvwxyz'.split('');
  for(var i=0; i<files.length; i++) load(files[i]);
});

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
