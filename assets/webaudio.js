var sample = {};
var buffer = [];
var audio_context = new (window.AudioContext || window.webkitAudioContext)();
var started = 0;
var gain = audio_context.createGain();
gain.connect(audio_context.destination);

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

$(document).on('click touchend', '.msg', function(){
  var text = $(this).text();
  send(text, 1);
});

function play(pos){
  var source = audio_context.createBufferSource();
  var sound = buffer[pos].shift().charCodeAt(0);
  if(sample[sound]===0) sound = 0;
  source.buffer = sample[sound];
  source.connect(gain);
  source.onended = function(){if(buffer.length != 0 && buffer[pos] != '' ) play(pos);};
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

var canvas;
$(function(){
  var analyser = audio_context.createAnalyser();
  gain.connect(analyser);
  analyser.fftSize = 2048;
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Float32Array(bufferLength);
  var canvas_e = $('.visualizer')[0];
  canvas = canvas_e.getContext("2d");
  canvas.clearRect(0, 0, WIDTH, HEIGHT);
  var WIDTH = canvas_e.width;
  var HEIGHT = canvas_e.height;
  canvas.fillStyle = 'rgb(255, 255, 255)';
  canvas.fillRect(0, 0, WIDTH, HEIGHT);

  function draw() {
    canvas.clearRect(0, 0, WIDTH, HEIGHT);
    var freqDomain = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freqDomain);
    for (var i = 0; i < analyser.frequencyBinCount; i++) {
      var value = freqDomain[i];
      var percent = value / 256;
      var height = HEIGHT * percent;
      var offset = HEIGHT - height - 1;
      var barWidth = WIDTH/analyser.frequencyBinCount;
      var hue = i/analyser.frequencyBinCount * 360;
      canvas.fillStyle = 'hsl(' + hue + ', 100%, 50%)';
      canvas.fillRect(i * barWidth, offset, barWidth, height);
    }
    var timeDomain = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteTimeDomainData(timeDomain);
    for (var i = 0; i < analyser.frequencyBinCount; i++) {
      var value = timeDomain[i];
      var percent = value / 256;
      var height = HEIGHT * percent;
      var offset = HEIGHT - height - 1;
      var barWidth = WIDTH/analyser.frequencyBinCount;
      canvas.fillStyle = 'black';
      canvas.fillRect(i * barWidth, offset, 1, 1);
    }
    drawVisual = requestAnimationFrame(draw);
  }

  draw();
});
