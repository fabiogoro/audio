var reg = new RegExp('[0-'+FOLDERS+']')
function system_commands(data){
  if(data.text.substr(0,8) === '/samples') {
    info = data.text.split('').pop();
    if(info === 's' && folder!=0) send('/samples'+folder); 
    if(reg.test(info)) folder = info;
    return true;
  }
  if(data.text === '/speak') {
    speak_flag = !speak_flag;
    return true;
  }
  if(data.text === '/compressor') {
    destination = (destination==compressor) ? gain : compressor; 
    return true;
  }
  if(data.text === '/restart') {
    start_web_audio(); 
    return true;
  }
  if(data.text.substr(0,4) === '/bpm') {
    if(data.text.substr(4)) bpm = parseInt(data.text.substr(4));
    return true;
  }
  if(data.text.substr(0,5) === '/adsr') {
    if(data.text.substr(5)) time = parseInt(data.text.substr(5));
    else time = 0.5;
    test_adsr(time);
    return true;
  }
  if(data.text.substr(0,4) === 'sudo') {
    words = data.text.split(' ');
    if(words.length>1) pwd = words[1];
    $.get('sudo', {pwd: pwd}, function( data ) {
      if(data){
        code = '';
        for(var i=2;i<words.length;i++) code+=words[i]+' ';
        $('#messages').prepend('<p class="msg">'+code+'</p>');
      }
    });
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
