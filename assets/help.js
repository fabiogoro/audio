$(function() {
  $('#slider').slider({
    step: 0.01,
    min: 0,
    max: 1,
    value: 1
  });
});

$('#slider').on('slidechange', function() {
  master_gain.gain.value = $('#slider').slider('value');
});

function quit_help(){
  $('#main').show();
  $('#main-help').hide();
  $('#main-config').hide();
  $('#close').hide();
}

function help(){
  $('#main').hide();
  $('#main-help').show();
  $('#close').show();
}

function config(){
  $('#main').hide();
  $('#main-config').show();
  $('#close').show();
}


function caps(){
  $('#lowercase').toggle();
  $('#uppercase').toggle();
}

function number_keys(){
  $('#letters').toggle();
  $('#numbers').toggle();
  $('#commands').hide();
  $('.fa-arrow-circle-o-up').toggle();
  $('#cmd_key').toggle();
  $('#number_key').html($('#number_key').html() == '123' ? 'abc' : '123');
}

function cmd_keys(){
  $('#letters').toggle();
  $('#numbers').hide();
  $('#commands').toggle();
  $('.fa-arrow-circle-o-up').toggle();
  $('#number_key').toggle();
  $('#cmd_key').html($('#cmd_key').html() == 'cmd' ? 'abc' : 'cmd');
}
