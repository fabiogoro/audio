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
  if(!data.touch) {
    var p = $('<p />',{class: 'msg from_chat', text: data.text});
    $('#messages').prepend(p);
  }
  var text = data.text.split('');
  play_text(text);
  //buffer.push(text);
  //meSpeak.speak(data.text, {
  //  amplitude: 100,
  //  wordgap: 1,
  //  pitch: 60,
  //  speed: 120,
  //  variant: "f2"
  //});
  //play(buffer.length-1);
  $('#messages p:nth-child(100)').remove();
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
var noise_buffer
start_web_audio();

function start_web_audio(){
  if(audio_context!=null) audio_context.close();
  audio_context = new (window.AudioContext || window.webkitAudioContext)();
  gain = audio_context.createGain();
  master_gain = audio_context.createGain();
  gain.gain.value = 1;
  gain.connect(master_gain);
  destination = gain;
  master_gain.connect(audio_context.destination);

  var bufferSize = 10 * audio_context.sampleRate;
  noise_buffer = audio_context.createBuffer(1, bufferSize, audio_context.sampleRate);
  var output = noise_buffer.getChannelData(0);
  for (var i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
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
  console.log("play");

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
        switch (j%3) {
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
        window["noise"+j].connect(destination);
      }

  }
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
var index = 0;

function ScissorVoice(noteNum, numOsc, oscType, detune){
  this.output  = new ADSR();
  this.maxGain = 1 / numOsc;
  this.noteNum = noteNum;
  this.frequency = noteNum2Freq(noteNum);
  this.oscs = [];
  this.index = index++;
  this.time = audio_context.currentTime;
  for (var i=0; i< numOsc; i++){
    var osc = audio_context.createOscillator();
    if ( oscType.length === "undefined")
      osc.type = oscType;
    else
      osc.type = oscType[i%oscType.length];
    osc.frequency.value = this.frequency;
    osc.detune.value = -detune + i * 2 * detune / numOsc ;
    osc.start(audio_context.currentTime);
    osc.connect(this.output.node);
    this.oscs.push(osc);
  }
  //console.log("played(" + index +") " + noteNum + " at " + audio_context.currentTime);
   //   console.log("started : " +this.noteNum);

}

ScissorVoice.prototype.stop = function(time){
  //time =  time | audio_context.currentTime;
  var it = this;
  setTimeout(function(){
 //   console.log("stopped(" + index +") " +it.noteNum + " at " +audio_context.currentTime);
    for (var i=0; i<it.oscs.length; i++){
        it.oscs[i].disconnect();
    }
  }, Math.floor((time-audio_context.currentTime)*1000));
}

ScissorVoice.prototype.detune = function(detune){
    for (var i=0; i<this.oscs.length; i++){
        //this.oscs[i].frequency.value = noteNum2Freq(noteNum);
        this.oscs[i].detune.value -= detune;
    }
}

ScissorVoice.prototype.connect = function(target){
  this.output.node.connect(target);
}

function noteNum2Freq(num){
    return Math.pow(2,(num-57)/12) * 440;
}

function test_adsr(intervalInSec){
  a = new ScissorVoice(64,1,["sine"],1);
  a.connect(destination);
  a.output.play(0,intervalInSec*0.1,intervalInSec*0.1,intervalInSec*0.4,intervalInSec*0.1,a.maxGain*2.0,a.maxGain);
}

function noise(duration, xposition, yposition, height){
  if(xposition===undefined) xposition = 0;
  if(yposition===undefined) yposition = 10000;
  if(height===undefined) height = 20000;
  //var out = new ADSR();
  var whiteNoise = audio_context.createBufferSource();
  var biquadFilter = audio_context.createBiquadFilter();
  biquadFilter.type = "bandpass";
  biquadFilter.frequency.value = yposition;
  biquadFilter.Q.value = 20/height;
  whiteNoise.buffer = noise_buffer;
  whiteNoise.loop = true;
  whiteNoise.start(audio_context.currentTime+xposition+0.1);
  whiteNoise.stop(audio_context.currentTime+xposition+duration);
  whiteNoise.connect(biquadFilter);
  biquadFilter.connect(destination);
  //out.node.connect(destination);
  //out.play(xposition,0.01*duration,0.01*duration,0.5*duration,0.48*duration,1,0.8);
}

function sine(duration, yposition, direction, xposition){
  if(duration===undefined) duration = 1;
  if(yposition===undefined) yposition = 100;
  if(direction===undefined) direction = yposition;
  if(xposition===undefined) xposition = 0.1;
  var out = new ADSR();
  var sine = audio_context.createOscillator();
  sine.frequency.value = yposition;
  sine.type = "sine";
  sine.connect(out.node);
  sine.start(audio_context.currentTime+xposition);
  sine.frequency.exponentialRampToValueAtTime(direction, audio_context.currentTime+xposition+duration);
  out.node.connect(destination);
  out.play(xposition,0.1*duration,0.1*duration,0.7*duration,0.1*duration,1,0.8);
}

var down = 200;
var middle = 410;
var up = 830;

function f(){ //Criando letra F
  noise(0.2); //Haste vertical, 0.2 segundos de duracao (largura), altura e posicao indefinidos (ocupam espectro todo)
  sine(0.8,up); //Haste superior, 0.8 duracao, posicionado em 8kHz no espectro e com 1 unidade de altura (fino).
  sine(0.7,middle); //Haste inferior, 0.7 duracai, posicionado em 4kHz e 1 unidade de altura.
}

function l(){ //Criando L
  noise(0.2); 
  sine(0.8,down); 
}

function h(){ //Criando H
  noise(0.2);
  sine(0.8,middle);
  noise(0.2,0.8);
}

function v(){
  sine(0.5,up,down);
  sine(0.5,down,up,0.6);
}

function play_matrix(matrix){
  var size = matrix.length;
  for(i=0;i<size;i++)
    for(j=0;j<size;j++)
      if(matrix[i][j]==1)
        noise(1/(size),j/size,4000*(size-i)/size,10*(size-i)/size);
}

function a(){// A
  var matrix = [[0,0,1,0,0],
                [0,1,0,1,0],
                [1,0,0,0,1],
                [1,1,1,1,1],
                [1,0,0,0,1]];
  play_matrix(matrix);
}

function x(){// X
  var matrix = [[1,0,0,0,1],
                [0,1,0,1,0],
                [0,0,1,0,0],
                [0,1,0,1,0],
                [1,0,0,0,1]];
  play_matrix(matrix);
}

function t(){// T
  var matrix = [[1,1,1,1,1],
                [0,0,1,0,0],
                [0,0,1,0,0],
                [0,0,1,0,0],
                [0,0,1,0,0]];
  play_matrix(matrix);
}

function play_text(text){
  letter = text.shift();
  switch(letter){
    case 'A': a(); break;
    case 'X': x(); break;
    case 'T': t(); break;
    case 'F': f(); break;
    case 'H': h(); break;
    case 'V': v(); break;
    case 'L': l(); break;
    default:
    var b1_group = "A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, U, W, 1, 6, 8, 0";
    if($.inArray(letter,b1_group)!=-1) b1();
    var b2_group = "V, S, 5, 4";
    if($.inArray(letter,b2_group)!=-1) b2();
    var b3_group = "X, Z, 2, J";
    if($.inArray(letter,b3_group)!=-1) b3();
    var b4_group = "A, B, D, H, J, M, N, O, Q, U, W, V";
    if($.inArray(letter,b4_group)!=-1) b4();
    var b5_group = "P, R";
    if($.inArray(letter,b5_group)!=-1) b5();
    var b6_group = "G, S, X";
    if($.inArray(letter,b6_group)!=-1) b6();
    var b7_group = "T";
    if($.inArray(letter,b7_group)!=-1) b7();
    var h1_group = "B, C, D, E, G, J, K, L, O, Q, S";
    if($.inArray(letter,h1_group)!=-1) h1();
    var h2_group = "A, B, E, F, G, H, P, R, S";
    if($.inArray(letter,h2_group)!=-1) h2();
    var h3_group = "A, B, C, D, E, F, G, O, P, Q, R, S";
    if($.inArray(letter,h3_group)!=-1) h3();
    var g1_group = "K, V";
    if($.inArray(letter,g1_group)!=-1) g1();
    var g2_group = "M, X, N";
    if($.inArray(letter,g2_group)!=-1) g2();
    var g3_group = "M, X, K";
    if($.inArray(letter,g3_group)!=-1) g3();
  }
  if(text.length>0) setTimeout(function(){play_text(text);},1000);
}

///////////////
//
// Tipografia
//
//////////////
function b1(){ //Vertical bar at the beggining
  noise(0.2);
}

function b2(){ //Half-sized vertical bar at the upper beggining
  noise(0.2, 0, up, 100);
}

function b3(){ //Half-sized vertical bar at the lower beggining
  noise(0.2, 0, down, 100);
}

function b4(){ //Vertical bar at the end
  noise(0.2, 0.8);
}

function b5(){ //Half-sized vertical bar at the upper end
  noise(0.2, 0.8, up, 100);
}

function b6(){ //Half-sized vertical bar at the lower end
  noise(0.2, 0.8, down, 100);
}

function b7(){ //Vertical bar at the middle
  noise(0.2, 0.5);
}

function h1(){ //Horizontal bar at the bottom
  sine(0.8, down);
}

function h2(){ //Horizontal bar at the middle
  sine(0.8, middle);
}

function h3(){ //Horizontal bar at the top
  sine(0.8, up);
}

function g1(){
  sine(0.8,middle,down);
}

function g2(){ 
  sine(0.8,up,middle);
}

function g3(){ 
  sine(0.8,middle,up);
}
