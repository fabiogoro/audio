var mouse_pos_value;
var my_frequency;

my_frequency = get_random_frequency();

$(document).mousemove(function(document) {
  mouse_pos_value = get_mouse_pos_value(document);
  send({ value: mouse_pos_value, frequency: my_frequency});
});

function get_mouse_pos_value(element){
  width_value = element.pageX/$(window).width();
  height_value = element.pageY/$(window).height();
  return (width_value+height_value)/2;
}

function get_random_frequency(){
  return Math.floor(Math.random() * frequencies.length);
}
