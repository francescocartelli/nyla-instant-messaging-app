import { ChevronRight, ClockHistory, PeopleFill, SortNumericDown, SortNumericUp } from 'react-bootstrap-icons'
import { Link } from 'react-router-dom'

import { Button, LinkButton } from '@/components/Commons/Buttons'
import { Tab } from '@/components/Commons/Layout'
import { PeopleChat, PersonChat } from '@/components/Icons/Icons'

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

export { ChatCard, ChatCardSketeleton, FilterOption, NewChatButton, OrderOption }

