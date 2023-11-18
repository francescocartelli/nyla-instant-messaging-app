import { useContext, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowDown, Check2, ChevronRight, Hourglass, ThreeDots, ThreeDotsVertical, TrashFill } from "react-bootstrap-icons"

import './Chats.css'

import { getDateAndTime } from "utils/Dates"

import { ErrorAlert, LoadingAlert } from "components/Alerts/Alerts"
import { FlowLayout } from "components/Common/Layout"
import { TextArea } from "components/Common/Inputs"
import { Button } from "components/Common/Buttons"
import { PeopleChat, PersonChat } from "components/Icons/Icons"
import { ChatEditor } from "components/Pages/Chats/ChatEditor"
import { WebSocketContext, channelTypes } from "components/Ws/WsContext"

import chatAPI from "api/chatAPI"

function MessageEditor({ id, scrollTo = () => { } }) {
    const [content, setContent] = useState("")
    const [isSending, setSending] = useState(false)

    const isSendButtonDisabled = () => { return isSending || content === "" }

    return <div className="card-1">
        <div className="d-flex flex-row gap-2 align-items-center">
            <TextArea rows={1} className="flex-grow-1" value={content} disabled={isSending} placeholder="Write yout message here..."
                onChange={(ev) => setContent(ev.target.value)} />
            <Button className={'circle'} disabled={isSendButtonDisabled()} onClick={() => {
                setSending(true)
                chatAPI.sendMessage(id, { content: content }).then((m) => {
                    setContent("")
                    setSending(false)
                    scrollTo()
                }).catch(err => {
                    console.log(err)
                })
            }}><Check2 className="fore-success size-1" /></Button>
        </div>
    </div>
}

function DateLabel({ date }) {
    return <div className="card-2">
        <p className="crd-subtitle text-center">{date}</p>
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

    const deleteMessage = () => {
        setDeleting(true)
        chatAPI.deleteMessage(id, message.id).then().catch(err => {
            setDeleting(false)
            console.log(err)
        })
    }

    const DeleteMessage = () => {
        return <>
            {isExpanded ? <>
                {isDeleting ? <Hourglass className="fore-2" /> : <TrashFill className="fore-2-btn" onClick={() => deleteMessage()} />}
                <ChevronRight onClick={() => setExpanded(false)} className="fore-2-btn" />
            </> : <ThreeDots onClick={() => setExpanded(true)} className="fore-2-btn" />}
        </>
    }

    return <>
        {date !== prevDate && <DateLabel date={date} />}
        <div className={`d-flex flex-column card-1 crd-min-w limit-width ${isFromOther ? 'left' : 'right'} ${changedSender ? 'mt-2' : ''}`}>
            {isFromOther && changedSender && <p className="crd-title-small fore-2">{senderUsername}</p>}
            <p className="m-0">{message.content}</p>
            <div className="d-flex flex-row gap-1 align-items-center">
                <p className="crd-subtitle pr-2 flex-grow-1">{time}</p>
                {!isFromOther && <DeleteMessage />}
            </div>
        </div>
    </>
}

function EmptyMessages() {
    return <div className="d-flex justify-content-center align-items-center flex-grow-1">
        <div className="card-1">
            <p className="text-center m-0"><b>Wow, such an empty!</b></p>
            <p className="text-center crd-subtitle">All the exchanged messages will be shown here!</p>
        </div>
    </div>
}

