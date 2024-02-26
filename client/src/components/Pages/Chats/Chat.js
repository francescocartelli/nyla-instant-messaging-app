import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowDown, Check2, Hourglass, QuestionCircle, ThreeDotsVertical, TrashFill } from "react-bootstrap-icons"

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

import chatAPI from "api/chatAPI"

function MessageEditor({ idChat }) {
    const [content, setContent] = useState("")
    const [isSending, setSending] = useState(false)

    const isSendButtonDisabled = () => { return isSending || content === "" }

    const onChangeContent = (ev) => setContent(ev.target.value)
    const onSubmitMessage = (ev) => {
        ev.preventDefault()
        setSending(true)
        chatAPI.sendMessage(idChat, { content: content }).then(() => {
            setContent("")
            setSending(false)
        }).catch(err => console.log(err))
    }

    return <div className="card-1">
        <form className="d-flex flex-row gap-2 align-items-center" onSubmit={onSubmitMessage}>
            <Text className="flex-grow-1" value={content} disabled={isSending} placeholder="Write yout message here..." onChange={onChangeContent} />
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
                {!message.isFromOther && <ShowMoreLayout> {isDeleting ?
                    <Hourglass className="fore-2" /> :
                    <TrashFill className="fore-2-btn" onClick={onClickMessageDelete} />}
                </ShowMoreLayout>}
            </div>
        </div>
    </>
}

function Chat({ user }) {
    const { id } = useParams()

    const [chat, setChat] = useState({})
    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState([])

    const usernamesTranslation = useMemo(() => Object.fromEntries(users.map(({ id, username }) => [id.toString(), username])), [users])

    const messageMapping = useCallback((message) => {
        return {
            ...message,
            senderUsername: (usernamesTranslation[message.idSender.toString()] || "<deleted>"),
            isFromOther: user.id !== message.idSender
        }
    }, [user, usernamesTranslation])

    const [chatStatus, chatStatusActions] = useStatus()
    const [userStatus, userStatusActions] = useStatus()
    const [messagesStatus, messagesStatusActions] = useStatus()

    const messagesCursor = useRef(null)

    const [isEditing, setEditing] = useState(false)
    const [isNewMessageButtonVisible, setNewMessageButtonVisible] = useState(false)

    const lastRef = useRef(null)
    const isLastInViewport = useIsInViewport(lastRef)

    const [subscribe, unsubscribe] = useContext(WebSocketContext)

    const navigate = useNavigate()

    const scrollToLastMessage = () => { lastRef.current?.scrollIntoView() }

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

    useEffect(() => {
        if (Object.keys(usernamesTranslation).length < 1) return

        getMessages(scrollToLastMessage)
    }, [getMessages, usernamesTranslation])

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

    const updateScroll = useCallback((message) => {
        if (user.id !== message.idSender) {
            if (isLastInViewport) scrollToLastMessage()
            else setNewMessageButtonVisible(true)
        } else scrollToLastMessage()
    }, [isLastInViewport, user.id])

    useEffect(() => {
        const channelCreateMessage = channelTypes.createMessageInChat(id)
        subscribe(channelCreateMessage, ({ message }) => {
            setMessages(p => [...p, message])
            updateScroll(message)
        })

        const channelDeleteMessage = channelTypes.deleteMessageInChat(id)
        subscribe(channelDeleteMessage, ({ message }) => setMessages(p => p.filter(i => i.id !== message.id)))

        const channelDeleteChat = channelTypes.deleteChat(id)
        subscribe(channelDeleteChat, () => navigate("/chats"))

        return () => {
            unsubscribe(channelCreateMessage)
            unsubscribe(channelDeleteMessage)
            unsubscribe(channelDeleteChat)
        }
    }, [id, subscribe, unsubscribe, navigate, isLastInViewport, updateScroll])

    const getChatName = () => { return chat.isGroup ? chat.name : `Chat with ${users.find(u => u.id !== user.id)?.username}` }
    const onClickNewMessages = () => { setNewMessageButtonVisible(false); scrollToLastMessage() }
    const onCloseChatEditor = () => setEditing(false)
    const onClickEditChat = () => setEditing(true)

    return <div className="d-flex flex-column flex-grow-1 align-self-stretch mt-2 gap-3">
        {isEditing ?
            <ChatEditor user={user} chat={chat} setChat={setChat} users={users} setUsers={setUsers} close={onCloseChatEditor} /> :
            <>
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
                                <span className="fs-110 fw-500">{getChatName()}</span>
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
                    <div ref={lastRef}></div>
                </div>
                <div className="position-relative">
                    {isNewMessageButtonVisible && <Button onClick={onClickNewMessages} className="box-glow position-absolute" style={{ top: "-50px", right: "1.5em" }}>
                        <ArrowDown className="fore-2 size-1" />
                    </Button>}
                    <MessageEditor idChat={id} />
                </div>
            </>}
    </div>
}

export { Chat }