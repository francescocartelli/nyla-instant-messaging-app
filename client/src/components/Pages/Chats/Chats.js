import { useEffect, useState } from "react"
import { ChevronRight, Controller, PlusCircleFill } from "react-bootstrap-icons"
import { Link } from "react-router-dom"

import { PagesControl } from "components/Common/Layout"

import { PeopleChat, PersonChat } from "components/Icons/Icons"
import { Button } from "components/Common/Buttons"

import chatAPI from "api/chatAPI"

function ChatCard({ chat }) {
    return <div className="row-center card-1">
        <div className="crd-icon">{
            chat.isGroup ? <PeopleChat className="size-2" /> : <PersonChat className="size-2" />
        }</div>
        <div className="d-flex flex-column flex-grow-1">
            <p className="crd-title">{chat.name}</p>
            <p className="crd-subtitle c-gray">last activity on {chat.lastEdit}</p>
            {chat.nChatters > 1 && <p>{chat.nChatters}</p>}
        </div>
        <Link to={`/chats/${chat.id}`}><ChevronRight className="size-2 fore-2-btn"/></Link>
    </div>
}

function PersonalChats() {
    const [chats, setChats] = useState([])
    const [chatsPaging, setChatsPaging] = useState({ page: 0, nPages: 0 })

    useEffect(() => {
        const controller = new AbortController()

        chatAPI.getChatPersonal(chatsPaging.page, { signal: controller.signal }).then(({ page, nPages, chats }) => {
            setChatsPaging({ page: page, nPages: nPages })
            setChats([...chats])
        }).catch(err => {
            console.log(err)
        })

        return () => { controller?.abort() }
    }, [chatsPaging.page])

    return <div className="d-flex flex-column gap-3 mt-2 mb-2 align-self-stretch flex-grow-1 scroll-y h-0">
        <Button>New Chat <PlusCircleFill className="size-1" /></Button>
        <div className="d-flex flex-column gap-3 flex-grow-1">
            {chats.map(chat => <ChatCard key={chat.id} chat={chat} />)}
        </div>
        <div className="align-self-center">
            <PagesControl page={chatsPaging.page} nPages={chatsPaging.nPages}
                onClick={(value) => setChatsPaging(p => { return { page: value, ...p } })} />
        </div>
    </div>
}

export { PersonalChats }
