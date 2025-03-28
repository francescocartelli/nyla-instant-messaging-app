
<div align="center">
<img src='./images/icon_sm.png'>

<h1>Nyla</h1>
<p>Nyla is an example of an instant messaging application.</p>
<div align="center">		
<img src="https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E" href="https://www.javascript.com/">
</div>
<br>
<div align="center">
	<img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" href="https://mongodb.com">
	<img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge" href="https://expressjs.com/">
	<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" href="https://it.reactjs.org/">
	<img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" href="https://nodejs.org/">
	<img src="https://img.shields.io/badge/redis-%23DD0031.svg?&style=for-the-badge&logo=redis&logoColor=white" href="https://redis.io/">
</div>
<br>

[![GitHub stars](https://img.shields.io/github/stars/francescocartelli/nyla-instant-messaging-app.svg)](https://github.com/francescocartelli/nyla-instant-messaging-app/stargazers)&nbsp;&nbsp;&nbsp;[![GitHub forks](https://img.shields.io/github/forks/francescocartelli/nyla-instant-messaging-app.svg)](https://github.com/francescocartelli/nyla-instant-messaging-app/network)

</div>

# Requirements
- <a href="https://www.mongodb.com">MongoDB</a>
- <a href="https://expressjs.com/">Express.js</a>
- <a href="https://reactjs.org/">React.js</a>
- <a href="https://nodejs.org/en/">Node.js</a>
- <a href="https://redis.com">Redis</a>

<br>

# Architecture
Nyla is a centralized instant messaging application built with React.js front-end, Express.js back-end and MongoDB database. Real-time messaging is provided by Websockets as notification servers, coordinated using Redis message queue. The chosen architecture and overall server design allows for  horizontally scalability.
<div align="center"><img width="80%" src='./images/architecture.png'/></div>
<br>

This repository contains the implementation of the web server (client folder), REST api server (<b>server-api</b> folder) and ws server (<b>server-ws</b> folder). MongoDB and Redis can be used simply by installing the relevant software; no other configuration (other than that provided in the folders listed above) is required.

<br>


# Getting started (local development build)
To start with the local development build (each server in single instance), <b>docker-compose</b> can be used ( manual configuration is also described below).

<br>

## Using docker-compose (recommended)
1. Start <b>Docker</b> application
1. Navigate to the project root folder (where docker-compose.yaml file is located) and just run all the services using docker-compose:
   
			docker-compose up
Wait for container creations, once client development server is ready, connect to the app using your browser.

<br>

## Manual Setup
Setup <b>back-end</b> (<i>MongoDB</i>, <i>Redis</i>, <i>REST-API server</i> and <i>WS server</i>) and <b>front-end </b>(<i>React Client App</i>) of the app by following the list below.<br><br>
<b>Configurations files are already set for local development build.</b>

### MongoDB
At first, the app will start with an empty database, generated with the first write (probably a user registration). For this reason database configuration only consist in starting the MongoDB process or service.
1. Download and setup MongoDB (<a href="https://www.mongodb.com/try/download/community">here</a>). 
2. Start MongoDB as process or a service.
<br>

### Redis
1. Redis is used as message-queue for <i>API server</i> and <i>WS server</i> communication. Just download and configure Redis in the build environment (<a href="https://redis.io/download/">here</a>).
2. Start Redis server:

        % redis-server

### REST-API Server (Express.js)
1. In <b>server-api</b>, <a href="https://github.com/francescocartelli/nyla-instant-messaging-app/tree/master/server-api/.env.example">.env.example</a> file provides the basic configurations. Use it for generating a <b>.env</b> file:
   - Providing database url and name: 
  
       		DATABASE_URL=mongodb://<database_host:database_port>
			DATABASE_NAME=<your_database>

   - Providing a JWT encryption key (better if its very long and complex) for token signing:
  
        	SECRET_OR_KEY=<your_secret_or_key>
  
   - Providing Redis MQ url and port:
  
        	MQ_SERVER_URL=<redis_server_host:redis_server_port>

2. Optionally, provide your Google OAuth2 configurations once you <a href="https://support.google.com/cloud/answer/6158849">registered your application</a>. With a null `GOOGLE_CLIENT_ID` Google authentication endpoints will not be exposed:

			GOOGLE_CLIENT_ID=<your_google_client_id>
			GOOGLE_CLIENT_SECRET=<your_google_client_secret>
			GOOGLE_CALLBACK_URL=http://localhost:3001/api/authenticate/google/callback
			GOOGLE_SUCCESS_REDIRECT_URL=http://localhost:3000

3. From the <b>server-api</b> root folder, install all required modules, then run the server:
   
			server % npm install
			server % npm start

### WS-Server (WS.js)
1. In <b>server-ws</b>, <a href="https://github.com/francescocartelli/nyla-instant-messaging-app/tree/master/server-ws/.env.example">.env.example</a> file provides the basic configurations. Use it for generating a <b>.env</b> file:
   - Providing Redis MQ url and port configurations:

			MQ_SERVER_URL=<redis_server_host:redis_server_port>

	- Providinge <b>server-api</b> url:

			API_SERVER_URL=<api_server_host:api_server_port>

2. From the <b>server-ws</b> root folder, install all required modules, then run the server:
 
   		  server % npm install
		  server % npm start

### Static Web Server (React.js)
1. In <b>client</b>, <a href="https://github.com/francescocartelli/nyla-instant-messaging-app/tree/master/client/.env.example">.env.example</a> file provides the basic configurations. Use it for generating a <b>.env</b> file:
   - Providing url for react-proxy server (to <b>server-api</b>):
   
		  VITE_PROXY_URL=http://localhost:3001

   - Providing the url for ws-server:
   
		  VITE_WSS_URL=ws://<ws_server_host:ws_server_port>

2. From the <b>client</b> root folder, install the packages, then run the client:

		  client % npm install
		  client % npm start
<br><br>

# Open-API Swagger Documentation
The API documentation is generated using Swagger, and it provides a comprehensive overview of all available endpoints, their functionality, required parameters, and expected responses. You can access the Swagger documentation by visiting http://localhost:3001/api-docs after starting the API server.

<br><br>

# Main Features (Images)
### Create and track your personal chats
Create and track your personal chats and find new users.<br>
<img src="images/chats.png" width="200px">
<img src="images/users_search.png" width="200px">

### Instant messaging with group and direct chats
Instant messaging with group and direct chats with intuitive settings.<br>
  <img src="images/chat.png" width="200px">
  <img src="images/chat_setting.png" width="200px">

### Rich text messaging for expressive conversations
Emphasize your messages using Rich Text mode with ease: <b>bold</b>, <b>italic</b>, <b>headings</b>, <b>bullet lists</b> and more available with one click.<br>
  <img src="images/rich_text_message_editor.png" width="200px">
  <img src="images/rich_text_chat.png" width="200px">

### Google OAuth2 or password-based registration/authentication
Registration/authentication using Google Auth2 or standard username and password.<br>
  <img src="images/login.png" width="200px">
  <img src="images/registration.png" width="200px">

<br><br>

# Curiosity
Nyla is a short word inspired by <i>Nyarlathotep</i>, who is a fictional entity belonging to Howard Phillips Lovecraft's <i>Cthulhu Cycle</i>. Nyarlathotep acts according to the will of the Outer Gods and is their messenger.

<br><br>

# Author
- <a href="https://github.com/francescocartelli">Francesco Cartelli</a>

<br><br>

# License
This project is licensed under the MIT License, which means you're free to use, modify, and distribute the code as long as you include the original license notice.