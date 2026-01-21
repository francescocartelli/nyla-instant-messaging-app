import { createContext } from 'react'

import useWS from '@/hooks/useWS'

const channelTypes = {
    createMessageInChat: idChat => `MESSAGE_CREATE_${idChat}`,
    updatedMessageInChat: idChat => `MESSAGE_UPDATE_${idChat}`,
    deleteMessageInChat: idChat => `MESSAGE_DELETE_${idChat}`,
    deleteChat: idChat => `CHAT_DELETE_${idChat}`,
    createMessage: () => 'MESSAGE_CREATE'
}

const WebSocketContext = createContext()

function WebSocketProvider({ children, user }) {
    const [subscribe, unsubscribe] = useWS(user)

    return <WebSocketContext.Provider value={[subscribe, unsubscribe]}>
        {children}
    </WebSocketContext.Provider>
}

export { WebSocketContext, WebSocketProvider, channelTypes }