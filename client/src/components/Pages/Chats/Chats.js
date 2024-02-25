import { useEffect, useState } from "react"
import { ArrowDownUp, ChevronRight, ClockHistory, Funnel, PeopleFill, PlusCircleFill, SortNumericDown, SortNumericUp, XCircleFill } from "react-bootstrap-icons"
import { Link } from "react-router-dom"

import { useStatus, useRelativeDateTime } from "hooks"

import { Button, LinkButton } from "components/Common/Buttons"
import { StatusLayout, PagesControl, Tab } from "components/Common/Layout"
import { PeopleChat, PersonChat } from "components/Icons/Icons"
import { InformationBox, SomethingWentWrong } from "components/Common/Misc"

import chatAPI from "api/chatAPI"

function ChatCard({ chat, relativeDateTime }) {
    return <div className="row-center card-1">
        <div className="crd-icon-30">{chat.isGroup ? <PeopleChat className="size-2" /> : <PersonChat className="size-2" />}</div>
        <div className="d-flex flex-column flex-grow-1">
            <span className="fs-110">{chat.name}</span>
            <div className="d-flex flex-row align-items-center gap-3">
                <span className="text-nowrap fs-80 fore-2"><ClockHistory className="size-1 fore-2" /> <i>Last activity <b>{relativeDateTime}</b> ago</i></span>
                {chat.isGroup && <span className="text-nowrap fs-80 fore-2"><PeopleFill className="size-1 fore-2" /> <i><b>{chat.nUsers}</b> users</i></span>}
            </div>
        </div>
        <Link to={`/chats/${chat.id}`}><ChevronRight className="size-2 fore-2-btn" /></Link>
    </div>
}

function ChatCardSketeleton() {
    return <div className="row-center card-1" style={{ opacity: 0.5 }}>
        <div className="skeleton skeleton-icon-round-3">_</div>
        <div className="d-flex flex-column flex-grow-1 gap-2">
            <span className="skeleton skeleton-text fs-110">_</span>
            <div className="d-flex flex-row align-items-center gap-2 fs-80">
                <span className="skeleton skeleton-text">_</span>
                <span className="skeleton skeleton-text">_</span>
            </div>
        </div>
        <div className="skeleton skeleton-icon-squared-2">_</div>
    </div>
}

function NewChatButton() {
    return <div className="d-flex flex-row gap-2">
        <LinkButton className="col" to="/users">Direct<PersonChat className="size-1" /></LinkButton>
        <LinkButton className="col" to="/chats/new">Group<PeopleChat className="size-1" /></LinkButton>
    </div>
}

function OrderOption({ isAsc = false, setAsc = () => { } }) {
    return <div className="d-flex flex-row gap-2 align-items-center">
        <span className="fore-2 text-nowrap"><i>Sorted by date: <b>{isAsc ? "ascending" : "descending"}</b></i></span>
        <Button onClick={() => setAsc(p => !p)}>
            {isAsc ?
                <SortNumericUp className="fore-1 size-1" /> :
                <SortNumericDown className="fore-1 size-1" />}
        </Button>
    </div>
}

function FilterOption({ isGroup = false, setGroup = () => { }, onReset = () => { } }) {
    const onSetGroupClick = (value) => {
        setGroup(value)
        onReset()
    }

    return <div className="d-flex flex-row gap-2 align-items-center">
        <span className="fore-2 text-nowrap"><i>Filter by:</i></span>
        <div className="d-flex flex-row gap-2 align-items-center">
            <div className="tabs-layout card-1 gap-1 p-0">
                <Tab onClick={() => onSetGroupClick(null)} isActive={isGroup === null}>None</Tab>
                <Tab onClick={() => onSetGroupClick(true)} isActive={isGroup === true}>Group</Tab>
                <Tab onClick={() => onSetGroupClick(false)} isActive={isGroup === false}>Direct</Tab>
            </div>
        </div>
    </div>
}

function PersonalChats() {
    const [chats, setChats] = useState([])
    const [chatsPage, setChatsPage] = useState(1)
    const [chatsNPages, setChatsNPages] = useState(0)
    const [isAsc, setAsc] = useState(false)
    const [isGroup, setGroup] = useState(null)
    const [selectedOption, setSelectedOption] = useState("none")

    const [chatsStatus, chatsStatusActions] = useStatus()

    const getRelative = useRelativeDateTime()

    useEffect(() => {
        const controller = new AbortController()
        chatsStatusActions.setLoading()
        chatAPI.getChatPersonal(chatsPage, isAsc, isGroup, { signal: controller.signal })
            .then(({ page, nPages, chats }) => {
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
    }, [chatsPage, chatsStatusActions, isAsc, isGroup])

    const onClickChatsPage = (value) => setChatsPage(value)
    const toggleOptions = (option) => setSelectedOption(selectedOption === option ? "none" : option)

    return <div className="d-flex flex-column gap-3 mt-2 mb-2 align-self-stretch flex-grow-1">
        <div className="d-flex flex-column gap-3 align-self-stretch flex-grow-1">
            <div className="d-flex flex-row gap-2 scroll-x">
                <div className={`flex-row gap-2 ${selectedOption !== "none" ? "hide-small" : "d-flex"}`}>
                    <Button onClick={() => toggleOptions("group")}><PlusCircleFill className="fore-2-btn size-1" /></Button>
                    <Button onClick={() => toggleOptions("order")} disabled={chats.length < 2}><ArrowDownUp className="fore-2 size-1" /></Button>
                    <Button onClick={() => toggleOptions("filter")} disabled={chats.length < 2}><Funnel className="fore-2 size-1" /></Button>
                </div>
                <div className="flex-grow-1"></div>
                <StatusLayout status={selectedOption}>
                    <none></none>
                    <group><NewChatButton /></group>
                    <order><OrderOption isAsc={isAsc} setAsc={setAsc} /></order>
                    <filter><FilterOption isGroup={isGroup} setGroup={setGroup} onReset={() => setChatsPage(1)} /></filter>
                </StatusLayout>
                {selectedOption !== "none" && <Button onClick={() => setSelectedOption("none")}><XCircleFill className="fore-2 size-1" /></Button>}
            </div>
            <div className="d-flex flex-column gap-3 flex-grow-1 scroll-y h-0">
                <StatusLayout status={chatsStatus}>
                    <loading>
                        {[...Array(10).keys()].map((i) => <ChatCardSketeleton key={`chat-skeleton-${i}`}/>)}
                    </loading>
                    <ready>
                        {chats.length === 0 && <InformationBox title="Wow, such an empty!" subtitle="All the chats related to you will be shown here!" />}
                        {chats.map(chat => <ChatCard key={chat.id} chat={chat} relativeDateTime={getRelative(chat.updatedAt)} />)}
                    </ready>
                    <error><SomethingWentWrong explanation="It is not possible to load your personal chats!" /></error>
                </StatusLayout>
            </div>
        </div>
        <div className="align-self-center">
            <PagesControl page={chatsPage} nPages={chatsNPages} onClick={onClickChatsPage} />
        </div>
    </div>
}

export { PersonalChats }
