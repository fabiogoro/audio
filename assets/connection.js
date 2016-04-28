var scheme   = "wss://";
var uri      = scheme + "websocketfaye.herokuapp.com/";
var ws       = new WebSocket(uri);

var color = 0;
ws.onmessage = function(message) {
  var data = JSON.parse(message.data);
  if(data.show) {
    $('#messages').prepend('<p class="msg color'+color+'">'+data.text+'</p>');
    color = (color+1)%4;
  }
  if(data.text === 'stop!') buffer = []; else {
    var text = data.text.toLowerCase().replace(/[^a-z.]+/g, '').split('');
    buffer.push(text);
    play(buffer.length-1);
  }
};

function send(data, show=0){
  ws.send(JSON.stringify({text: data, show: show}));
}
