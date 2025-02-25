import { useMemo } from 'react'

function useChatName(user, users, chat) {
    const chatFull = useMemo(() => ({
        ...chat,
        chatName: chat.isGroup ? chat.name : `Chat with ${users.find(u => u.id !== user.id)?.username}`
    }), [user, users, chat])
    return chatFull
}

export default useChatName