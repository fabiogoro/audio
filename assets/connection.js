var scheme   = "wss://";
var uri      = scheme + "websocketfaye.herokuapp.com/";
var ws       = new WebSocket(uri);

var id = 0;
var folder = 0;
var record;

function send(data, touch){
  if(!touch) touch=0;
  ws.send(JSON.stringify({text: data, touch: touch}));
}

ws.onmessage = function(message) {
  var data = JSON.parse(message.data);
  sample_command(data);
};

ws.onopen = function(message) {
  send('/samples');
};

function loaded(){
  ws.onmessage = function(message) {
    var data = JSON.parse(message.data);
    if(!sample_command(data)) {
      if(!data.touch) {
        $('#messages').prepend('<p class="msg color'+id%4+'">'+data.text+'</p>');
        id += 1;
      }
      if(!other_commands(data.text.toLowerCase())) {
        var text = data.text.split('');
        buffer.push(text);
        play(buffer.length-1);
      }
    }
    if(!record) $('#messages p:nth-child(25)').remove();
  };

  $('#main').show(500);
  $('#loading').hide(500);
}

function sample_command(data){
  if(data.text.substr(0,8) === '/samples') {
    info = data.text.split('').pop();
    switch(info){
      case 's': if(folder!=0) send('/samples'+folder); break;
      case '0': case '1': case '2': 
        folder = info;
    }
    return true;
  }
  return false;
}

function other_commands(text){
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
