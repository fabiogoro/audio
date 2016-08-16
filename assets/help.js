function quit_help(){
  $('#main').show();
  $('#main-help').hide();
  $('#close').hide();
}

function help(){
  $('#main').hide();
  $('#main-help').show();
  $('#close').show();
}

function caps(){
  $('#lowercase').toggle();
  $('#uppercase').toggle();
}

function number_keys(){
  $('#letters').toggle();
  $('#numbers').toggle();
}
