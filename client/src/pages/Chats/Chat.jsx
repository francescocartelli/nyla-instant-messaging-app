import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { KeyFill, QuestionCircle, ThreeDotsVertical } from 'react-bootstrap-icons'
import { useNavigate, useParams } from 'react-router-dom'

import { useStatus, useInit } from '@/hooks'

import { ChatAlert } from '@/components/Chat/Chat'
import { SkeletonMessages } from '@/components/Messages/Messages'
import { Button } from '@/components/Commons/Buttons'
import { StatusLayout } from '@/components/Commons/Layout'
import { PeopleChat, PersonChat } from '@/components/Icons/Icons'
import { WebSocketContext, channelTypes } from '@/components/Ws/WsContext'

import { ChatEditor } from './ChatEditor'
import { MessagesContainer } from './Messages'
import { createMessage } from './Utils'

import chatAPI from '@/api/chatAPI'

function Chat({ id, user, chat, chatStatus, isUnauthorized, onOpenChatEditor, usernamesTranslation, onChatDelete }) {
    const isMappingReady = useMemo(() => Object.keys(usernamesTranslation).length > 0, [usernamesTranslation])
    const messageMapping = useMemo(() => isMappingReady ? message => createMessage({
        ...message,
        senderUsername: (usernamesTranslation[message.idSender.toString()] || "<deleted>"),
        isFromOther: user.id !== message.idSender
    }) : null, [user, usernamesTranslation, isMappingReady])

    const [subscribe,] = useContext(WebSocketContext)

    useEffect(() => {
        const unsubDeleteChat = subscribe(channelTypes.deleteChat(id), onChatDelete)

        return unsubDeleteChat
    }, [id, subscribe, onChatDelete])

    return <>
        <div className="d-flex flex-row card-1 align-items-center gap-2">
            <StatusLayout status={chatStatus}
                loading={<>
                    <div className="skeleton skeleton-icon-round-2"></div>
                    <div className="d-flex flex-column flex-grow-1 gap-1">
                        <span className="fs-110 skeleton skeleton-text">_</span>
                        <span className="fs-80 skeleton skeleton-text">_</span>
                    </div>
                </>}
                ready={<>
                    {chat.isGroup ? <PeopleChat className="size-2" /> : <PersonChat className="size-2" />}
                    <div className="d-flex flex-column flex-grow-1">
                        <span className="fs-110 fw-500">{chat.chatName}</span>
                        {chat.isGroup && <span className="fs-80 fore-2">{`${chat.nUsers} users`}</span>}
                    </div>
                    <Button className="circle" onClick={onOpenChatEditor}><ThreeDotsVertical className="fore-2-btn size-1" /></Button></>}
                error={isUnauthorized ?
                    <ChatAlert icon={<KeyFill className="size-2 fore-2" />} title="The requested chat is protected..." subtitle="You do not have permission to access to this chat" /> :
                    <ChatAlert icon={<QuestionCircle className="size-2 fore-2" />} title="The requested chat cannot be loaded..." subtitle="Maybe the chat was deleted or the link is compromised" />}
            />
        </div >
        {messageMapping ? <MessagesContainer id={id} user={user} chat={chat} messageMapping={messageMapping} /> : <SkeletonMessages />}
    </>
}

function ChatPage({ user }) {
    const { id } = useParams()

    const [chat, setChat] = useState({})
    const [users, setUsers] = useState([])

    const [chatStatus, chatStatusActions] = useStatus()
    const [userStatus, userStatusActions] = useStatus()

    const [isUnauthorized, setUnauthorized] = useState(false)
    const [isEditing, setEditing] = useState(false)

    const onOpenChatEditor = useCallback(() => setEditing(true), [])
    const onCloseChatEditor = useCallback(() => setEditing(false), [])

    const navigate = useNavigate()
    const onChatDelete = useCallback(() => navigate("/chats"), [navigate])

    const initCallback = useCallback(done => {
        const controller = new AbortController()

        chatAPI.getChat(id).then(res => res.json())
            .then(chat => {
                setChat(chat)
                setUnauthorized(false)
                chatStatusActions.setReady()
            })
            .catch(err => {
                setUnauthorized(err.status === 401)
                chatStatusActions.setError()
            })

        chatAPI.getChatUsers(id).then(res => res.json())
            .then(users => {
                setUsers(users)
                userStatusActions.setReady()
            })
            .catch(() => userStatusActions.setError())

        done()

        return () => controller?.abort()
    }, [id, chatStatusActions, userStatusActions])

    useInit(initCallback, 0)

    const usernamesTranslation = useMemo(() => Object.fromEntries(users.map(({ id, username }) => [id.toString(), username])), [users])

    const fullChat = useMemo(() => ({
        ...chat,
        chatName: chat.isGroup ? chat.name : `Chat with ${users.find(u => u.id !== user.id)?.username}`
    }), [user, users, chat])

    return <div className="d-flex flex-column flex-grow-1 align-self-stretch mt-2 gap-3">
        {isEditing ?
            <ChatEditor id={id} user={user} chat={chat} setChat={setChat} users={users} areUsersLoading={userStatus.isLoading} setUsers={setUsers} close={onCloseChatEditor} /> :
            <Chat id={id} user={user} chat={fullChat} chatStatus={chatStatus} usernamesTranslation={usernamesTranslation} isUnauthorized={isUnauthorized} onOpenChatEditor={onOpenChatEditor} onChatDelete={onChatDelete} />
        }
    </div>
}

export { Chat, ChatPage }
