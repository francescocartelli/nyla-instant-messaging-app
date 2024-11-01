import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowDown, BugFill, Check2, Hourglass, KeyFill, QuestionCircle, ThreeDotsVertical, TrashFill } from "react-bootstrap-icons"
import { v4 as uuidv4 } from 'uuid'

import { useStatus, useIsInViewport } from "hooks"

import { LoadingAlert } from "components/Commons/Alerts"
import { ShowMoreLayout, StatusLayout } from "components/Commons/Layout"
import { Button } from "components/Commons/Buttons"
import { InformationBox, SomethingWentWrong } from "components/Commons/Misc"

import { PeopleChat, PersonChat } from "components/Icons/Icons"

import { WebSocketContext, channelTypes } from "components/Ws/WsContext"

import { RTEditor, RTViewer, Toolbar } from "components/SEditor"

import { ChatEditor } from "./ChatEditor"
import { format99Plus, getDateAndTime, initialContent } from "./Utils"

import chatAPI from "api/chatAPI"

function MessageEditor({ user, idChat, onMessagePending, onMessageSent, isDisabled }) {
    const [content, setContent] = useState(initialContent)
    const editorRef = useRef()

    const isSendButtonDisabled = isDisabled

    const resetEditor = () => {
        setContent(initialContent)
        editorRef.current.reset()
    }

    const onSubmitMessage = (ev) => {
        ev.preventDefault()

        const message = { id: uuidv4(), content: content, isPending: true, idSender: user.id }

        onMessagePending(message)
        resetEditor()
        chatAPI.sendMessage(idChat, { content: content })
            .then(res => res.json())
            .then(({ id }) => onMessageSent(message.id, { ...message, id: id.toString(), isPending: false, isError: false }))
            .catch(err => onMessageSent(message.id, { ...message, isPending: false, isError: true }))
    }

    return <div className="d-flex flex-row gap-2 align-items-center card-1">
        <RTEditor value={content} setValue={setContent} toolbar={<Toolbar />} placeholder="Write yout message here..." ref={editorRef} />
        <form onSubmit={onSubmitMessage}>
            <Button type="submit" className={"circle"} disabled={isSendButtonDisabled}><Check2 className="fore-success size-1" /></Button>
        </form>
    </div>
}

function DateLabel({ date }) {
    return <div className="d-flex align-items-center card-2 text-center align-self-center">
        <span className="fs-80 fore-2 pr-2 pl-2">{date}</span>
    </div>
}

function MessageCard({ idChat, message, prev }) {
    const [isDeleting, setDeleting] = useState(false)

    const [date, time] = getDateAndTime(message.createdAt)
    const isDateVisible = prev ? (getDateAndTime(prev.createdAt)[0] !== date) : false
    const isSenderChanged = prev ? (message.idSender?.toString() !== prev.idSender?.toString()) : true

    const onClickMessageDelete = () => {
        setDeleting(true)
        chatAPI.deleteMessage(idChat, message.id).then().catch(err => setDeleting(false))
    }

    const isRichText = (typeof message.content) !== "string"

    return <>
        {isDateVisible && <DateLabel date={date} />}
        <div className={`d-flex flex-column card-1 min-w-100 message-card-width break-word ${message.isFromOther ? "align-self-start" : "align-self-end"} ${isSenderChanged ? "mt-2" : ""}`}>
            {message.isFromOther && isSenderChanged && <span className="fore-2 fs-80 fw-600">{message.senderUsername}</span>}
            {isRichText ? <RTViewer value={message.content} /> : <p className="m-0 text-wrap">{message.content}</p>}
            <div className="d-flex flex-row gap-1 align-items-center">
                <span className="fore-2 fs-70 pr-2 flex-grow-1">{time}</span>
                {!message.isFromOther && <>
                    {message.isError && <BugFill className="fore-2" />}
                    {message.isPending && <Hourglass className="fore-2" />}
                    {!message.isPending && !message.isError && <ShowMoreLayout> {isDeleting ?
                        <Hourglass className="fore-2" /> :
                        <TrashFill className="fore-2-btn" onClick={onClickMessageDelete} />}
                    </ShowMoreLayout>}
                </>}
            </div>
        </div>
    </>
}

