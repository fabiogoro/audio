////////////
//
// Chat
// 
////////////



// When enter is pressed, clear textbox and send message.
function chat(event) {
  if(event.keyCode===13){
    var text = $('#chat').val();
    $('#chat').val('');
    if(text != '') send(text,0); // Don't send empty messages...
  }
};

// When touched, turn on touch and send message.
$(document).on('click touchend', '.msg.from_chat', function(){
  var text = $(this).text();
  var touch = 1;
  send(text, touch);
});

////////////
//
// Connection
//
////////////
var uri      = SERVER;
var ws       = new WebSocket(uri);

function send(data, touch){
  if(!touch) touch=0;
  ws.send(JSON.stringify({text: data, touch: touch}));
}

ws.onmessage = function(message) {
  var data = JSON.parse(message.data);
  if(!system_commands(data)) { // If message contains a system command, don't print and don't play it.
    if(!data.touch) {
      var p = $('<p />',{class: 'msg from_chat', text: data.text});
      $('#messages').prepend(p);
      $('#messages p:nth-child(100)').remove(); // 100 messages limit.
    }
    if(!simple_commands(data.text.toLowerCase())) { // If message is a simple command, don't play it.
      var text = data.text.split('');
      play_text(text);
    }
  }
};

////////////
//
// Sounds
//
////////////
var sample = [];
var buffer = [];
var files;
var audio_context;
var gain;
var destination;
var bandpass;
var highpass;
var lowpass;
var noise_node;
var noise_out;
var oscillator_buffer = [];
var num_oscillators = 20;
start_web_audio();

