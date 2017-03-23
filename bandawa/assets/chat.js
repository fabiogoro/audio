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
var bandpass;
var noise_node;
var noise_out;
var oscillator_buffer = [];
var num_oscillators = 60;
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

  var bufferSize = 60 * audio_context.sampleRate;
  var noise_buffer = audio_context.createBuffer(1, bufferSize, audio_context.sampleRate);
  var output = noise_buffer.getChannelData(0);
  for (var i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  bandpass = audio_context.createBiquadFilter();
  bandpass.type = "bandpass";

  noise_node = audio_context.createBufferSource();
  noise_node.buffer = noise_buffer;
  noise_node.loop = true;
  noise_node.start(0);
  noise_node.connect(bandpass);
  noise_out = new ADSR();
  bandpass.connect(noise_out.node);
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


function noise(duration, xposition, yposition, height){
  if(xposition===undefined) xposition = 0;
  if(yposition===undefined) yposition = 10000;
  if(height===undefined) height = 20000;
  bandpass.frequency.value = yposition;
  bandpass.Q.value = 20/height;
  noise_out.play(xposition,0.01*duration,0.01*duration,0.5*duration,0.48*duration,1,0.8);
}

var oscillator_position = 0;
function sine(duration, yposition, direction, xposition){
  if(duration===undefined) duration = 1;
  if(yposition===undefined) yposition = 100;
  if(direction===undefined) direction = yposition;
  if(xposition===undefined) xposition = 0.1;
  var sine = oscillator_buffer[oscillator_position][0];
  var out = oscillator_buffer[oscillator_position][1];
  oscillator_position = (oscillator_position+1)%num_oscillators;
  sine.frequency.value = yposition;
  
  var delta = direction - yposition;
  var steps = 10;
  var increase = delta / steps; 
  var currfreq = yposition;
  //sine.frequency.exponentialRampToValueAtTime(direction, audio_context.currentTime+0.1);
  
  for (i = 0; i < steps; i++) {
  currfreq = currfreq + increase;
  sine.frequency.linearRampToValueAtTime(currfreq, audio_context.currentTime+duration);
  }


  //sine.frequency.linearRampToValueAtTime(direction, audio_context.currentTime+duration);
  //sine.frequency.linearRampToValueAtTime(440 * Math.pow(2, 1/12),audioCtx.currentTime + 1);


  out.play(xposition,0.1*duration,0.1*duration,0.7*duration,0.1*duration,1,0.8);



}

var floor = 100;
var down = 200;
var middle = 1000;
var up = 5000;

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

//function t(){// T
//  var matrix = [[1,1,1,1,1],
//                [0,0,1,0,0],
//                [0,0,1,0,0],
//                [0,0,1,0,0],
//                [0,0,1,0,0]];
//  play_matrix(matrix);
//}

function play_text(text){
  letter = text.shift();
  switch(letter){
    //case 'A': a(); break;
    //case 'X': x(); break;
    //case 'T': t(); break;
    //case 'F': f(); break;
    //case 'H': h(); break;
    //case 'V': v(); break;
    //case 'L': l(); break;
    default:
    
    //verticals
    var b1_group = ", B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, U, W, 1, 6, 8, 0, b, h, k, l";
    if($.inArray(letter,b1_group)!=-1) b1();
    var b2_group = "5";
    if($.inArray(letter,b2_group)!=-1) b2();
    var b3_group = "A, Z, 2, J, a, c, d, e, f, g, i, m, n, o, p, q, r, u, 6";
    if($.inArray(letter,b3_group)!=-1) b3();
    var b4_group = "A, H, J, M, N, O, Q, U, W, V, Y, d, 8, 9, 0";
    if($.inArray(letter,b4_group)!=-1) b4();
    var b5_group = "P, R";
    if($.inArray(letter,b5_group)!=-1) b5();
    var b6_group = "G, a, j, g, h, j, m, n, o, p, s, u, v, w, y";
    if($.inArray(letter,b6_group)!=-1) b6();
    var b7_group = "T, t";
    if($.inArray(letter,b7_group)!=-1) b7();
    
    var b8_group = "p, y";
    if($.inArray(letter,b8_group)!=-1) b8();
    var b9_group = "g, j, q";
    if($.inArray(letter,b9_group)!=-1) b9();
    
    //horizontals
    var h1_group = "C, D, E, G, J, K, L, O, Q, c, d, e, o, p, u, _, 2, 3, 6, 8, 0";
    if($.inArray(letter,h1_group)!=-1) h1();
    var h2_group = "A, B, E, F, G, H, P, R, S, a, b, c, e, f, g, n, o, q, t, z, 3, 4, 5, 6, 8, 9";
    if($.inArray(letter,h2_group)!=-1) h2();
    var h3_group = "A, B, C, D, E, F, G, O, P, Q, R, S, T, 2, 3, 5, 7, 8, 9, 0,";
    if($.inArray(letter,h3_group)!=-1) h3();
    var h4_group = "g";
    if($.inArray(letter,h4_group)!=-1) h4();
    

    //diagonal
    var g1_group = "0, 2, 7, k, D, M, W, Z";
    if($.inArray(letter,g1_group)!=-1) g1();
    var g2_group = "X";
    if($.inArray(letter,g2_group)!=-1) g2();
    var g3_group = "f, 4, 1, 6, B, A, S, K";
    if($.inArray(letter,g3_group)!=-1) g3();
    var g4_group = "Y";
    if($.inArray(letter,g4_group)!=-1) g4();
    var g5_group = "K, Q, R, m, v, x, y, 3, w";
    if($.inArray(letter,g5_group)!=-1) g5();
    var g6_group = "a, b, d, e, g, h, k, m, p, q, r, s, w, x, z, 5, S";
    if($.inArray(letter,g6_group)!=-1) g6();
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

function b2(){ //Half-sized vertical bar with the upper beggining
  noise(0.2, 0, up, 100);
}

function b3(){ //Half-sized vertical bar with the lower beggining
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

function b8(){ //Vertical bar at lower quarter beggining
  noise(0.2, 0, floor, 100);
}

function b9() {//vertical bar at lower quarter end
  noise(0.2, 0.8, floor, 100);
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

function h0() {
  sine(0.8, floor);
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
