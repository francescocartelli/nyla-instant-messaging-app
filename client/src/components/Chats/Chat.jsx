import { useEffect } from 'react'
import { KeyFill, QuestionCircle, ThreeDotsVertical } from 'react-bootstrap-icons'

import { Button } from '@/components/Commons/Buttons'
import { StatusLayout } from '@/components/Commons/Layout'
import { PeopleChat, PersonChat } from '@/components/Icons'

function ChatAlert({ icon, title, subtitle }) {
    return <>
        {icon}
        <div className='d-flex flex-column flex-grow-1'>
            <span className='fs-110 fw-500'>{title}</span>
            <span className='fs-80 fore-2'>{subtitle}</span>
        </div>
    </>
}

function Chat({ chat, chatStatus, isUnauthorized, onOpenChatEditor, onChatDelete, onDeleteChatSubscription }) {
    useEffect(() => {
        const unsubDeleteChat = onDeleteChatSubscription(onChatDelete)
        return unsubDeleteChat
    }, [onDeleteChatSubscription, onChatDelete])

    return <div className="d-flex flex-row card-1 align-items-center gap-2">
        <StatusLayout status={chatStatus}
            loading={<>
                <div className="skeleton skeleton-icon-round-2"></div>
                <div className="d-flex flex-column flex-grow-1 gap-1">
                    <span className="fs-110 skeleton skeleton-text">_</span>
                    <span className="fs-80 skeleton skeleton-text">_</span>
                </div>
            </>}
            ready={<>
                {chat.isGroup ? <PeopleChat className="size-2" /> : <PersonChat className="size-2" />}
                <div className="d-flex flex-column flex-grow-1">
                    <span className="fs-110 fw-500">{chat.chatName}</span>
                    {chat.isGroup && <span className="fs-80 fore-2">{`${chat.nUsers} users`}</span>}
                </div>
                <Button className="circle" onClick={onOpenChatEditor}><ThreeDotsVertical className="fore-2-btn size-1" /></Button></>}
            error={isUnauthorized ?
                <ChatAlert icon={<KeyFill className="size-2 fore-2" />} title="The requested chat is protected..." subtitle="You do not have permission to access to this chat" /> :
                <ChatAlert icon={<QuestionCircle className="size-2 fore-2" />} title="The requested chat cannot be loaded..." subtitle="Maybe the chat was deleted or the link is compromised" />}
        />
    </div>
}

export default Chat