var reg = new RegExp('[0-'+FOLDERS+']')
function system_commands(data){
  if(data.text.substr(0,8) === '/samples') {
    info = data.text.split('').pop();
    if(info === 's' && folder!=0) send('/samples'+folder); 
    if(reg.test(info)) folder = info;
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
