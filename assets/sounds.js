var sample = [];
var buffer = [];
var files;
var audio_context;
var compressor;
var gain;
var destination;

// First function to be executed. It'll start web audio and request sample loading.
$(function(){
  start_web_audio();
  files = 0;
  var format = ['.mp3' /*'.ogg', /*'.wav'*/];
  for(i=0;i<=FOLDERS;i++){
    sample.push({});
    load_folder(i, format[0]);
  }
});

//////////////
//
// Start web audio and create initial node structure.
// It contains two gain nodes. 
//   One of them (gain) is controled by chat commands.
//   The other (master_gain) is controled by config menu and directy connected to audio_context.destination.
// Also there is a compressor that is initialy disconnected, but can be connected by commands.
//
//////////////
function start_web_audio(){
  if(audio_context!=null) audio_context.close(); // Check if any other audio_context has been open, if so, close them.
  audio_context = new (window.AudioContext || window.webkitAudioContext)(); // Get new audio_context.
  compressor = audio_context.createDynamicsCompressor();
  gain = audio_context.createGain();
  master_gain = audio_context.createGain();
  gain.gain.value = 1;
  gain.connect(master_gain);
  destination = gain;
  compressor.connect(gain);
  master_gain.connect(audio_context.destination);
}

//////////////
//
// Plays one sample.
// It'll remove a sample from the buffer, 
// get its ASCII code and 
// create a BufferSource node with the related audio sample.
// The BufferSource node will be connected to the active destination, 
// which could be the gain node or the compressor node.
// 
//////////////
function play_sample(pos){
  var source = audio_context.createBufferSource();
  var sound = buffer[pos].shift().charCodeAt(0);
  if(sample[folder][sound]===0) sound = 0; // If can't find a sample for the ASCII, play sound 0.
  source.buffer = sample[folder][sound];
  source.connect(destination);
  source.start(0);
}

//////////////
//
// which could be the gain node or the compressor node.
// 
//////////////
var bpm = 120;
function play(pos){
  play_sample(pos);
  if(buffer.length != 0 && buffer[pos] != '') setTimeout('play('+pos+')',60/bpm*1000);
}

//////////////
//
// Load functions.
// When ended receiving files, will call loaded function.
//  
//////////////
function load_folder(folder, format){
  load(folder, 0, format);
  for(var i=32; i<127; i++) load(folder, i, format);
  for(var i=127; i<256; i++) sample[folder][i] = 0;
}

var total;
function load(folder, file, format){
  files++; total = files; // Add a file to queue
  var request = new XMLHttpRequest(); // HTTPRequest the file.
  request.onload = function() {
    files--; // Remove a file from queue when response received.
    $('#percent').html(Math.floor((total-files)/total*100)+'%'); // Update loading bar.
    if (this.status === 404) {if(!sample[folder][file]) sample[folder][file] = 0; if(files<50) loaded();} // If file not found, make it value 0.
    else {
      audio_context.decodeAudioData(request.response, function(buffer) {
        sample[folder][file] = buffer;
        if(files<50) loaded(); // If less then 50 files are in queue, consider page ready.
      }, on_error);
    }
  };
  if(!file) request.open('GET', 'samples_0/32.mp3', true);
  else request.open('GET', 'samples_'+folder+'/'+file+format, true);
  request.responseType = 'arraybuffer';
  request.send();
}

// If any error happens, print the error but try to load page anyway.
function on_error(e){
  console.log('Error: '+e);
  if(files<50) loaded();
}
