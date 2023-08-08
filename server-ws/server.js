const WebSocket = require('ws')

require('dotenv').config()

const wss = new WebSocket.Server({ port: process.env.SERVER_PORT })

wss.on('connection', (ws) => {
    console.log('A new client has connected.')

    // Event handler for closing connections
    ws.on('close', () => {
        console.log('A client has disconnected.')
    })
})

console.log(`WebSocket server running on port ${process.env.SERVER_PORT}.`)
