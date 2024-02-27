import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowDown, BugFill, Check2, Hourglass, QuestionCircle, ThreeDotsVertical, TrashFill } from "react-bootstrap-icons"
import { v4 as uuidv4 } from 'uuid'

import { useStatus, useIsInViewport } from "hooks"

import { getDateAndTime } from "utils/Dates"

import { LoadingAlert } from "components/Alerts/Alerts"
import { ShowMoreLayout, StatusLayout } from "components/Common/Layout"
import { Text } from "components/Common/Inputs"
import { Button } from "components/Common/Buttons"
import { PeopleChat, PersonChat } from "components/Icons/Icons"
import { ChatEditor } from "components/Pages/Chats/ChatEditor"
import { WebSocketContext, channelTypes } from "components/Ws/WsContext"
import { InformationBox, SomethingWentWrong } from "components/Common/Misc"

import { format99Plus } from "utils/Numeric"

import chatAPI from "api/chatAPI"

function MessageEditor({ user, idChat, onMessagePending, onMessageSent }) {
    const [content, setContent] = useState("")

    const isSendButtonDisabled = () => { return content === "" }

    const onChangeContent = (ev) => setContent(ev.target.value)
    const onSubmitMessage = (ev) => {
        ev.preventDefault()

        const message = { id: uuidv4(), content: content, isPending: true, idSender: user.id }

        setContent("")
        onMessagePending(message)
        chatAPI.sendMessage(idChat, { content: content })
            .then(() => onMessageSent({ ...message, isPending: false, isError: false }))
            .catch(err => onMessageSent({ ...message, isPending: false, isError: true }))
    }

    return <div className="card-1">
        <form className="d-flex flex-row gap-2 align-items-center" onSubmit={onSubmitMessage}>
            <Text className="flex-grow-1" value={content} placeholder="Write yout message here..." onChange={onChangeContent} />
            <Button type="submit" className={"circle"} disabled={isSendButtonDisabled()}><Check2 className="fore-success size-1" /></Button>
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

    return <>
        {isDateVisible && <DateLabel date={date} />}
        <div className={`d-flex flex-column card-1 min-w-100 max-w-60p break-word ${message.isFromOther ? "align-self-start" : "align-self-end"} ${isSenderChanged ? "mt-2" : ""}`}>
            {message.isFromOther && isSenderChanged && <span className="fore-2 fs-80 fw-600">{message.senderUsername}</span>}
            <p className="m-0 text-wrap">{message.content}</p>
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

function Chat({ id, user, chat, chatStatus, users, setEditing }) {
    const chatName = chat.isGroup ? chat.name : `Chat with ${users.find(u => u.id !== user.id)?.username}`

    const [messages, setMessages] = useState([])
    const [messagesStatus, messagesStatusActions] = useStatus()
    const messagesCursor = useRef(null)

    const usernamesTranslation = useMemo(() => Object.fromEntries(users.map(({ id, username }) => [id.toString(), username])), [users])
    const messageMapping = useCallback((message) => {
        return {
            ...message,
            senderUsername: (usernamesTranslation[message.idSender.toString()] || "<deleted>"),
            isFromOther: user.id !== message.idSender
        }
    }, [user, usernamesTranslation])

    const [newMessagesNumber, setNewMessagesNumber] = useState(0)

    const lastRef = useRef(null)
    const isLastInViewport = useIsInViewport(lastRef)
    const scrollToLastMessage = () => lastRef.current.scrollIntoView({ behavior: "smooth" })

    useEffect(() => {
        if (isLastInViewport) setNewMessagesNumber(0) // reset hint when bottom is reached
    }, [isLastInViewport])

    const getMessages = useCallback((callback = () => { }) => {
        const controller = new AbortController()
        messagesStatusActions.setLoading()
        chatAPI.getMessages(id, messagesCursor.current, { signal: controller.signal })
            .then(res => res.json()).then(({ messages, nextCursor }) => {
                setMessages(p => [...[...messages.map(messageMapping)].reverse(), ...p])
                messagesCursor.current = nextCursor
                messagesStatusActions.setReady()
                callback()
            }).catch(err => { messagesStatusActions.setError(); console.log(err) })
    }, [id, messagesCursor, messageMapping, messagesStatusActions])

    const messageReceived = useCallback((message) => {
        if (user.id !== message.idSender) {
            setMessages(p => [...p, messageMapping(message)])
            if (!isLastInViewport) setNewMessagesNumber(p => p + 1)
            else scrollToLastMessage()
        }
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

    return <>
        <div className="d-flex flex-row card-1 align-items-center gap-2">
            <StatusLayout status={chatStatus}>
                <loading>
                    <div className="skeleton skeleton-icon-round-2"></div>
                    <div className="d-flex flex-column flex-grow-1 gap-1">
                        <span className="fs-110 skeleton skeleton-text">_</span>
                        <span className="fs-80 skeleton skeleton-text">_</span>
                    </div>
                </loading>
                <ready>
                    {chat.isGroup ? <PeopleChat className="size-2" /> : <PersonChat className="size-2" />}
                    <div className="d-flex flex-column flex-grow-1">
                        <span className="fs-110 fw-500">{chatName}</span>
                        {chat.isGroup && <span className="fs-80 fore-2">{`${chat.nUsers} users`}</span>}
                    </div>
                    <Button className="circle" onClick={onClickEditChat}><ThreeDotsVertical className="fore-2-btn size-1" /></Button>
                </ready>
                <error>
                    <QuestionCircle className="size-2 fore-2" />
                    <div className="d-flex flex-column flex-grow-1">
                        <p className="fs-110 fw-500">The requested chat cannot be loaded...</p>
                        <p className="fs-80 fore-2">Maybe the chat was deleted or the link is compromised</p>
                    </div>
                </error>
            </StatusLayout>
        </div>
        <div className="d-flex flex-column flex-grow-1 h-0 gap-2 scroll-y pr-2 pl-2">
            {messagesCursor.current !== null && <Button disabled={messagesStatus !== "ready"} onClick={() => getMessages()}>Get Previous Messages...</Button>}
            <StatusLayout status={messagesStatus}>
                <loading><LoadingAlert /></loading>
                <ready>
                    {messages.length === 0 && <InformationBox title="Wow, such an empty!" subtitle="All the exchanged messages will be shown here!" />}
                    {messages.map((message, i, arr) => <MessageCard key={message.id} idChat={id} message={message} prev={i > 0 ? arr[i - 1] : null} />)}
                </ready>
                <error><SomethingWentWrong explanation="It is not possible to load any message!" /></error>
            </StatusLayout>
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
            <MessageEditor idChat={id} user={user}
                onMessagePending={(message) => { setMessages(p => [...p, messageMapping(message)]); scrollToLastMessage() }}
                onMessageSent={(message) => setMessages(p => p.map(m => m.id === message.id ? message : m))} />
        </div>
    </>
}

function ChatPage({ user }) {
    const { id } = useParams()

    const [chat, setChat] = useState({})
    const [users, setUsers] = useState([])

    const [chatStatus, chatStatusActions] = useStatus()
    const [userStatus, userStatusActions] = useStatus()

    const [isEditing, setEditing] = useState(false)

    const onCloseChatEditor = () => setEditing(false)

    useEffect(() => {
        const controller = new AbortController()

        chatAPI.getChat(id, { signal: controller.signal })
            .then(res => res.json()).then(chat => {
                setChat(chat)
                chatStatusActions.setReady()
            }).catch(() => chatStatusActions.setError())

        chatAPI.getChatUsers(id, { signal: controller.signal })
            .then(res => res.json()).then(users => {
                setUsers(users)
                userStatusActions.setReady()
            }).catch(() => userStatusActions.setError())

        return () => { controller?.abort() }
    }, [id, chatStatusActions, userStatusActions])

    return <div className="d-flex flex-column flex-grow-1 align-self-stretch mt-2 gap-3">
        {isEditing ?
            <ChatEditor id={id} user={user} chat={chat} setChat={setChat} users={users} setUsers={setUsers} close={onCloseChatEditor} /> :
            <Chat id={id} user={user} chat={chat} chatStatus={chatStatus} users={users} setEditing={setEditing} />
        }
    </div>
}

export { Chat, ChatPage }