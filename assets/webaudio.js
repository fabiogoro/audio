var audio_context = new (window.AudioContext || window.webkitAudioContext)();

var frequencies = [{ frequency: 50, gain: audio_context.createGain() },
             { frequency: 150, gain: audio_context.createGain() },
             { frequency: 250, gain: audio_context.createGain() },
             { frequency: 350, gain: audio_context.createGain() },
             { frequency: 450, gain: audio_context.createGain() },
             { frequency: 550, gain: audio_context.createGain() },
             { frequency: 650, gain: audio_context.createGain() },
             { frequency: 750, gain: audio_context.createGain() },
             { frequency: 850, gain: audio_context.createGain() },
             { frequency: 1050, gain: audio_context.createGain() },
             { frequency: 1150, gain: audio_context.createGain() },
             { frequency: 1250, gain: audio_context.createGain() },
             { frequency: 1350, gain: audio_context.createGain() },
             { frequency: 1450, gain: audio_context.createGain() },
             { frequency: 1550, gain: audio_context.createGain() },
             { frequency: 1650, gain: audio_context.createGain() },
             { frequency: 1750, gain: audio_context.createGain() },
             { frequency: 1850, gain: audio_context.createGain() },
             { frequency: 1950, gain: audio_context.createGain() },
             { frequency: 2050, gain: audio_context.createGain() }];

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
