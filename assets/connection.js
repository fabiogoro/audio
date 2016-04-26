var scheme   = "wss://";
var uri      = scheme + "websocketfaye.herokuapp.com/";
var ws       = new WebSocket(uri);

ws.onmessage = function(message) {
  var data = JSON.parse(message.data);
  $('#messages').prepend('<p class="msg">'+data.text+'</p>');
  var buffer = data.text.toLowerCase().replace(/[^a-z]+/g, '');
  play(buffer);
};

function send(data){
  ws.send(JSON.stringify(data));
}
