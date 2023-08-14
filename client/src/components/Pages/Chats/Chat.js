import { useContext, useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Check2, ChevronRight, ThreeDots, ThreeDotsVertical, TrashFill } from "react-bootstrap-icons"

import './Chats.css'

import { WebSocketContext, channelTypes } from "components/Ws/WsContext"

import { FlowState } from "utils/Utils"
import { getDateAndTime } from "utils/Dates"

import { FlowLayout } from "components/Common/Layout"
import { TextArea } from "components/Common/Inputs"
import { Button } from "components/Common/Buttons"

import { ChatEditor } from "components/Pages/Chats/ChatEditor"

import { PeopleChat, PersonChat } from "components/Icons/Icons"

import chatAPI from "api/chatAPI"

function MessageEditor({ id, scrollTo = () => { } }) {
    const [content, setContent] = useState("")
    const [isSending, setSending] = useState(false)

    const isSendButtonDisabled = () => { return isSending || content === "" }

    return <div className="card-1">
        <div className="d-flex flex-row gap-2 align-items-center">
            <TextArea rows={1} className="flex-grow-1" value={content} placeholder="Write yout message here..."
                onChange={(ev) => setContent(ev.target.value)} />
            <Button className={'circle'} isDisabled={isSendButtonDisabled()} onClick={() => {
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

    const [date, time] = getDateAndTime(message?.createdAt)
    const [prevDate, _] = prev ? getDateAndTime(prev.createdAt) : [null, null]

    const isFromOther = !message.sender.includes(user.id)
    const changedSender = prev ? message.sender.toString() !== prev.sender.toString() : true
    const alignment = isFromOther ? 'left' : 'right'
    const senderUsername = users.find(i => i.id === message.senderId)?.username
    const gap = changedSender ? 'mt-2' : ''

    const deleteMessage = () => {
        chatAPI.deleteMessage(id, message.id).then(() => {}).catch(err => console.log(err))
    }

    return <>
        {date !== prevDate && <DateLabel date={date} />}
        <div className={`d-flex flex-column card-1 limit-width ${alignment} ${gap}`}>
            {isFromOther && changedSender && <p className="crd-title-small fore-2">{senderUsername}</p>}
            <p className="m-0">{message.content}</p>
            <div className="d-flex flex-row gap-1 align-items-center">
                <p className="crd-subtitle pr-2 flex-grow-1">{time}</p>
                {isExpanded ? <>
                    <TrashFill className="fore-2-btn" onClick={() => deleteMessage()} />
                    <ChevronRight onClick={() => setExpanded(false)} className="fore-2-btn" />
                </> : <ThreeDots onClick={() => setExpanded(true)} className="fore-2-btn" />}
            </div>
        </div>
    </>
}

function EmptyMessages() {
    return <div className="d-flex justify-content-center align-items-center flex-grow-1">
        <div className="card-1">
            <p className="text-center m-0"><b>Wow, such an empty!</b></p>
            <p className="text-center crd-subtitle">All the exhcnaged messages will be shown here!</p>
        </div>
    </div>
}

function Chat({ user }) {
    const { id } = useParams()

    const [chat, setChat] = useState({})
    const [users, setUsers] = useState([])

    const chatFlow = FlowState()
    const usersFlow = FlowState()

    const [messages, setMessages] = useState([])
    const [cursor, setCursor] = useState(null)
    const [isNextVisible, setNextVisible] = useState(true)
    const [isEditing, setEditing] = useState(false)

    const lastRef = useRef(null)
    const scrollToLast = () => { lastRef.current?.scrollIntoView() }

    const [subscribe, unsubscribe] = useContext(WebSocketContext)

    const getChat = (options) => {
        chatFlow.setLoading()
        chatAPI.getChat(id, options).then(chat => {
            setChat(chat)
            chatFlow.setReady()
        }).catch(err => {
            console.log(err)
            chatFlow.setError()
        })
    }

    const getChatUsers = (options) => {
        chatAPI.getChatUsers(id, options).then(users => {
            setUsers(users)
            usersFlow.setReady()
        }).catch(err => {
            console.log(err)
            usersFlow.setError()
        })
    }

    const getMessages = ({ scrollTo = false, ...options } = {}) => {
        chatAPI.getMessages(id, cursor, options).then(({ messages, nextCursor }) => {
            if (nextCursor) setCursor(nextCursor)
            else setNextVisible(false)
            const revMessages = messages.reverse()
            setMessages(p => [...revMessages, ...p])
            if (scrollTo) scrollToLast()
        }).catch(err => console.log(err))
    }

    useEffect(() => {
        const controller = new AbortController()

        getChat({ signal: controller.signal })
        getChatUsers({ signal: controller.signal })
        getMessages({ scrollTo: true, signal: controller.signal })

        const channelCreateMessage = channelTypes.createMessageInChat(id)
        subscribe(channelCreateMessage, (message) => setMessages(p => [...p, message]))

        const channelDeleteMessage = channelTypes.deleteMessageInChat(id)
        subscribe(channelDeleteMessage, (message) => setMessages(p => p.filter(i => i.id !== message.id)))

        return () => {
            controller?.abort()
            unsubscribe(channelCreateMessage)
            unsubscribe(channelDeleteMessage)
        }
    }, [])

    const getChatName = () => { return chat.isGroup ? chat.name : `Chat with ${users.find(u => u.id !== user.id)?.username}` }

    return <div className="d-flex flex-column flex-grow-1 align-self-stretch mt-2 gap-3">
        {isEditing ?
            <ChatEditor user={user} chat={chat} setChat={setChat} users={users} setUsers={setUsers} close={() => setEditing(false)} /> :
            <>
                <FlowLayout state={chatFlow.toString()}>
                    <loading></loading>
                    <ready>
                        <div className="d-flex flex-row card-1 align-items-center gap-2">
                            {chat.isGroup ? <PeopleChat className="size-2" /> : <PersonChat className="size-2" />}
                            <div className="d-flex flex-column flex-grow-1">
                                <p className="crd-title">{getChatName()}</p>
                                {chat.isGroup && <p className="crd-subtitle">{`${users?.length} users`}</p>}
                            </div>
                            {chat.isGroup && <Button className='circle' onClick={() => setEditing(true)}><ThreeDotsVertical className="fore-2-btn size-1" /></Button>}
                        </div>
                    </ready>
                    <error></error>
                </FlowLayout>
                <div className="d-flex flex-column flex-grow-1 h-0 gap-2 scroll-y">
                    {isNextVisible && <Button onClick={() => getMessages()}>Get Previous Messages...</Button>}
                    {messages.length === 0 && <EmptyMessages />}
                    {messages.map((message, i, arr) => <MessageCard key={message.id}
                        id={id}
                        message={message}
                        user={user}
                        prev={i > 0 ? arr[i - 1] : null}
                        users={users} />)}
                    <div ref={lastRef} />
                </div>
                <MessageEditor id={id} scrollTo={scrollToLast} />
            </>}
    </div>
}

export { Chat }