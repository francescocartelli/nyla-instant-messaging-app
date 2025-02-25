import { useCallback, useContext, useState } from 'react'
import { Route, Routes, useNavigate, useParams } from 'react-router-dom'

import { useInit, useStatus } from '@/hooks'

import Chat from '@/components/Chats/Chat'

import { SkeletonMessages } from '@/components/Chats/Messages'
import MessagesContainer from '@/components/Chats/MessagesContainer'

import { channelTypes, WebSocketContext } from '@/components/Ws/WsContext'

import chatAPI from '@/api/chatAPI'

import ChatEditor from './ChatEditor'
import useChatName from './useChatName'
import useMessageMapping from './useMessageMapping'

function ChatPage({ user }) {
    const { id } = useParams()

    const [chat, setChat] = useState({})
    const [users, setUsers] = useState([])

    const [chatStatus, chatStatusActions] = useStatus()
    const [userStatus, userStatusActions] = useStatus()

    const [isUnauthorized, setUnauthorized] = useState(false)

    const navigate = useNavigate()

    const onOpenChatEditor = useCallback(() => navigate(`/chats/${id}/editor`), [navigate, id])
    const onCloseChatEditor = useCallback(() => navigate(`/chats/${id}`), [navigate, id])
    const onDeleteChat = useCallback(() => navigate('/chats'), [navigate])

    const initCallback = useCallback(done => {
        const controller = new AbortController()

        setUnauthorized(false)

        chatAPI.getChat(id).then(res => res.json())
            .then(chat => { setChat(chat); chatStatusActions.setReady() })
            .catch(err => { setUnauthorized(err.status === 401); chatStatusActions.setError() })
        chatAPI.getChatUsers(id).then(res => res.json())
            .then(users => { setUsers(users); userStatusActions.setReady() })
            .catch(userStatusActions.setError)

        done()

        return () => controller?.abort()
    }, [id, chatStatusActions, userStatusActions])
    useInit(initCallback)

    const fullChat = useChatName(user, users, chat)
    const messageMapping = useMessageMapping(users, user)

    const getMessages = useCallback(cur => chatAPI.getMessages(id, cur).then(res => res.json()), [id])
    const sendMessage = useCallback(({ content }) => chatAPI.sendMessage(id, { content }).then(res => res.json()), [id])
    const deleteMessage = useCallback(message => chatAPI.deleteMessage(id, message.id), [id])

    /* get messages async and create ws events handlers */
    const [subscribe,] = useContext(WebSocketContext)

    const onDeleteChatSubscription = callback => subscribe(channelTypes.deleteChat(id), callback)
    const onCreateMessageSubscription = callback => subscribe(channelTypes.createMessageInChat(id), callback)
    const onDeleteMessageSubscription = callback => subscribe(channelTypes.deleteMessageInChat(id), callback)

    return <div className="d-flex flex-column flex-grow-1 align-self-stretch mt-2 gap-3">
        <Routes>
            <Route path='/editor' element={<ChatEditor id={id} user={user} chat={chat} setChat={setChat} users={users} areUsersLoading={userStatus.isLoading} setUsers={setUsers} close={onCloseChatEditor} />} />
            <Route index element={
                <>
                    <Chat chat={fullChat} chatStatus={chatStatus} isUnauthorized={isUnauthorized}
                        onOpenChatEditor={onOpenChatEditor}
                        onChatDelete={onDeleteChat}
                        onDeleteChatSubscription={onDeleteChatSubscription} />
                    {messageMapping ? <MessagesContainer userId={user.id} isGroup={chat.isGroup} messageMapping={messageMapping}
                        onCreateMessageSubscription={onCreateMessageSubscription}
                        onDeleteMessageSubscription={onDeleteMessageSubscription}
                        getMessages={getMessages}
                        sendMessage={sendMessage}
                        deleteMessage={deleteMessage}
                    /> : <SkeletonMessages />}
                </>}
            />
        </Routes>
    </div>
}

export default ChatPage
