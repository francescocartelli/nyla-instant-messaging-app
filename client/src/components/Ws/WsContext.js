const { useState, useEffect, createContext, useContext, useRef } = require("react")

const WebSocketContext = createContext()

function WebSocketProvider({ children, user }) {
    const ws = useRef(null)
    const channels = useRef({})

    const subscribe = (channel, callback) => {
        channels.current[channel] = callback
    }

    const unsubscribe = (channel) => {
        delete channels.current[channel]
    }

    useEffect(() => {
        if (user) return

        ws.current = new WebSocket(process.env.REACT_APP_WSS_URL)
        ws.current.onopen = () => { console.log('WebSocket connection established.') }
        ws.current.onclose = () => { console.log('WebSocket connection closed.') }
        ws.current.onmessage = (message) => {
            const data = JSON.parse(message.data)
            if (channels.current[data.chat]) {
                channels.current[data.chat](data)
            }
        }

        return () => {
            ws.current.close()
        }
    }, [])

    return (
        <WebSocketContext.Provider value={[subscribe, unsubscribe]}>
            {children}
        </WebSocketContext.Provider>
    )
}

export { WebSocketContext, WebSocketProvider }