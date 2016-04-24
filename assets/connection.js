var scheme   = "wss://";
var uri      = scheme + "websocketfaye.herokuapp.com/";
var ws       = new WebSocket(uri);

ws.onmessage = function(message) {
  var data = JSON.parse(message.data);
  $('#messages').prepend(data.som+'</br>');
  var buffer = data.som.toLowerCase().replace(/[^a-z]+/g, '');
  play(buffer);
  //window.setTimeout(play,data.time-initial_time-performance.now()+1000);
};

function send(data){
  ws.send(JSON.stringify(data));
}

var initial_time;

$(function (){
  var now = new Date().getTime();
  initial_time = now - performance.now();
});
