var scheme   = "wss://";
var uri      = scheme + "websocketfaye.herokuapp.com/";
var ws       = new WebSocket(uri);

var id = 0;
var playing = [];
ws.onmessage = function(message) {
  var data = JSON.parse(message.data);
  if(!data.touch) {
    $('#messages').prepend('<p class="msg '+data.text+' color'+id%4+'">'+data.text+'</p>');
    id += 1;
  }
  if(data.text.toLowerCase() === 'stop!' || data.text.toLowerCase() === 'basta!') buffer = []; else {
    var text = data.text.split('');
    buffer.push(text);
    playing.push(data.text);
    $('.'+data.text).addClass('on');
    play(buffer.length-1);
  }
};

function send(data, touch){
  if(!touch) touch=0;
  console.log(touch);
  ws.send(JSON.stringify({text: data, touch: touch}));
}
