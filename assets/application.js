var mouse_pos_value;
var my_frequency;

my_frequency = get_random_frequency();

$(document).mousemove(function(mouse) {
  send({ x: mouse.pageX/$(window).width(), y: mouse.pageY/$(window).height(), frequency: my_frequency});
});

function get_random_frequency(){
  return Math.floor(Math.random() * frequencies.length);
}
