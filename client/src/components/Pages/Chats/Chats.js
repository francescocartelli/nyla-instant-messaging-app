import { useEffect, useState } from "react"
import { ChevronRight, PlusCircleFill } from "react-bootstrap-icons"
import { Link } from "react-router-dom"

import { PagesControl } from "components/Common/Layout"

import { PeopleChat, PersonChat } from "components/Icons/Icons"
import { Button, LinkButton } from "components/Common/Buttons"

import { getDateAndTime } from "utils/Dates"

import chatAPI from "api/chatAPI"


function ChatCard({ chat }) {
    const [date, time] = getDateAndTime(chat.updatedAt)

    return <div className="row-center card-1">
        <div className="crd-icon">{chat.isGroup ? <PeopleChat className="size-2" /> : <PersonChat className="size-2" />}</div>
        <div className="d-flex flex-column flex-grow-1">
            <p className="crd-title">{chat.name}</p>
            <p className="crd-subtitle c-gray">Last activity on {date} at {time}</p>
            {chat.nChatters > 1 && <p>{chat.nChatters}</p>}
        </div>
        <Link to={`/chats/${chat.id}`}><ChevronRight className="size-2 fore-2-btn" /></Link>
    </div>
}

function NewChatButton() {
    const [isVisible, setVisible] = useState(false)

    return isVisible ?
        <div className="d-flex flex-row gap-2">
            <LinkButton className="col" to='/users'>Direct<PersonChat className="size-1" /></LinkButton>
            <LinkButton className="col" to='/chats/new'>Group<PeopleChat className="size-1" /></LinkButton>
        </div> :
        <Button onClick={() => setVisible(true)}>New Chat <PlusCircleFill className="size-1" /></Button>
}

function PersonalChats() {
    const [chats, setChats] = useState([])
    const [chatsPage, setChatsPage] = useState(1)
    const [chatsNPages, setChatsNPages] = useState(0)

    useEffect(() => {
        const controller = new AbortController()

        chatAPI.getChatPersonal(chatsPage, { signal: controller.signal }).then(({ page, nPages, chats }) => {
            setChatsNPages(nPages)
            setChats([...chats])
        }).catch(err => {
            console.log(err)
        })

        return () => { controller?.abort() }
    }, [chatsPage])

    return <div className="d-flex flex-column gap-3 mt-2 mb-2 align-self-stretch flex-grow-1 scroll-y h-0">
        <NewChatButton />
        <div className="d-flex flex-column gap-3 flex-grow-1">
            {chats.map(chat => <ChatCard key={chat.id} chat={chat} />)}
        </div>
        <div className="align-self-center">
            <PagesControl page={chatsPage} nPages={chatsNPages}
                onClick={(value) => setChatsPage(value)} />
        </div>
    </div>
}

export { PersonalChats }
