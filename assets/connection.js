var pubnub = PUBNUB({
    subscribe_key: 'sub-c-6f08dafe-ef69-11e5-872f-02ee2ddab7fe',
    publish_key: 'pub-c-d499c43e-d44f-4daf-b7af-23414ef0019a'
});

pubnub.subscribe({
  channel : "banda",
  message : {text: '/samples', touch: 0},
  callback: function(message) {
    var data = message;
    system_commands(data);
  },
  error: function(err) {
    console.log(err);
  }
});

var id = 0;
var folder = 0;
var record;
var load_flag = 1;

function send(data, touch){
  if(!touch) touch=0;
  pubnub.publish({
    channel: 'banda',
    message: {text: data, touch: touch},
  });
}

function loaded(){
  if(load_flag){
    pubnub.subscribe({
      channel : "banda",
      message : {text: '/samples', touch: 0},
      callback: function(message) {
        var data = message;
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
        if(!record) $('#messages p:nth-child(100)').remove();
        var data = message;
        system_commands(data);
      },
    });

    $('#main').show(500);
    $('#loading').hide(500);
    load_flag = 0;
  }
}