function Chat({ user }) {
    const { id } = useParams()

    const [chat, setChat] = useState({})
    const [users, setUsers] = useState([])

    const [chatFlow, setChatFlow] = useState('loading')
    const [usersFlow, setUsersFlow] = useState('loading')
    const [messagesFlow, setMessagesFlow] = useState('loading')

    const [messages, setMessages] = useState([])
    const [isNextDisabled, setNextDisabled] = useState(false)
    const cursor = useRef(null)
    const [isEditing, setEditing] = useState(false)
    const [isNewMessages, setnewMessages] = useState(false)

    const lastRef = useRef(null)
    const [subscribe, unsubscribe] = useContext(WebSocketContext)
    const navigate = useNavigate()

    const scrollToLast = () => { lastRef.current?.scrollIntoView() }

    const getMessages = () => {
        setNextDisabled(true)
        chatAPI.getMessages(id, cursor.current, {}).then(({ messages, nextCursor }) => {
            setNextDisabled(false)
            cursor.current = nextCursor
            setMessages(p => [...[...messages].reverse(), ...p])
        }).catch(err => console.log(err))
    }

    useEffect(() => {
        const controller = new AbortController()

        chatAPI.getChat(id, { signal: controller.signal }).then(chat => {
            setChat(chat)
            setChatFlow('ready')
        }).catch(err => {
            console.log(err)
            setChatFlow('error')
        })

        chatAPI.getChatUsers(id, { signal: controller.signal }).then(users => {
            setUsers(users)
            setUsersFlow('ready')
        }).catch(err => {
            console.log(err)
            setUsersFlow('error')
        })

        chatAPI.getMessages(id, cursor.current, { signal: controller.signal }).then(({ messages, nextCursor }) => {
            setMessages(p => [...[...messages].reverse(), ...p])
            cursor.current = nextCursor
            scrollToLast()
            setMessagesFlow('ready')
        }).catch(err => {
            console.log(err)
            setMessagesFlow('error')
        })

        return () => { controller?.abort() }
    }, [id])

    useEffect(() => {
        const channelCreateMessage = channelTypes.createMessageInChat(id)
        subscribe(channelCreateMessage, ({ message }) => {
            console.log(message)
            setnewMessages(true)
            setMessages(p => [...p, message])
        })

        const channelDeleteMessage = channelTypes.deleteMessageInChat(id)
        subscribe(channelDeleteMessage, ({ message }) => setMessages(p => p.filter(i => i.id !== message.id)))

        const channelDeleteChat = channelTypes.deleteChat(id)
        subscribe(channelDeleteChat, () => navigate('/chats'))

        return () => {
            unsubscribe(channelCreateMessage)
            unsubscribe(channelDeleteMessage)
            unsubscribe(channelDeleteChat)
        }
    }, [id, subscribe, unsubscribe, navigate])

    const getChatName = () => { return chat.isGroup ? chat.name : `Chat with ${users.find(u => u.id !== user.id)?.username}` }

    return <div className="d-flex flex-column flex-grow-1 align-self-stretch mt-2 gap-3">
        {isEditing ?
            <ChatEditor user={user} chat={chat} setChat={setChat} usersFlow={usersFlow} users={users} setUsers={setUsers} close={() => setEditing(false)} /> :
            <>
                <div className="d-flex flex-row card-1 align-items-center gap-2">
                    <FlowLayout state={chatFlow}>
                        <loading><LoadingAlert /></loading>
                        <ready>
                            {chat.isGroup ? <PeopleChat className="size-2" /> : <PersonChat className="size-2" />}
                            <div className="d-flex flex-column flex-grow-1">
                                <p className="crd-title">{getChatName()}</p>
                                {chat.isGroup && <p className="crd-subtitle">{`${users?.length} users`}</p>}
                            </div>
                            <Button className='circle' onClick={() => setEditing(true)}><ThreeDotsVertical className="fore-2-btn size-1" /></Button>
                        </ready>
                        <error><ErrorAlert /></error>
                    </FlowLayout>
                </div>
                <div className="d-flex flex-column flex-grow-1 h-0 gap-2 scroll-y">
                    <FlowLayout state={messagesFlow}>
                        <loading><LoadingAlert /></loading>
                        <ready>
                            {cursor.current !== null && <Button disabled={isNextDisabled} onClick={() => getMessages()}>Get Previous Messages...</Button>}
                            {messages.length === 0 && <EmptyMessages />}
                            {messages.map((message, i, arr) => <MessageCard key={message.id}
                                id={id}
                                message={message}
                                user={user}
                                prev={i > 0 ? arr[i - 1] : null}
                                users={users} />)}
                            <div ref={lastRef} />
                        </ready>
                        <error><ErrorAlert /></error>
                    </FlowLayout>
                </div>
                <div className="rel">
                    {isNewMessages && <div className="d-flex justify-content-center align-items-center flex-grow-1 new-messages-wrapper">
                        <Button onClick={() => {
                            setnewMessages(false)
                            scrollToLast()
                        }} className="card-1 d-flex flex-row gap-2 box-glow">
                            <ArrowDown className="fore-2 size-1" />
                            <p className="text-center m-0">New Messages!</p>
                            <ArrowDown className="fore-2 size-1" />
                        </Button>
                    </div>}
                    <MessageEditor id={id} scrollTo={scrollToLast} />

                </div>
            </>}
    </div>
}

export { Chat }