var started = 0;

window.addEventListener('touchend',start,false);
function start(){
  if (/(iPhone|iPad)/i.test(navigator.userAgent)) {
    if(!started) {
      audio_context = new (window.AudioContext || window.webkitAudioContext)(); 
      started=1;
      var dummy = audio_context.createOscillator();
      dummy.connect(audio_context.destination);
      dummy.start(0);
      dummy.disconnect();
    }
  }
}
