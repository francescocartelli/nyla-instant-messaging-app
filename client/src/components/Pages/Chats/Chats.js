import { useEffect, useState } from "react"
import { ArrowDown, ArrowUp, ChevronRight, PlusCircleFill, Sliders, XCircleFill } from "react-bootstrap-icons"
import { Link } from "react-router-dom"

import { ErrorAlert, LoadingAlert } from "components/Alerts/Alerts"
import { Button, LinkButton } from "components/Common/Buttons"
import { StatusLayout, PagesControl } from "components/Common/Layout"
import { PeopleChat, PersonChat } from "components/Icons/Icons"

import { getDateAndTime } from "utils/Dates"
import { useStatus } from "hooks/useStatus"

import chatAPI from "api/chatAPI"

function ChatCard({ chat }) {
    const [date, time] = getDateAndTime(chat.updatedAt)

    return <div className="row-center card-1">
        <div className="crd-icon-30">{chat.isGroup ? <PeopleChat className="size-2" /> : <PersonChat className="size-2" />}</div>
        <div className="d-flex flex-column flex-grow-1">
            <p className="crd-title">{chat.name}</p>
            <p className="crd-subtitle c-gray">Last activity on {date} at {time}</p>
        </div>
        <Link to={`/chats/${chat.id}`}><ChevronRight className="size-2 fore-2-btn" /></Link>
    </div>
}

function NewChatButton() {
    return <div className="d-flex flex-row gap-2">
        <LinkButton className="col" to="/users">Direct<PersonChat className="size-1" /></LinkButton>
        <LinkButton className="col" to="/chats/new">Group<PeopleChat className="size-1" /></LinkButton>
    </div>
}

function ChatsOptions({ isAsc = false, setAsc = () => { } }) {
    return <div className="d-flex flex-row align-items-center gap-2">
        <span className="fore-2"><i>Sort chats by date: <b>{isAsc ? "ascending" : "descending"}</b></i></span>
        <Button onClick={() => setAsc(p => !p)}>
            {isAsc ?
                <ArrowUp className="fore-1 size-1" /> :
                <ArrowDown className="fore-1 size-1" />}
        </Button>
    </div>
}

function PersonalChats() {
    const [chats, setChats] = useState([])
    const [chatsPage, setChatsPage] = useState(1)
    const [chatsNPages, setChatsNPages] = useState(0)
    const [isAsc, setAsc] = useState(false)

    const [selectedOption, setSelectedOption] = useState("none")

    const [chatsStatus, chatsStatusActions] = useStatus()

    useEffect(() => {
        const controller = new AbortController()
        chatsStatusActions.setLoading()
        chatAPI.getChatPersonal(chatsPage, isAsc, { signal: controller.signal }).then(({ page, nPages, chats }) => {
            chatsStatusActions.setReady()
            setChatsNPages(nPages)
            setChats([...chats])
        }).catch(err => {
            chatsStatusActions.setError()
            console.log(err)
        })
        return () => {
            controller?.abort()
            setChats([])
        }
    }, [chatsPage, chatsStatusActions, isAsc])

    const onClickChatsPage = (value) => setChatsPage(value)
    const toggleOptions = (option) => setSelectedOption(selectedOption === option ? "none" : option)

    return <div className="d-flex flex-column gap-3 mt-2 mb-2 align-self-stretch flex-grow-1 ">
        <div className="d-flex flex-column gap-3 align-self-stretch flex-grow-1 scroll-y h-0">
            <div className="d-flex flex-wrap gap-2">
                <Button onClick={() => toggleOptions("group")}><PlusCircleFill className="fore-2-btn size-1" /></Button>
                <Button onClick={() => toggleOptions("order")}><Sliders className="fore-2 size-1" /></Button>
                <div className="flex-grow-1"></div>
                <StatusLayout status={selectedOption}>
                    <none></none>
                    <group><NewChatButton /></group>
                    <order><ChatsOptions isAsc={isAsc} setAsc={setAsc} /></order>
                </StatusLayout>
                {selectedOption !== "none" && <Button onClick={() => setSelectedOption("none")}><XCircleFill className="fore-2 size-1" /></Button>}
            </div>
            <div className="d-flex flex-column gap-3 flex-grow-1">
                <StatusLayout status={chatsStatus}>
                    <loading><LoadingAlert /></loading>
                    <ready>{chats.map(chat => <ChatCard key={chat.id} chat={chat} />)}</ready>
                    <error><ErrorAlert /></error>
                </StatusLayout>
            </div>
        </div>
        <div className="align-self-center">
            <PagesControl page={chatsPage} nPages={chatsNPages} onClick={onClickChatsPage} />
        </div>
    </div>
}

export { PersonalChats }
