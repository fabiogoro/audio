var sample = [{},{},{}];
var buffer = [];
var audio_context = new (window.AudioContext || window.webkitAudioContext)();
var files;
var compressor = audio_context.createDynamicsCompressor();
compressor.threshold.value = -50;
compressor.knee.value = 40;
compressor.ratio.value = 24;
compressor.reduction.value = -20;

compressor.connect(audio_context.destination);

function play(pos){
  var source = audio_context.createBufferSource();
  var sound = buffer[pos].shift().charCodeAt(0);
  if(sample[folder][sound]===0) sound = 0;
  source.buffer = sample[folder][sound];
  source.connect(compressor);
  source.onended = function(){if(buffer.length != 0 && buffer[pos] != '' ) play(pos);};
  source.start(0);
}

$(function(){
  init();  
});

function init(){
  files = 0;
  var format = [/*'.mp3', '.ogg',*/ '.wav'];
  for(j=0;j<format.length;j++){
    load_folder(0, format[j]);
    load_folder(1, format[j]);
    load_folder(2, format[j]);
  }
}

function load_folder(folder, format){
  load(folder, 0, format);
  for(var i=32; i<127; i++) load(folder, i, format);
  for(var i=127; i<256; i++) sample[folder][i] = 0;
}

var total;
function load(folder, file, format){
  files++; total = files;
  var request = new XMLHttpRequest();
  request.onload = function() {
    files--;
    $('#percent').html(Math.floor((total-files)/total*100)+'%');
    if (this.status === 404) {if(!sample[folder][file]) sample[folder][file] = 0;}
    else {
      audio_context.decodeAudioData(request.response, function(buffer) {
        sample[folder][file] = buffer;
        if(files===0) loaded();
      }, onError);
    }
  }
  request.open('GET', 'samples_'+folder+'/'+file+format, true);
  request.responseType = 'arraybuffer';
  request.send();
}

function onError(e){
  console.log('Error: '+e);
}
