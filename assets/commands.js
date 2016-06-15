function system_commands(data){
  if(data.text.substr(0,8) === '/samples') {
    info = data.text.split('').pop();
    switch(info){
      case 's': if(folder!=0) send('/samples'+folder); break;
      case '0': case '1': case '2': 
        folder = info;
    }
    return true;
  }
  if(data.text === '/compressor') {
    destination = (destination==compressor) ? gain : compressor; 
    return true;
  }
  return false;
}

function simple_commands(text){
  switch(text){
    case 'stop!':
    case 'basta!':
      buffer = []; 
      return true;
    case 'quieto!':
      gain.gain.linearRampToValueAtTime(0, audio_context.currentTime + 2);
      return true;
    case 'som!':
      gain.gain.linearRampToValueAtTime(1, audio_context.currentTime + 2); 
      return true;
    default:
      return false;
  }
}
