
<div align="center">
<img src='./client/public/icon_sm.png'>

<h1>Nyla</h1>
<p>Nyla is an example instant messaging application.</p>
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
</div>

## Requirements
- <a href="https://www.mongodb.com">MongoDB</a>
- <a href="https://expressjs.com/">Express.js</a>
- <a href="https://reactjs.org/">React.js</a>
- <a href="https://nodejs.org/en/">Node.js</a>
- <a href="https://redis.com">Redis</a>
<br>

## Introduction
Nyla is a centralized instant messaging app composed by different distributed systems.

<br>

## Getting started (local development build)
To get started with the local development build (each server in single instance), set up the <b>back-end</b> (<i>MongoDB</i>, <i>Redis</i>, <i>REST-API server</i> and <i>WS server</i>) and <b>front-end </b>(<i>React Client App</i>) of the app by following the list below.

<b>Configurations files are already set for local development build.</b>

### MongoDB

### Redis

### REST-API Server (Express.js)

### WS-Server (WS.js)

### Static Web Server (React.js)

<br>

## Open-API Swagger Documentation
The API documentation is generated using Swagger, and it provides a comprehensive overview of all available endpoints, their functionality, required parameters, and expected responses. You can access the Swagger documentation by visiting http://localhost:3001/api-docs after starting the API server.

## Folder Structure
```
├── client
|   ├── public
|   └── src
|       ├── api
|       ├── components
|       |   ├── Alerts
|       |   ├── Common
|       |   ├── Icons
|       |   ├── Pages
|       |   |   ├── Account
|       |   |   ├── Chats
|       |   |   ├── Home
|       |   |   └── Users
|       |   ├── UI
|       |   |   ├── Footer
|       |   |   ├── Nav
|       |   |   └── Push
|       |   └── Ws
|       ├── styles
|       └── utils
|
├── images
|
├── server-api
|   ├── components
|   ├── controllers
|   ├── middleware
|   ├── schemas
|   |   ├── abstract
|   |   └── examples
|   └── services
|
└── server-ws
    └── services
```

<br>

## Author
- <a href="https://github.com/francescocartelli">Francesco Cartelli</a>