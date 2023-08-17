const { useEffect, createContext, useRef } = require("react")

const channelTypes = {
    createMessageInChat: (idChat) => { return `MESSAGE_CREATE_${idChat}` },
    deleteMessageInChat: (idChat) => { return `MESSAGE_DELETE_${idChat}` },
    deleteChat: (idChat) => { return `CHAT_DELETE_${idChat}` },
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
        //console.log("useEffect: WebSocketProvider")
        if (!user) {
            // if user is absent ws cannot be opened
            // if ws is open a logout was performed => close ws
            ws.current?.close()
            return
        }
        ws.current = new WebSocket(process.env.REACT_APP_WSS_URL)
        ws.current.onopen = () => { console.log('WS open') }
        ws.current.onclose = () => { console.log('WS close') }
        ws.current.onmessage = (message) => {
            const { type, data } = JSON.parse(message.data)
            const chatChannel = `${type}_${data.chat}`
            // lookup for a listening (is rendered) chat on message create or delete
            // if no chat is listening (is rendered) send message into generic channel for push mechanism
            if (channels.current[chatChannel]) channels.current[chatChannel](data)
            else channels.current[type]?.(data)
        }
        return () => { ws.current.close() }
    }, [user])

    return (
        <WebSocketContext.Provider value={[subscribe, unsubscribe]}>
            {children}
        </WebSocketContext.Provider>
    )
}

export { WebSocketContext, WebSocketProvider, channelTypes }