# Open Band / Banda Aberta

This project consists in an application that allow people to create performances by their own, using their devices.

Esse projeto consiste em uma aplicação web que permite pessoas criarem performances por si mesmas, usando seus celulares.

# How to use / Como usar

There is a text field in the page. Write something there and press enter. Everybody that is connected to the page
will recieve it. Messages are loaded in a buffer that play sounds. Each character in a message plays a unique sound.
There are special messages like:
* Stop!: When you send 'stop!' every sound that was in the buffer gets out.
* /samples0: When you send '/samples0' every connected device change the sample folder it's using. 
In case of samples0 the folder is going be samples, if it is samples1 the folder is samples_1.

Há um campo de texto na página. Escreva algo e pressione enter. Todos que estão conectados receberão a mensagem.
Mensagens são carregadas em um buffer que toca sons. Cada caracter toca um som próprio.
Há algumas mensagens especiais, como:
* Basta!: Quando 'basta!' é enviado o buffer é esvaziado.
* /samples0: Quando '/samples0' é enviado todo dispositivo conectado altera a pasta de samples que está utilizando.
Se for samples0 a pasta atual será samples. Se for samples1 a pasta atual sera samples_1.

# How to run / Como Rodar

This project is written in plain HTML/Javascript.
To run this project just open it in your browser.

O projeto é escrito apenas em HTML/Javascript.
Para rodá-lo apenas abra em seu browser.

# Dependencies / Dependências

* WebAudio
* JQuery
