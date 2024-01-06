import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowDown, Check2, ChevronRight, Hourglass, ThreeDots, ThreeDotsVertical, TrashFill } from "react-bootstrap-icons"

import "./Chats.css"
import "styles/style.css"

import { getDateAndTime } from "utils/Dates"

import { ErrorAlert, LoadingAlert } from "components/Alerts/Alerts"
import { StatusLayout } from "components/Common/Layout"
import { Text } from "components/Common/Inputs"
import { Button } from "components/Common/Buttons"
import { PeopleChat, PersonChat } from "components/Icons/Icons"
import { ChatEditor } from "components/Pages/Chats/ChatEditor"
import { WebSocketContext, channelTypes } from "components/Ws/WsContext"

import chatAPI from "api/chatAPI"
import { useStatus } from "hooks/useStatus"
import { useIsInViewport } from "hooks/useOnViewport"

function MessageEditor({ id }) {
    const [content, setContent] = useState("")
    const [isSending, setSending] = useState(false)

    const isSendButtonDisabled = () => { return isSending || content === "" }

    const onChangeContent = (ev) => setContent(ev.target.value)
    const onSubmitMessage = (ev) => {
        ev.preventDefault()
        setSending(true)
        chatAPI.sendMessage(id, { content: content }).then((m) => {
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

function MessageCard({ id, message, user, prev, users }) {
    const [isExpanded, setExpanded] = useState(false)
    const [isDeleting, setDeleting] = useState(false)

    const [date, time] = getDateAndTime(message?.createdAt)
    const [prevDate] = prev ? getDateAndTime(prev.createdAt) : [null, null]

    const isFromOther = user.id !== message.idSender
    const changedSender = prev ? message.idSender?.toString() !== prev.idSender?.toString() : true
    const senderUsername = users.find(i => i.id === message.idSender)?.username

    const onClickMessageDelete = () => {
        setDeleting(true)
        chatAPI.deleteMessage(id, message.id).then().catch(err => {
            setDeleting(false)
            console.log(err)
        })
    }

    const DeleteMessageControl = () => {
        return <>
            {isExpanded ? <>
                {isDeleting ? <Hourglass className="fore-2" /> : <TrashFill className="fore-2-btn" onClick={onClickMessageDelete} />}
                <ChevronRight onClick={() => setExpanded(false)} className="fore-2-btn" />
            </> : <ThreeDots onClick={() => setExpanded(true)} className="fore-2-btn" />}
        </>
    }

    return <>
        {date !== prevDate && <DateLabel date={date} />}
        <div className={`d-flex flex-column card-1 crd-min-w limit-width ${isFromOther ? "left" : "right"} ${changedSender ? "mt-2" : ""}`}>
            {isFromOther && changedSender && <span className="fore-2 fs-80 fw-600">{senderUsername}</span>}
            <p className="m-0">{message.content}</p>
            <div className="d-flex flex-row gap-1 align-items-center">
                <span className="fore-2 fs-70 pr-2 flex-grow-1">{time}</span>
                {!isFromOther && <DeleteMessageControl />}
            </div>
        </div>
    </>
}

function EmptyMessages() {
    return <div className="d-flex justify-content-center align-items-center flex-grow-1">
        <div className="card-1">
            <p className="text-center m-0"><b>Wow, such an empty!</b></p>
            <span className="fore-2 fs-80 text-center">All the exchanged messages will be shown here!</span>
        </div>
    </div>
}

function Chat({ user }) {
    const { id } = useParams()

    const [chat, setChat] = useState({})
    const [users, setUsers] = useState([])

    const [chatStatus, chatStatusActions] = useStatus()
    const [usersStatus, userStatusActions] = useStatus()
    const [messagesStatus, messagesStatusActions] = useStatus()

    const [messages, setMessages] = useState([])
    const [isNextDisabled, setNextDisabled] = useState(false)
    const messagesCursor = useRef(null)

    const [isEditing, setEditing] = useState(false)
    const [isNewMessageButtonVisible, setNewMessageButtonVisible] = useState(false)

    const lastRef = useRef(null)
    const isLastInViewport = useIsInViewport(lastRef)

    const [subscribe, unsubscribe] = useContext(WebSocketContext)
    const navigate = useNavigate()

    const scrollToLastMessage = () => { lastRef.current?.scrollIntoView() }

    const getMessages = () => {
        setNextDisabled(true)
        chatAPI.getMessages(id, messagesCursor.current, {}).then(({ messages, nextCursor }) => {
            setNextDisabled(false)
            messagesCursor.current = nextCursor
            setMessages(p => [...[...messages].reverse(), ...p])
        }).catch(err => console.log(err))
    }

    useEffect(() => {
        const controller = new AbortController()

        chatAPI.getChat(id, { signal: controller.signal }).then(chat => {
            chatStatusActions.setReady()
            setChat(chat)
        }).catch(err => {
            chatStatusActions.setError()
            console.log(err)
        })

        chatAPI.getChatUsers(id, { signal: controller.signal }).then(users => {
            setUsers(users)
            userStatusActions.setReady()
        }).catch(err => {
            console.log(err)
            userStatusActions.setError()
        })

        chatAPI.getMessages(id, messagesCursor.current, { signal: controller.signal }).then(({ messages, nextCursor }) => {
            setMessages(p => [...[...messages].reverse(), ...p])
            messagesCursor.current = nextCursor
            messagesStatusActions.setReady()
            scrollToLastMessage()
        }).catch(err => {
            console.log(err)
            messagesStatusActions.setError()
        })

        return () => { controller?.abort() }
    }, [id, chatStatusActions, userStatusActions, messagesStatusActions])

    const updateScroll = useCallback((message) => {
        if (user.id !== message.idSender) {
            if (isLastInViewport) scrollToLastMessage()
            else setNewMessageButtonVisible(true)
        } else scrollToLastMessage()
    }, [isLastInViewport, user.id])

    useEffect(() => {
        const channelCreateMessage = channelTypes.createMessageInChat(id)
        subscribe(channelCreateMessage, ({ message }) => {
            // console.log(message)
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
    const onClickNewMessages = () => {setNewMessageButtonVisible(false); scrollToLastMessage()}
    const onCloseChatEditor = () => setEditing(false)
    const onClickEditChat = () => setEditing(true)

    return <div className="d-flex flex-column flex-grow-1 align-self-stretch mt-2 gap-3">
        {isEditing ?
            <ChatEditor user={user} chat={chat} setChat={setChat} usersFlow={usersStatus} users={users} setUsers={setUsers} close={onCloseChatEditor} /> :
            <>
                <div className="d-flex flex-row card-1 align-items-center gap-2">
                    <StatusLayout status={chatStatus}>
                        <loading><LoadingAlert /></loading>
                        <ready>
                            {chat.isGroup ? <PeopleChat className="size-2" /> : <PersonChat className="size-2" />}
                            <div className="d-flex flex-column flex-grow-1">
                                <p className="crd-title">{getChatName()}</p>
                                {chat.isGroup && <p className="crd-subtitle">{`${users?.length} users`}</p>}
                            </div>
                            <Button className="circle" onClick={onClickEditChat}><ThreeDotsVertical className="fore-2-btn size-1" /></Button>
                        </ready>
                        <error><ErrorAlert /></error>
                    </StatusLayout>
                </div>
                <div className="d-flex flex-column flex-grow-1 h-0 gap-2 scroll-y">
                    <StatusLayout status={messagesStatus}>
                        <loading><LoadingAlert /></loading>
                        <ready>
                            {messagesCursor.current !== null && <Button disabled={isNextDisabled} onClick={getMessages}>Get Previous Messages...</Button>}
                            {messages?.length === 0 && <EmptyMessages />}
                            {messages?.map((message, i, arr) => <MessageCard key={message.id} id={id} message={message}
                                user={user} prev={i > 0 ? arr[i - 1] : null} users={users} />)}
                        </ready>
                        <error><ErrorAlert /></error>
                    </StatusLayout>
                    <div ref={lastRef}></div>
                </div>
                <div className="rel">
                    {isNewMessageButtonVisible && <div className="d-flex justify-content-center align-items-center flex-grow-1 new-messages-wrapper">
                        <Button onClick={onClickNewMessages} className="box-glow">
                            <ArrowDown className="fore-2 size-1" />
                            <p className="text-center m-0">New Messages!</p>
                            <ArrowDown className="fore-2 size-1" />
                        </Button>
                    </div>}
                    <MessageEditor id={id} />
                </div>
            </>}
    </div>
}

export { Chat }