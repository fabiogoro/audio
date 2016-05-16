var sample = {};
var buffer = [];
var audio_context = new (window.AudioContext || window.webkitAudioContext)();
var started = 0;

window.addEventListener('touchend',start,false);
function start(){
  if (/(iPhone|iPad)/i.test(navigator.userAgent)) {
    if(!started) {
      audio_context = new (window.AudioContext || window.webkitAudioContext)(); 
      started=1;
      var dummy = audio_context.createOscillator();
      dummy.connect(audio_context.destination);
      dummy.start(0);
      dummy.disconnect();
    }
  }
}

function chat(event) {
  if(event.keyCode===13){
    var text = $('#chat').val();
    $('#chat').val('');
    if(text != '') send(text,0);
  }
};

$(document).on('touchend', '.msg', function(){
  var text = $(this).text();
  send(text, 1);
});

function play(pos){
  var source = audio_context.createBufferSource();
  var sound = buffer[pos].shift().charCodeAt(0);
  if(sample[sound]===0) sound = 0;
  source.buffer = sample[sound];
  source.connect(audio_context.destination);
  source.onended = function(){
    if(buffer.length != 0 && buffer[pos] != '' ) play(pos); 
    else $('.'+playing[pos]).removeClass('on');
  };
  source.start(0);
}

$(function(){
  init();  
});

function init(){
  var format = [/*'.mp3', '.ogg',*/ '.wav'];
  for(j=0;j<format.length;j++){
    load(0, format[j]);
    for(var i=32; i<127; i++) load(i, format[j]);
    for(var i=127; i<256; i++) sample[i] = 0;
  }
}


function load(file, format){
  var request = new XMLHttpRequest();
  request.onload = function() {
    if (this.status === 404) {if(!sample[file]) sample[file] = 0;}
    else {
      audio_context.decodeAudioData(request.response, function(buffer) {
        sample[file] = buffer;
      }, onError);
    }
  }
  request.open('GET', 'samples/'+file+format, true);
  request.responseType = 'arraybuffer';
  request.send();
}

function onError(e){
  console.log('Error: '+e);
}
