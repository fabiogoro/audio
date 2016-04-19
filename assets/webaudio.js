var audio_context = new (window.AudioContext || window.webkitAudioContext)();

var frequencies = [{ frequency: 50, gain: audio_context.createGain(), element: $('#a0') },
             { frequency: 150, gain: audio_context.createGain(), element: $('#a1')  },
             { frequency: 250, gain: audio_context.createGain(), element: $('#a2')  },
             { frequency: 350, gain: audio_context.createGain(), element: $('#a3')  },
             { frequency: 450, gain: audio_context.createGain(), element: $('#a4')  },
             { frequency: 550, gain: audio_context.createGain(), element: $('#a5')  },
             { frequency: 650, gain: audio_context.createGain(), element: $('#a6')  },
             { frequency: 750, gain: audio_context.createGain(), element: $('#a7')  },
             { frequency: 850, gain: audio_context.createGain(), element: $('#a8')  },
             { frequency: 1050, gain: audio_context.createGain(), element: $('#a9')  },
             { frequency: 1150, gain: audio_context.createGain(), element: $('#a10')  },
             { frequency: 1250, gain: audio_context.createGain(), element: $('#a11')  },
             { frequency: 1350, gain: audio_context.createGain(), element: $('#a12')  },
             { frequency: 1450, gain: audio_context.createGain(), element: $('#a13')  },
             { frequency: 1550, gain: audio_context.createGain(), element: $('#a14')  },
             { frequency: 1650, gain: audio_context.createGain(), element: $('#a15')  },
             { frequency: 1750, gain: audio_context.createGain(), element: $('#a16')  },
             { frequency: 1850, gain: audio_context.createGain(), element: $('#a17')  },
             { frequency: 1950, gain: audio_context.createGain(), element: $('#a18')  },
             { frequency: 2050, gain: audio_context.createGain(), element: $('#a19')  }];

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
