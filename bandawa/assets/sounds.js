var sample = [];
var buffer = [];
var files;
var audio_context;
var compressor;
var gain;
var destination;
start_web_audio();

function start_web_audio(){
  if(audio_context!=null) audio_context.close();
  audio_context = new (window.AudioContext || window.webkitAudioContext)();
  compressor = audio_context.createDynamicsCompressor();
  gain = audio_context.createGain();
  master_gain = audio_context.createGain();
  gain.gain.value = 1;
  gain.connect(master_gain);
  destination = gain;
  compressor.connect(gain);
  master_gain.connect(audio_context.destination);
}

var bpm = 120;
function play_sample(pos){
  var source = audio_context.createBufferSource();
  var sound = buffer[pos].shift().charCodeAt(0);
  if(sample[folder][sound]===0) sound = 0;
  source.buffer = sample[folder][sound];
  source.connect(destination);
  source.start(0);
}

var scale = [0, 2, 4, 5, 7, 9, 11];
var scale2 = [0, 2, 3, 5, 7, 8, 10, 12, 14, 15, 17, 19];
var vowels = [
  "a", "á", "à", "ä", "â", "ã",
  "e", "é", "è", "ë", "ê",
  "i", "í", "ì", "ï", "î",
  "o", "ó", "ò", "ö", "ô", "õ",
  "u", "ú", "ù", "ü", "û",
];
function isVowel(letter) {
    return vowels.indexOf(letter.toLowerCase()) >= 0;
}

function play(pos){
  // play_sample(pos);
  // if(buffer.length != 0 && buffer[pos] != '') setTimeout('play('+pos+')',60/bpm*1000);
  console.log("play");
  // meSpeak.speak(buffer[pos], {
  //   amplitude: 100,
  //   wordgap: 1,
  //   pitch: 60,
  //   speed: 120,
  //   variant: "f2"
  // });

  stopAll();
  var bwc = false; // bufferSizeWhiteNoise changed
  var bpc = false; // bufferSizePinkNoise changed
  var bbc = false; // bufferSizeBrownNoise changed

  for (var i = 0; i < buffer[pos].length; i++) {
      var asciiCode = buffer[pos][i].charCodeAt(0)-5;
      var velocity =  asciiCode%25;
      var j = i % (numberOfOscAndNoise+1);
      var note = scale2[asciiCode % 12] + 4*12 + 9;
      console.log(buffer [pos]+ " " + asciiCode + " "+ scale2[asciiCode % 12]+ " osc" + j + " = " + note + ", " + velocity);

      if (isVowel(buffer[pos][i])) {
        window["osc"+j].noteOn(note, velocity);
      } else {
        window["noise"+j].disconnect();
        switch (j) {
          case 0:
            bwc? bwc:(bufferSizeWhiteNoise = Math.pow(2,note%6+8)); // between 2^8 and 2^14
            bwc = true;
            console.log("white");
            window["noise"+j] = (whiteFunc)();
            break;
          case 1:
            bpc? bpc: (bufferSizePinkNoise = Math.pow(2,note%6+8));
            bpc = true;
            console.log("pink");
            window["noise"+j] = (pinkFunc)();
            break;
          case 2:
            bbc? bbc: (bufferSizeBrownNoise = Math.pow(2,note%6+8));
            bbc = true;
            console.log("brown");
            window["noise"+j] = (brownFunc)();
            break;
          default:
          // bufferSizeWhiteNoise = 4096;
            window["noise"+j] = (whiteFunc)();
        }
        window["noise"+j].connect(audio_context.destination);
      }

  }
}

function play_repeat(pos, p_element){
  play_sample(pos);
  if(buffer.length != 0 && buffer[pos] != '') setTimeout(play_repeat,60/bpm*1000,pos,p_element);
  else{
    if(p_element.text()!=''){
      buffer[pos]=p_element.text().split('');
      setTimeout(play_repeat,60/bpm*1000,pos,p_element);
    }
  }
  //pos = buffer.length-1;
  //play(pos);
  //play_repeat(data);
}

$(function(){
  loaded();
  // init();
});

function init(){
  // files = 0;
  // var format = ['.mp3' /*'.ogg', /*'.wav'*/];
  // for(i=0;i<=FOLDERS;i++){
  //   sample.push({});
  //   load_folder(i, format[0]);
  // }
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
    if (this.status === 404) {if(!sample[folder][file]) sample[folder][file] = 0; if(files<50) loaded();}
    else {
      audio_context.decodeAudioData(request.response, function(buffer) {
        sample[folder][file] = buffer;
        if(files<50) loaded();
      }, on_error);
    }
  };
  if(!file) request.open('GET', 'samples_0/32.mp3', true);
  else request.open('GET', 'samples_'+folder+'/'+file+format, true);
  request.responseType = 'arraybuffer';
  request.send();
}

function on_error(e){
  console.log('Error: '+e);
  if(files<50) loaded();
}
