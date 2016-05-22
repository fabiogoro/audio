function chat(event) {
  if(event.keyCode===13){
    var text = $('#chat').val();
    $('#chat').val('');
    if(text != '') send(text,0);
  }
};

$(document).on('click touchend', '.msg', function(){
  var text = $(this).text();
  send(text, 1);
});

