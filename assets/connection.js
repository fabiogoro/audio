var scheme   = "wss://";
var uri      = scheme + "websocketfaye.herokuapp.com/";
var ws       = new WebSocket(uri);

ws.onmessage = function(message) {
  var data = JSON.parse(message.data);
  frequencies[data.frequency].gain.gain.value = data.value;
  frequencies[data.frequency].element.css('padding', data.value*100+'%');
};

function send(data){
  ws.send(JSON.stringify(data));
}
