var scheme   = "wss://";
var uri      = scheme + "websocketfaye.herokuapp.com/";
var ws       = new WebSocket(uri);

var id = 0;
var folder = 0;

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
      if(data.text.toLowerCase() === 'stop!' || data.text.toLowerCase() === 'basta!') buffer = []; else {
        var text = data.text.split('');
        buffer.push(text);
        play(buffer.length-1);
      }
    }
    $('#messages p:nth-child(25)').remove();
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
