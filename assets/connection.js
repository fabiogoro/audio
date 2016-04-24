var scheme   = "wss://";
var uri      = scheme + "websocketfaye.herokuapp.com/";
var ws       = new WebSocket(uri);

ws.onmessage = function(message) {
  var data = JSON.parse(message.data);
  if(data.som){
    $('#messages').prepend(data.som+'</br>');
    var buffer = data.som.toLowerCase().replace(/[^a-z]+/g, '');
    play(buffer);
  }
  if(data.frequency){
    frequencies[data.frequency].gain.gain.value = (data.x + data.y)/2;
    frequencies[data.frequency].element.css('padding', data.y*100+'% '+data.x*100+'%');
  }
};

function send(data){
  ws.send(JSON.stringify(data));
}
