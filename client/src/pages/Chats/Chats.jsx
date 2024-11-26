import { useEffect, useState } from 'react'
import { ArrowDownUp, ChevronRight, ClockHistory, Funnel, PeopleFill, PlusCircleFill, SortNumericDown, SortNumericUp, XCircleFill } from 'react-bootstrap-icons'
import { Link } from 'react-router-dom'

import { useStatus, useRelativeDateTime } from '@/hooks'

import { Button, LinkButton } from '@/components/Commons/Buttons'
import { StatusLayout, PagesControl, Tab, OptionsLayout } from '@/components/Commons/Layout'
import { InformationBox, SomethingWentWrong } from '@/components/Commons/Misc'

import { PeopleChat, PersonChat } from '@/components/Icons/Icons'

import chatAPI from '@/api/chatAPI'

function ChatCard({ chat, relativeDateTime }) {
    const spanClassname = "d-flex flex-row align-items-center text-nowrap fs-80 fore-2 gap-2"

    return <div className="row-center card-1">
        <div className="crd-icon-30">{chat.isGroup ? <PeopleChat className="size-2" /> : <PersonChat className="size-2" />}</div>
        <div className="d-flex flex-column flex-grow-1 oveflow-hidden ellipsis gap-1">
            <span className="fs-110">{chat.name}</span>
            <div className="row-col-small align-items-start adaptive-gap-4-1">
                <span className={spanClassname}><ClockHistory className="size-1 fore-2" /> <i>Last activity <b>{relativeDateTime}</b> ago</i></span>
                {chat.isGroup && <span className={spanClassname}><PeopleFill className="size-1 fore-2" /> <i><b>{chat.nUsers}</b> users</i></span>}
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
        <LinkButton className="col fore-1" to="/people">Direct<PersonChat className="size-1" /></LinkButton>
        <LinkButton className="col fore-1" to="/chats/new">Group<PeopleChat className="size-1" /></LinkButton>
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
        chatAPI.getChatPersonal(chatsPage, isAsc, isGroup)
            .then(res => res.json())
            .then(({ page, nPages, chats }) => {
                chatsStatusActions.setReady()
                setChatsNPages(nPages)
                setChats([...chats])
            })
            .catch(err => chatsStatusActions.setError())

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
                <OptionsLayout option={selectedOption} options={{
                    group: <NewChatButton />,
                    order: <OrderOption isAsc={isAsc} setAsc={setAsc} />,
                    filter: <FilterOption isGroup={isGroup} setGroup={setGroup} onReset={() => setChatsPage(1)} />
                }} />
                {selectedOption !== "none" && <Button onClick={() => setSelectedOption("none")}><XCircleFill className="fore-2 size-1" /></Button>}
            </div>
            <div className="d-flex flex-column gap-3 flex-grow-1 scroll-y h-0">
                <StatusLayout status={chatsStatus}
                    loading={[...Array(10).keys()].map((i) => <ChatCardSketeleton key={`chat-skeleton-${i}`} />)}
                    ready={<>
                        {chats.length === 0 && <InformationBox title="Wow, such an empty!" subtitle="All the chats related to you will be shown here!" />}
                        {chats.map(chat => <ChatCard key={chat.id} chat={chat} relativeDateTime={getRelative(chat.updatedAt)} />)}
                    </>}
                    error={<SomethingWentWrong explanation="It is not possible to load your personal chats!" />}
                />
            </div>
        </div>
        <div className="align-self-center">
            <PagesControl page={chatsPage} nPages={chatsNPages} onChangePage={onClickChatsPage} disabled={!chatsStatus.isReady} />
        </div>
    </div>
}

export { PersonalChats }
