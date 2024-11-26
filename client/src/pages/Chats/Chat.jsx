import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowDown, KeyFill, QuestionCircle, ThreeDotsVertical } from 'react-bootstrap-icons'
import { useNavigate, useParams } from 'react-router-dom'

import { useVieport, useStatus, useCounter } from '@/hooks'

import { Button } from '@/components/Commons/Buttons'
import { StatusLayout } from '@/components/Commons/Layout'
import { InformationBox, SomethingWentWrong } from '@/components/Commons/Misc'

import { PeopleChat, PersonChat } from '@/components/Icons/Icons'

import { WebSocketContext, channelTypes } from '@/components/Ws/WsContext'

import { ChatEditor } from './ChatEditor'
import { MessageCard, MessageEditor, SkeletonMessages } from './Messages'
import { createMessage as onCreateMessage, format99Plus } from './Utils'

import chatAPI from '@/api/chatAPI'

function Chat({ id, user, chat, chatStatus, isUnauthorized, onOpenChatEditor, usernamesTranslation, onChatDelete }) {
    const [messages, setMessages] = useState([])
    const [messagesStatus, messagesStatusActions] = useStatus()
    const [messagesRefetchStatus, messagesRefetchStatusActions] = useStatus({ isReady: true })
    const messagesCursor = useRef(null)

    const [newMessagesNumber, incrementNewMessagesNumber, resetNewMessagesNumber] = useCounter(0)

    const lastRef = useRef(null)
    const { isInViewport: isLastInViewport, scrollTo: scrollToLastMessage } = useVieport(lastRef, resetNewMessagesNumber)

    const isFirstLoadingDone = useRef(false)
    const isScrollRequired = useRef(false)
    const isMessageReceived = useRef(false)

    const isMappingReady = useMemo(() => Object.keys(usernamesTranslation).length > 0, [usernamesTranslation])
    const messageMapping = useCallback(message => ({
        ...message,
        senderUsername: (usernamesTranslation[message.idSender.toString()] || "<deleted>"),
        isFromOther: user.id !== message.idSender
    }), [user, usernamesTranslation])

    const getMessages = useCallback((cur, { setReady, setLoading, setError }) => {
        setLoading()
        chatAPI.getMessages(id, cur)
            .then(res => res.json())
            .then(res => {
                if (res.messages.length > 0 && res.nextCursor === messagesCursor.current) return

                setMessages(p => [...[...res.messages.map(messageMapping)].reverse(), ...p])
                messagesCursor.current = res.nextCursor
                setReady()
            })
            .catch(err => setError())
    }, [id, messageMapping])

    const messageReceived = useCallback(message => {
        if (user.id === message.idSender) return

        setMessages(p => [...p, messageMapping(message)])

        isMessageReceived.current = true
    }, [user.id, messageMapping])

    /* get messages async */
    useEffect(() => {
        if (isFirstLoadingDone.current) return
        if (!isMappingReady) return

        isScrollRequired.current = true
        getMessages(messagesCursor.current, messagesStatusActions)

        isFirstLoadingDone.current = true
    }, [getMessages, isMappingReady, messagesStatusActions])

    /* ws events handlers  */
    const [subscribe, unsubscribe] = useContext(WebSocketContext)

    useEffect(() => {
        if (!isMappingReady) return

        const channelCreateMessage = channelTypes.createMessageInChat(id)
        subscribe(channelCreateMessage, ({ message }) => messageReceived(message))

        return () => unsubscribe(channelCreateMessage)
    }, [id, subscribe, unsubscribe, isMappingReady, messageReceived])

    useEffect(() => {
        const channelDeleteMessage = channelTypes.deleteMessageInChat(id)
        subscribe(channelDeleteMessage, ({ message }) => setMessages(p => p.filter(i => i.id !== message.id)))

        const channelDeleteChat = channelTypes.deleteChat(id)
        subscribe(channelDeleteChat, onChatDelete)

        return () => {
            unsubscribe(channelDeleteMessage)
            unsubscribe(channelDeleteChat)
        }
    }, [id, subscribe, unsubscribe, onChatDelete])

    const onClickNewMessages = useCallback(() => {
        resetNewMessagesNumber()
        scrollToLastMessage()
    }, [scrollToLastMessage, resetNewMessagesNumber])

    const createMessage = useCallback(props => onCreateMessage({ ...props, idSender: user.id }), [user])
    const onMessagePending = useCallback(message => setMessages(p => [...p, messageMapping(message)]), [messageMapping, setMessages])
    const onMessageSent = (id, message) => setMessages(p => p.map(m => m.id === id ? message : m))
    const onDeleteMessage = useCallback(message => () => chatAPI.deleteMessage(id, message.id), [id])

    const onSendMessage = useCallback(content => {
        const message = createMessage({ content })

        isScrollRequired.current = true
        onMessagePending(message)
        chatAPI.sendMessage(id, { content }).then(res => res.json())
            .then(res => onMessageSent(message.id, createMessage({ ...message, id: res.id.toString(), isPending: false, isError: false })))
            .catch(err => onMessageSent(message.id, createMessage({ ...message, isPending: false, isError: true })))
    }, [id, createMessage, onMessagePending])

    const onGetPreviousMessagesClick = useCallback(() => getMessages(messagesCursor.current, messagesRefetchStatusActions), [messagesCursor, getMessages, messagesRefetchStatusActions])

    // when message list rerenders scroll bottom if needed
    useEffect(() => {
        if (isScrollRequired.current) {
            scrollToLastMessage()
            isScrollRequired.current = false
        }
        if (isMessageReceived.current) {
            isLastInViewport ? scrollToLastMessage() : incrementNewMessagesNumber()
            isMessageReceived.current = false
        }
    }, [messages, isLastInViewport, scrollToLastMessage, incrementNewMessagesNumber])

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
                error={isUnauthorized ? <>
                    <KeyFill className="size-2 fore-2" />
                    <div className="d-flex flex-column flex-grow-1">
                        <span className="fs-110 fw-500">The requested chat is protected...</span>
                        <span className="fs-80 fore-2">You do not have permission to access to this chat</span>
                    </div>
                </> : <>
                    <QuestionCircle className="size-2 fore-2" />
                    <div className="d-flex flex-column flex-grow-1">
                        <span className="fs-110 fw-500">The requested chat cannot be loaded...</span>
                        <span className="fs-80 fore-2">Maybe the chat was deleted or the link is compromised</span>
                    </div>
                </>}
            />
        </div >
        <div className="d-flex flex-column flex-grow-1 h-0 gap-2 scroll-y pr-2 pl-2">
            {messagesCursor.current !== null && <StatusLayout status={messagesRefetchStatus}
                loading={<Button onClick={onGetPreviousMessagesClick} disabled={true}>Loading...</Button>}
                ready={<Button onClick={onGetPreviousMessagesClick}>Get Previous Messages...</Button>}
                error={<Button onClick={onGetPreviousMessagesClick}>Error while retrieving more messages. Retry?</Button>}
            />}
            <StatusLayout status={messagesStatus}
                loading={<SkeletonMessages />}
                ready={<>
                    {messages.length === 0 && <InformationBox title="Wow, such an empty!" subtitle="All the exchanged messages will be shown here!" />}
                    {messages.map((message, i, arr) => <MessageCard key={message.id} message={message} prev={i > 0 ? arr[i - 1] : null} onDelete={onDeleteMessage(message)} />)}
                </>}
                error={<SomethingWentWrong explanation="It is not possible to load any message!" />}
            />
            <div ref={lastRef} style={{ color: "transparent" }}>_</div>
        </div>
        <div className="position-relative">
            {newMessagesNumber > 0 &&
                <Button onClick={onClickNewMessages} className="box-glow position-absolute" style={{ top: "-50px", right: "1.5em" }}>
                    <ArrowDown className="fore-2 size-1" />
                    <div className="position-absolute crd-icon-15" style={{ backgroundColor: "#BD44D6", top: "-0.6em", left: "-0.6em" }}>
                        <span className="fs-70">{format99Plus(newMessagesNumber)}</span>
                    </div>
                </Button>}
            <MessageEditor onSendMessage={onSendMessage} isDisabled={!messagesStatus.isReady} />
        </div>
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

    useEffect(() => {
        const controller = new AbortController()

        chatAPI.getChat(id)
            .then(res => res.json())
            .then(chat => {
                setChat(chat)
                setUnauthorized(false)
                chatStatusActions.setReady()
            })
            .catch(err => {
                setUnauthorized(err.status === 401)
                chatStatusActions.setError()
            })

        chatAPI.getChatUsers(id)
            .then(res => res.json())
            .then(users => {
                setUsers(users)
                userStatusActions.setReady()
            })
            .catch(() => userStatusActions.setError())

        return () => { controller?.abort() }
    }, [id, chatStatusActions, userStatusActions])

    const usernamesTranslation = useMemo(() => Object.fromEntries(users.map(({ id, username }) => [id.toString(), username])), [users])

    const fullChat = useMemo(() => ({
        ...chat,
        chatName: chat.isGroup ? chat.name : `Chat with ${users.find(u => u.id !== user.id)?.username}`
    }
    ), [user, users, chat])

    return <div className="d-flex flex-column flex-grow-1 align-self-stretch mt-2 gap-3">
        {isEditing ?
            <ChatEditor id={id} user={user} chat={chat} setChat={setChat} users={users} areUsersLoading={userStatus.isLoading} setUsers={setUsers} close={onCloseChatEditor} /> :
            <Chat id={id} user={user} chat={fullChat} chatStatus={chatStatus} usernamesTranslation={usernamesTranslation} isUnauthorized={isUnauthorized} onOpenChatEditor={onOpenChatEditor} onChatDelete={onChatDelete} />
        }
    </div>
}

export { Chat, ChatPage }
