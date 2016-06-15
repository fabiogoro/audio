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
  system_commands(data);
};

ws.onopen = function(message) {
  send('/samples');
};

function loaded(){
  ws.onmessage = function(message) {
    var data = JSON.parse(message.data);
    if(!system_commands(data)) {
      if(!data.touch) {
        $('#messages').prepend('<p class="msg color'+id%4+'">'+data.text+'</p>');
        id += 1;
      }
      if(!simple_commands(data.text.toLowerCase())) {
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

