var uri      = SERVER;
var ws       = new WebSocket(uri);

var id = 0;
var folder = 0;
var record;
var load_flag = 1;
var speak_flag = false;

function send(data, touch){
  if(!touch) touch=0;
  ws.send(JSON.stringify({text: data, touch: touch}));
}

// When opening connection, ask for the active folder.
ws.onopen = function(message) {
  send('/samples');
};

// While loading samples, receive only system commands.
ws.onmessage = function(message) {
  var data = JSON.parse(message.data);
  system_commands(data);
};

// When loading ends, redefine onmessage function.
function loaded(){
  if(load_flag){ // Forcing this to be called only once.
    ws.onmessage = on_message; // Function on_message is called everytime a message is received.
    $('#main').show(500);
    $('#loading').hide(500);
    load_flag = 0;
  }
}

function on_message(message) {
  var data = JSON.parse(message.data);
  if(!system_commands(data)) { // If message contains a system command, don't print and don't play it.
    if(!data.touch) { // If touched, don't print message into screen again.
      var p = $('<p />',{class: 'msg from_chat', text: data.text});
      $('#messages').prepend(p);
    }
    if(!simple_commands(data.text.toLowerCase())) { // If message is a simple command, don't play it.
      var text = data.text.split('');
      buffer.push(text);
      var message_gain = audio_context.createGain(); // Creating the gain node that has lower value in long messages.
      message_gain.gain.value = 1/text.length;
      message_gain.connect(destination);
      play(buffer.length-1,message_gain);
    }
  }
  if(!record) $('#messages p:nth-child(100)').remove(); // If record is off, limit 100 messages.
};


