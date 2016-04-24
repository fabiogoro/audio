//querty 
//trabalho desenvolvido a partir de samples retirados da leitura de Hroldo de campos do poema galáxias, 
// Dezembro de 2014
//por Ariane Stolfi

//não é compatível com todos browsers

//fique a vontade pra copiar o codigo
//direitos autorais dos samples e video pertencem aos seus respectivos autores

//work in progress
var sample = {};
var audio_context = new (window.AudioContext || window.webkitAudioContext)();

function chat(event) {
  if(event.keyCode===13){
    var text = $('#chat').val();
    $('#chat').val('');
    send({som: text, time: new Date().getTime()});
  }
};

$(function(){
  load('a');
  load('b');
  load('c');
  load('d');
  load('e');
  load('f');
  load('g');
  load('h');
  load('i');
  load('j');
  load('k');
  load('l');
  load('m');
  load('n');
  load('o');
  load('p');
  load('q');
  load('r');
  load('s');
  load('t');
  load('u');
  load('v');
  load('w');
  load('x');
  load('y');
  load('z');
});
  
function play(buffer){
  if(buffer){
    var source = audio_context.createBufferSource();
    source.buffer = sample[buffer[0]];
    source.connect(audio_context.destination);
    source.onended = function(){buffer = buffer.slice(1,buffer.length);play(buffer);};
    source.start();
  }
}

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

