$(document).on('touchend',start);
function start(){
  $(document).off('touchend',start);
  if (/(iPhone|iPad)/i.test(navigator.userAgent)) {
    start_web_audio();
    var dummy = audio_context.createOscillator();
    dummy.connect(audio_context.destination);
    dummy.start(0);
    dummy.disconnect();
  }
}