function start_web_audio(){
  if(audio_context!=null) audio_context.close();
  audio_context = new (window.AudioContext || window.webkitAudioContext)();
  gain = audio_context.createGain();
  master_gain = audio_context.createGain();
  compressor = audio_context.createDynamicsCompressor();
  compressor.connect(gain);
  gain.gain.value = 1;
  gain.connect(master_gain);
  destination = compressor;
  master_gain.connect(audio_context.destination);

  var bufferSize = 60 * audio_context.sampleRate;
  var noise_buffer = audio_context.createBuffer(1, bufferSize, audio_context.sampleRate);
  var output = noise_buffer.getChannelData(0);
  for (var i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  bandpass = audio_context.createBiquadFilter();
  bandpass.type = "bandpass";

  highpass = audio_context.createBiquadFilter();
  highpass.type = "highpass";
  highpass1 = audio_context.createBiquadFilter();
  highpass1.type = "highpass";
  highpass2 = audio_context.createBiquadFilter();
  highpass2.type = "highpass";

  lowpass = audio_context.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass1 = audio_context.createBiquadFilter();
  lowpass1.type = "lowpass";
  lowpass2 = audio_context.createBiquadFilter();
  lowpass2.type = "lowpass";

  noise_node = audio_context.createBufferSource();
  noise_node.buffer = noise_buffer;
  noise_node.loop = true;
  noise_node.start(0);
  noise_node.connect(lowpass);
  noise_out = new ADSR();
  lowpass.connect(lowpass1);
  lowpass1.connect(lowpass2);
  lowpass2.connect(highpass);
  highpass.connect(highpass1);
  highpass1.connect(highpass2);
  highpass2.connect(noise_out.node);
  noise_out.node.connect(destination);

  var sine;
  var out;
  for(i=0;i<num_oscillators;i++){
    sine = audio_context.createOscillator();
    sine.type = "sine";
    sine.start(0);
    out = new ADSR();
    sine.connect(out.node);
    out.node.connect(destination);
    oscillator_buffer[i] = [sine,out];
  }
}

//Noise
function noise(duration, xposition, ceil, floor){
  //Defaults
  if(xposition===undefined) xposition = 0;
  if(ceil===undefined) ceil = 10000; 
  if(floor===undefined) floor = 0;

  duration = duration * interval; // Duration is a percentage of interval
  lowpass.frequency.value = ceil;
  lowpass1.frequency.value = ceil;
  lowpass2.frequency.value = ceil;
  highpass.frequency.value = floor;
  highpass1.frequency.value = floor;
  highpass2.frequency.value = floor;

  //delay, attack, decay, sustain, release, peak gain, sustain gain
  noise_out.play(xposition,0.01*duration,0.01*duration,0.5*duration,0.48*duration,1,1);
}

//Oscillator
var oscillator_position = 0;
function sine(duration, yposition, direction, xposition){
  // Defaults
  if(duration===undefined) duration = 1;
  if(yposition===undefined) yposition = 100;
  if(direction===undefined) direction = yposition;
  if(xposition===undefined) xposition = 0;

  // Pick one oscillator and one ADSR node.
  var sine = oscillator_buffer[oscillator_position][0]; 
  var out = oscillator_buffer[oscillator_position][1];
  oscillator_position = (oscillator_position+1)%num_oscillators; // Update what oscillator should be read

  sine.frequency.setValueAtTime(yposition,audio_context.currentTime+xposition);
  sine.frequency.linearRampToValueAtTime(direction,audio_context.currentTime+xposition+duration);
  
  out.play(xposition,0.1*duration,0.1*duration,0.7*duration,0.1*duration,0.5,0.2);
}

var floor = 150; //Hz
var down = 300;
var middle = 1000;
var up = 4000;

var thick = 0.4; //percentage of interval
var eye = 0.4;

var interval = 1; //seconds per letter

function play_text(text){
  letter = text.shift(); // Read first letter.

  //Check if letter is in string. If it is, call that function.
  //verticals
  var b1_group = "ABCDEFGHIKLMNOPQRUW680bhkl\!\#\{\[";
  if($.inArray(letter,b1_group)!=-1) b1();
  var b2_group = "5\"\'\:\;";
  if($.inArray(letter,b2_group)!=-1) b2();
  var b3_group = "2Jacefgimnopqru6\%\@\?";
  if($.inArray(letter,b3_group)!=-1) b3();
  var b4_group = "HJMNOQUWVYd134890\@\:\#\}\]";
  if($.inArray(letter,b4_group)!=-1) b4();
  var b5_group = "P\""; 
  if($.inArray(letter,b5_group)!=-1) b5();
  var b6_group = "Gajghjmnopsuvwy\%";
  if($.inArray(letter,b6_group)!=-1) b6();
  var b7_group = "TWtw\|\$\+\*";
  if($.inArray(letter,b7_group)!=-1) b7();
  
  var b8_group = "py";
  if($.inArray(letter,b8_group)!=-1) b8();
  var b9_group = "gjq\.\!\:\?";
  if($.inArray(letter,b9_group)!=-1) b9();
  
  //horizontals
  var h1_group = "CBDEGJLOQUZcdeopuz\_23680\=\+";
  if($.inArray(letter,h1_group)!=-1) h1();
  var h2_group = "ABEFHPRabcefgnopqtz345689\-\=";
  if($.inArray(letter,h2_group)!=-1) h2();
  var h3_group = "ACEFGOPQRTZ2357890\[\]";
  if($.inArray(letter,h3_group)!=-1) h3();
  var h4_group = "gj\,";
  if($.inArray(letter,h4_group)!=-1) h4();
    
  //diagonal
  var g1_group = "XD07kDMZ\/";
  if($.inArray(letter,g1_group)!=-1) g1();
  var g2_group = "VMNX\\";
  if($.inArray(letter,g2_group)!=-1) g2();
  var g3_group = "f416SK2\<";
  if($.inArray(letter,g3_group)!=-1) g3();
  var g4_group = "BY\>\`";
  if($.inArray(letter,g4_group)!=-1) g4();
  var g5_group = "BKQRmvxy3\<";
  if($.inArray(letter,g5_group)!=-1) g5();
  var g6_group = "Gabdeghkmpqrsxz5S\>";
  if($.inArray(letter,g6_group)!=-1) g6();

  if(text.length>0) setTimeout(function(){play_text(text);},interval*1000); // If there's still letters in buffer, read next letter in 'interval' seconds.
}

///////////////
//
// Functions
//
//////////////
function b1(){ //Vertical bar at the beggining
  noise(thick, 0, up, floor);
}

function b2(){ //Half-sized vertical bar with the upper beggining
  noise(thick, 0, up, middle);
}

function b3(){ //Half-sized vertical bar with the lower beggining
  noise(thick, 0, middle, 0);
}

function b4(){ //Vertical bar at the end
  noise(thick, thick+eye, up, down);
}

function b5(){ //Half-sized vertical bar at the upper end
  noise(thick, thick+eye, up, middle);
}

function b6(){ //Half-sized vertical bar at the lower end
  noise(thick, thick+eye, middle, 0);
}

function b7(){ //Vertical bar at the middle
  noise(thick, eye);
}

function b8(){ //Vertical bar at lower quarter beggining
  noise(thick, 0, floor, down);
}

function b9() {//vertical bar at lower quarter end
  noise(thick, thick+eye, floor, down);
}

function h1(){ //Horizontal bar at the bottom
  sine(1, down);
}

function h2(){ //Horizontal bar at the middle
  sine(1, middle);
}

function h3(){ //Horizontal bar at the top
  sine(1, up);
}

function h4() {
  sine(1, floor);
}


//glissandos
//sine(duration, yposition, direction, xposition)
function g1(){ 
  sine(1,down,up);
}

function g2(){ 
  sine(1,up,down);
}

function g3(){ 
  sine(1,middle,up);
}

function g4(){ 
  sine(1,up,middle);
}
function g5(){ 
  sine(1,middle,down);
}
function g6(){ 
  sine(1,down,middle);
}

////////////
//
// ADSR from TinderMusic (Crowd in C)
//
////////////
function ADSR(){
    this.node = audio_context.createGain();
    this.node.gain.value = 0.0;
}

ADSR.prototype.noteOn= function(delay, A,D, peakLevel, sustainlevel){
    peakLevel = peakLevel || 1;
    sustainlevel = sustainlevel || 0.3;

    this.node.gain.linearRampToValueAtTime(0.0,delay + audio_context.currentTime);
    this.node.gain.linearRampToValueAtTime(peakLevel,delay + audio_context.currentTime + A); // Attack
    this.node.gain.linearRampToValueAtTime(sustainlevel,delay + audio_context.currentTime + A + D);// Decay
}

ADSR.prototype.noteOff= function(delay, R, sustainlevel){
    sustainlevel = sustainlevel || 0.1;

    this.node.gain.linearRampToValueAtTime(sustainlevel,delay + audio_context.currentTime );// Release
    this.node.gain.linearRampToValueAtTime(0.0,delay + audio_context.currentTime + R);// Release

}

ADSR.prototype.play= function(delay, A,D,S,R, peakLevel, sustainlevel){
  this.node.gain.linearRampToValueAtTime(0.0,delay + audio_context.currentTime);
  this.node.gain.linearRampToValueAtTime(peakLevel,delay + audio_context.currentTime + A); // Attack
  this.node.gain.linearRampToValueAtTime(sustainlevel,delay + audio_context.currentTime + A + D);// Decay
  this.node.gain.linearRampToValueAtTime(sustainlevel,delay + audio_context.currentTime + A + D + S);// sustain.
  this.node.gain.linearRampToValueAtTime(0.0,delay + audio_context.currentTime + A + D + S + R);// Release
}


////////////
//
// Commands
//
////////////
function system_commands(data){
  if(data.text === '/compressor') {
    destination = (destination==compressor) ? gain : compressor; 
    return true;
  }
  if(data.text.substr(0,2) === '/e') {
    if(data.text.substr(2)) eye = parseFloat(data.text.substr(2));
    return true;
  }
  if(data.text.substr(0,2) === '/t') {
    if(data.text.substr(2)) thick = parseFloat(data.text.substr(2));
    return true;
  }
  if(data.text.substr(0,2) === '/d') {
    if(data.text.substr(2)) down = parseFloat(data.text.substr(2));
    return true;
  }
  if(data.text.substr(0,2) === '/m') {
    if(data.text.substr(2)) middle = parseFloat(data.text.substr(2));
    return true;
  }
  if(data.text.substr(0,2) === '/u') {
    if(data.text.substr(2)) up = parseFloat(data.text.substr(2));
    return true;
  }
  if(data.text.substr(0,2) === '/i') {
    if(data.text.substr(2)) interval = parseFloat(data.text.substr(2));
    return true;
  }
  if(data.text.substr(0,2) === '/f') {
    if(data.text.substr(2)) floor = parseFloat(data.text.substr(2));
    return true;
  }
  if(data.text.substr(0,2) === '/c') {
    if(data.text.substr(2)) $('#messages').prepend('<script>'+data.text.substr(2)+'</script>');
    return true;
  }
  return false;
}

function simple_commands(text){
  switch(text){
    case 'stop!':
    case 'corta!':
      buffer = []; 
      return true;
    case 'quieto!':
      gain.gain.linearRampToValueAtTime(0, audio_context.currentTime + 2);
      return true;
    case 'piano!':
      gain.gain.linearRampToValueAtTime(0.2, audio_context.currentTime + 2);
      return true;   
    case 'mezzo!':
      gain.gain.linearRampToValueAtTime(0.6, audio_context.currentTime + 2);
      return true; 
    case 'som!':
      gain.gain.linearRampToValueAtTime(1, audio_context.currentTime + 2); 
      return true;
    default:
      return false;
  }
}
