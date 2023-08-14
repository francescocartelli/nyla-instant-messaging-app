const { useEffect, createContext, useRef } = require("react")

const channelTypes = {
    createMessageInChat: (idChat) => { return `MESSAGE_CREATE_${idChat}` },
    deleteMessageInChat: (idChat) => { return `MESSAGE_DELETE_${idChat}` },
    createMessage: () => { return 'MESSAGE_CREATE' }
}

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
            const { type, data } = JSON.parse(message.data)
            const chatChannel = `${type}_${data.chat}`
            // lookup for a listening (is rendered) chat on message create or delete
            if (channels.current[chatChannel]) channels.current[chatChannel](data)
            else {
                // if no chat is listening (is rendered) send message into generic channel for push mechanism
                channels.current[type]?.(data)
            }
        }

        return () => { ws.current.close() }
    }, [])

    return (
        <WebSocketContext.Provider value={[subscribe, unsubscribe]}>
            {children}
        </WebSocketContext.Provider>
    )
}

export { WebSocketContext, WebSocketProvider, channelTypes }