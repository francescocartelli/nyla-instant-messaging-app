import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { Check2 } from "react-bootstrap-icons"

import './Chats.css'

import { FlowState } from "utils/Utils"

import { FlowLayout } from "components/Common/Layout"
import { TextArea } from "components/Common/Inputs"
import { Button } from "components/Common/Buttons"

import chatAPI from "api/chatAPI"
import dayjs from "dayjs"

function MessageEditor({ scrollTo }) {
    const { id } = useParams()
    const [content, setContent] = useState("")

    return <div className="card-1">
        <div className="d-flex flex-row gap-2 align-items-center">
            <TextArea rows={1} className="flex-grow-1" value={content} placeholder="Write yout message here..."
                onChange={(ev) => setContent(ev.target.value)} />
            <div className="">
                <Button onClick={() => {
                    chatAPI.sendMessage(id, { content: content }).then(() => {
                        setContent("")
                        scrollTo()
                    }).catch(err => {
                        console.log(err)
                    })
                }}><Check2 /></Button>
            </div>
        </div>
    </div>
}

function MessageCard({ message, user }) {
    const createdAtDt = dayjs(message.createdAt)
    const time = createdAtDt.format('HH:mm')

    const isMineMessage = message.sender.includes(user.id)
    const alignment = isMineMessage ? 'right' : 'left'

    return <div className={`d-flex flex-column card-1 limit-width ${alignment}`}>
        {!isMineMessage && <p className="crd-title">{message.sender}</p>}
        <p className="m-0">{message.content}</p>
        <p className="crd-subtitle">{time}</p>
    </div>
}

function Chat({ user }) {
    const { id } = useParams()

    const [chat, setChat] = useState({})
    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState([])
    const [messagePaging, setMessagesPaging] = useState({ page: 0, nPages: 0 })

    const chatFlow = FlowState()
    const usersFlow = FlowState()
    const messagesFlow = FlowState()

    const lastMessageRef = useRef(null)
    const nextRef = useRef(null)

    useEffect(() => {
        chatFlow.setLoading()
        chatAPI.getChat(id).then(chat => {
            setChat(chat)
            chatFlow.setReady()
        }).catch(err => {
            console.log(err)
            chatFlow.setError()
        })

        chatAPI.getChatUsers(id).then(users => {
            setUsers(users)
            usersFlow.setReady()
        }).catch(err => {
            console.log(err)
            usersFlow.setError()
        })

        getMessages()

        scrollToLast()
    }, [id])

    const getMessages = (nextPage = 0) => {
        chatAPI.getMessages(id, nextPage).then(({ messages, ...paging }) => {
            setMessagesPaging(paging)
            setMessages(p => nextPage === 0 ? [...messages] : [...p, ...messages])
        }).catch(err => console.log(err))

        scrollToNext()
    }

    const scrollToLast = () => { lastMessageRef.current.scrollIntoView() }
    const scrollToNext = () => { nextRef.current.scrollIntoView() }

    return <div className="d-flex flex-column flex-grow-1 align-self-stretch mt-2 mb-2">
        <FlowLayout state={chatFlow.toString()}>
            <loading></loading>
            <ready>
                <div className="card-1">
                    <p className="crd-title">{chat.name}</p>
                    <p className="crd-subtitle">{`${users?.length} users`}</p>
                </div>
            </ready>
            <error></error>
        </FlowLayout>
        <div className="d-flex flex-column-reverse flex-grow-1 h-0 gap-2 scroll-y">
            <div ref={lastMessageRef}></div>
            {messages.map((message, i) => <MessageCard key={i} message={message} user={user} />)}
            <Button onClick={() => {
                getMessages(messagePaging.page + 1)
                scrollToNext()
            }}>Get Previous Messages...</Button>
            <div ref={nextRef}></div>
        </div>
        <MessageEditor scrollTo={scrollToLast} />
    </div>
}

export { Chat }