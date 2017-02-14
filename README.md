# Banda Aberta

This is a chat like application where users create sounds meanwhile communicate. It was thought for open presentations or performances.

# How to run

This project is written in plain HTML/Javascript.
To run just open the index page in your browser.
For more information about the server visit the other project (https://github.com/fabiogoro/bandaserver)

# Project Structure

* chat.html is the main page.
* assets folder keeps all javascript. Some important js files:
  * connection.js do pub/sub communication. It redirects the messages to the proper function.
  * sounds.js takes care of loading and playing all samples.
  * chat.js reads inputs from the chat page.
  * config.js defines where is the server running and how many samples collections are being used.
* samples are distributed in folders, each folder is a collection and every file has the name of the ascii character it should represent.
