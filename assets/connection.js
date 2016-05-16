var scheme   = "wss://";
var uri      = scheme + "websocketfaye.herokuapp.com/";
var ws       = new WebSocket(uri);

var id = 0;
ws.onmessage = function(message) {
  var data = JSON.parse(message.data);
  if(!data.touch) {
    $('#messages').prepend('<p class="msg color'+id%4+'">'+data.text+'</p>');
    id += 1;
  }
  if(data.text.toLowerCase() === 'stop!' || data.text.toLowerCase() === 'basta!') buffer = []; else {
    var text = data.text.split('');
    buffer.push(text);
    play(buffer.length-1);
  }
};

function send(data, touch){
  if(!touch) touch=0;
  ws.send(JSON.stringify({text: data, touch: touch}));
}
