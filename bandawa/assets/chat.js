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
  buffer.push(text);
  meSpeak.speak(data.text, {
    amplitude: 100,
    wordgap: 1,
    pitch: 60,
    speed: 120,
    variant: "f2"
  });
  play(buffer.length-1);
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
