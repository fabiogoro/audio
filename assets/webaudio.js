// Chat bandas
// Samples taken from Haroldo de Campos poem 'Galáxias'. 
// April 2016
// By Ariane Stolfi and Fábio Goródscy

// Tested on Chromium 49 on Ubuntu and Chrome, Opera and Firefox on Android. 
// Might not run in other browsers.

// Feel free to copy the code.
// Samples copyright belongs to its creators.

var sample = {};
var audio_context = new (window.AudioContext || window.webkitAudioContext)();

function chat(event) {
  if(event.keyCode===13){
    var text = $('#chat').val();
    $('#chat').val('');
    send({som: text});
  }
};

$(function(){
  var files = 'abcdefghijklmnopqrstuvwxyz';
  for(var i=0; i<files.length; i++) load(files[i]);
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

var frequencies = [{ frequency: 50, gain: audio_context.createGain(), element: $('#a0') },
             { frequency: 150, gain: audio_context.createGain(), element: $('#a1')  },
             { frequency: 250, gain: audio_context.createGain(), element: $('#a2')  },
             { frequency: 350, gain: audio_context.createGain(), element: $('#a3')  },
             { frequency: 450, gain: audio_context.createGain(), element: $('#a4')  },
             { frequency: 570, gain: audio_context.createGain(), element: $('#a5')  },
             { frequency: 700, gain: audio_context.createGain(), element: $('#a6')  },
             { frequency: 840, gain: audio_context.createGain(), element: $('#a7')  },
             { frequency: 1000, gain: audio_context.createGain(), element: $('#a8')  },
             { frequency: 1170, gain: audio_context.createGain(), element: $('#a9')  },
             { frequency: 1370, gain: audio_context.createGain(), element: $('#a10')  },
             { frequency: 1600, gain: audio_context.createGain(), element: $('#a11')  },
             { frequency: 1850, gain: audio_context.createGain(), element: $('#a12')  },
             { frequency: 2150, gain: audio_context.createGain(), element: $('#a13')  },
             { frequency: 2500, gain: audio_context.createGain(), element: $('#a14')  },
             { frequency: 2900, gain: audio_context.createGain(), element: $('#a15')  },
             { frequency: 3400, gain: audio_context.createGain(), element: $('#a16')  },
             { frequency: 4000, gain: audio_context.createGain(), element: $('#a17')  },
             { frequency: 4800, gain: audio_context.createGain(), element: $('#a18')  },
             { frequency: 5800, gain: audio_context.createGain(), element: $('#a19')  }];

$(function(){
  function setup(frequency) {
    var oscillator = audio_context.createOscillator();
    oscillator.connect(frequency.gain);
    frequency.gain.gain.value = 0;

    oscillator.type = 'sine';
    oscillator.frequency.value = frequency.frequency;
    oscillator.start(0);

    frequency.gain.connect(audio_context.destination);
  }
  for(var i=0;i<frequencies.length;i++){
    setup(frequencies[i]);
  }
});

var mouse_pos_value;
var my_frequency;

my_frequency = get_random_frequency();

$(document).mousemove(function(mouse) {
  send({ x: mouse.pageX/$(window).width(), y: mouse.pageY/$(window).height(), frequency: my_frequency});
});

function get_random_frequency(){
  return Math.floor(Math.random() * frequencies.length);
}
