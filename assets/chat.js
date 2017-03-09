// When enter is pressed, clear textbox and send message.
function chat(event) {
  if(event.keyCode===13){
    var text = $('#chat').val();
    $('#chat').val('');
    if(text != '') send(text,0); // Don't send empty messages...
  }
};

// When touched, turn on touch and send message.
$(document).on('click touchend', '.msg.from_chat', function(){
  var text = $(this).text();
  var touch = 1;
  send(text, touch);
});


// TODO
function pista(event, pasta) {
  if(event.keyCode===13){
    var divmsg = '#chat' + pasta;  
    var text = $(divmsg).val();
    $(divmsg).val('');
    if(text != '') send(text,0);
  }
};
