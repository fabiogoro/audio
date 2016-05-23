# Open Band / Banda Aberta

This project consists in an application that allow people to create performances by their own, using their devices.

Esse projeto consiste em uma aplicação web que permite pessoas criarem performances por si mesmas, usando seus celulares.

# How to use / Como usar

There are 3 pages:
* One of them is just for showing the messages and the waveform: live.html.
* One is the admin interface, where you can change sample folder: admin.html.
* The last one is the application itself explained here above: index.html.
There is a text field in the page. Write something there and press enter. Everybody that is connected to the page
will recieve it. Messages are loaded in a buffer that play sounds. Each character in a message plays a unique sound.
There are special messages, like:
* Stop!: When you send 'stop!' every sound that was in the buffer gets out.

Há 3 páginas:
* Uma é apenas para mostrar as mensagens e a forma de onda: live.html.
* Outra é a interface de administrador, onde é possível trocar de pastas: admin.html.
* A última é a aplicação padrão, descrita aqui abaixo: index.html.
Há um campo de texto na página. Escreva algo e pressione enter. Todos que estão conectados receberão a mensagem.
Mensagens são carregadas em um buffer que toca sons. Cada caracter toca um som próprio.
Há algumas mensagens especiais, como:
* Basta!: Quando 'basta!' é enviado o buffer é esvaziado.

# How to run / Como Rodar

This project is written in plain HTML/Javascript.
To run this project just open it in your browser.
For more information about the server visit the other project (https://github.com/fabiogoro/bandaserver)

O projeto é escrito apenas em HTML/Javascript.
Para rodá-lo apenas abra em seu browser.
Para mais informações sobre o servidor, visite (https://github.com/fabiogoro/bandaserver)

# Dependencies / Dependências

* WebAudio
* JQuery
* The server: https://github.com/fabiogoro/bandaserver
