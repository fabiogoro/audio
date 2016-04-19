var scheme   = "wss://";
var uri      = scheme + "websocketfaye.herokuapp.com/";
var ws       = new WebSocket(uri);

ws.onmessage = function(message) {
  console.log(message.data);
  var data = JSON.parse(message.data);
  frequencies[data.frequency].gain.gain.value = data.value;
};

function send(data){
  ws.send(JSON.stringify(data));
}