function Chat({ id, user, chat, chatStatus, isUnauthorized, users, setEditing }) {
    const chatName = chat.isGroup ? chat.name : `Chat with ${users.find(u => u.id !== user.id)?.username}`

    const [messages, setMessages] = useState([])
    const [messagesStatus, messagesStatusActions] = useStatus()
    const messagesCursor = useRef(null)

    const usernamesTranslation = useMemo(() => Object.fromEntries(users.map(({ id, username }) => [id.toString(), username])), [users])
    const messageMapping = useCallback((message) => ({
        ...message,
        senderUsername: (usernamesTranslation[message.idSender.toString()] || "<deleted>"),
        isFromOther: user.id !== message.idSender
    }), [user, usernamesTranslation])

    const [newMessagesNumber, setNewMessagesNumber] = useState(0)

    const lastRef = useRef(null)
    const isLastInViewport = useIsInViewport(lastRef)
    const scrollToLastMessage = () => lastRef.current.scrollIntoView({ behavior: "smooth" })

    useEffect(() => {
        if (isLastInViewport) setNewMessagesNumber(0) // reset hint when bottom is reached
    }, [isLastInViewport])

    const getMessages = useCallback((callback = () => { }) => {
        messagesStatusActions.setLoading()
        chatAPI.getMessages(id, messagesCursor.current)
            .then(res => res.json())
            .then(res => {
                const lastMessageId = res.messages.at(-1)?.id
                const cursor = messagesCursor.current
                const isRefetching = lastMessageId === cursor
                if (isRefetching) return

                setMessages(p => [...[...res.messages.map(messageMapping)].reverse(), ...p])
                messagesCursor.current = res.nextCursor
                messagesStatusActions.setReady()
                callback()
            })
            .catch(err => { messagesStatusActions.setError(); console.log(err) })
    }, [id, messagesCursor, messageMapping, messagesStatusActions])

    const messageReceived = useCallback((message) => {
        if (user.id === message.idSender) return

        setMessages(p => [...p, messageMapping(message)])
        if (!isLastInViewport) setNewMessagesNumber(p => p + 1)
        else scrollToLastMessage()
    }, [user.id, messageMapping, isLastInViewport])

    /* get messages async */
    useEffect(() => {
        if (Object.keys(usernamesTranslation).length < 1) return

        getMessages(scrollToLastMessage)
    }, [getMessages, usernamesTranslation])

    /* ws events handlers  */
    const navigate = useNavigate()
    const [subscribe, unsubscribe] = useContext(WebSocketContext)

    useEffect(() => {
        const channelCreateMessage = channelTypes.createMessageInChat(id)
        subscribe(channelCreateMessage, ({ message }) => messageReceived(message))

        return () => unsubscribe(channelCreateMessage)
    }, [id, subscribe, unsubscribe, messageReceived])

    useEffect(() => {
        const channelDeleteMessage = channelTypes.deleteMessageInChat(id)
        subscribe(channelDeleteMessage, ({ message }) => setMessages(p => p.filter(i => i.id !== message.id)))

        const channelDeleteChat = channelTypes.deleteChat(id)
        subscribe(channelDeleteChat, () => navigate("/chats"))

        return () => {
            unsubscribe(channelDeleteMessage)
            unsubscribe(channelDeleteChat)
        }
    }, [id, subscribe, unsubscribe, navigate])

    const onClickNewMessages = () => { setNewMessagesNumber(0); scrollToLastMessage() }
    const onClickEditChat = () => setEditing(true)

    const onMessagePending = message => {
        setMessages(p => [...p, messageMapping(message)])
        scrollToLastMessage()
    }

    const onMessageSent = (id, message) => setMessages(p => p.map(m => m.id === id ? message : m))

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
                    < div className="d-flex flex-column flex-grow-1">
                        <span className="fs-110 fw-500">{chatName}</span>
                        {chat.isGroup && <span className="fs-80 fore-2">{`${chat.nUsers} users`}</span>}
                    </div>
                    <Button className="circle" onClick={onClickEditChat}><ThreeDotsVertical className="fore-2-btn size-1" /></Button></>}
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
            {messagesCursor.current !== null && <Button disabled={!messagesStatus.isReady} onClick={() => getMessages()}>Get Previous Messages...</Button>}
            <StatusLayout status={messagesStatus}
                loading={<LoadingAlert />}
                ready={<>
                    {messages.length === 0 && <InformationBox title="Wow, such an empty!" subtitle="All the exchanged messages will be shown here!" />}
                    {messages.map((message, i, arr) => <MessageCard key={message.id} idChat={id} message={message} prev={i > 0 ? arr[i - 1] : null} />)}
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
            <MessageEditor idChat={id} user={user} isDisabled={!messagesStatus.isReady} onMessagePending={onMessagePending} onMessageSent={onMessageSent} />
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

    const onCloseChatEditor = () => setEditing(false)

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

    return <div className="d-flex flex-column flex-grow-1 align-self-stretch mt-2 gap-3">
        {isEditing ?
            <ChatEditor id={id} user={user} chat={chat} setChat={setChat} users={users} areUsersLoading={userStatus.isLoading} setUsers={setUsers} close={onCloseChatEditor} /> :
            <Chat id={id} user={user} chat={chat} chatStatus={chatStatus} isUnauthorized={isUnauthorized} users={users} setEditing={setEditing} />
        }
    </div>
}

export { Chat, ChatPage }