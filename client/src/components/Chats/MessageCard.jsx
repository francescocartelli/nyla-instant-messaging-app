import { useMemo, useState, useCallback } from 'react'
import { BugFill, Hourglass, PencilFill, TrashFill } from 'react-bootstrap-icons'

import { ShowMoreLayout } from '@/components/Commons/Layout'
import { RTViewer } from '@/components/SEditor'

import MessageEditor from './MessageEditor'

const fiveMinutesMillis = 5 * 60 * 1000

function DateLabel({ date }) {
    return <div className="d-flex align-items-center card-2 text-center align-self-center">
        <span className="fs-80 fore-2 pr-2 pl-2">{date}</span>
    </div>
}

function TimedPortal({ threshold, children }) {
    const isVisible = useMemo(() => (new Date()).getTime() < threshold, [threshold])

    return isVisible ? children : <></>
}

export default function MessageCard({ message, onUpdate, onDelete }) {
    const [isEdit, setEdit] = useState(false)

    const onUpdateContent = useCallback(content => {
        onUpdate({ ...message, content })
            .then(() => setEdit(false))
            .catch(() => setEdit(false))
    }, [message])

    const maxTimeThreshold = useMemo(() => (new Date(message.createdAt).getTime()) + fiveMinutesMillis, [message.createdAt])

    const isDeleted = useMemo(() => Boolean(message.deletedAt), [message.deletedAt])

    return <>
        {message.isDateVisible && <DateLabel date={message.createdAtDate} />}
        <div className={`d-flex flex-column card-1 min-w-100 message-card-width break-word ${message.isFromOther ? "align-self-start" : "align-self-end"} ${message.isSenderChanged ? "mt-2" : ""}`}
            style={{ width: isEdit ? '100%' : 'auto' }}>
            {message.isSenderVisible && !isDeleted && <span className="fore-2 fs-80 fw-600">{message.senderUsername}</span>}
            {message.content && <>
                {isEdit ?
                    <div className="d-flex flex-row gap-2 align-items-center">
                        <MessageEditor initial={message.content} onSendMessage={onUpdateContent} isDisabled={message.isPending} />
                    </div> : <>
                        {message.isRichText ?
                            <RTViewer key={message.updatedAt || ''} value={message.content} /> :
                            <p className="m-0 text-wrap">{message.content}</p>}
                    </>}
            </>}
            {isDeleted ? <i className="fore-2">message deleted...</i> : <div className="d-flex flex-row gap-2 align-items-center">
                <span className="d-flex flex-row gap-1 align-items-center fs-70 pr-2 flex-grow-1">
                    <span className="fore-2 flex-grow-1">{message.createdAtTime}</span>
                    {message.updatedAt && <span className="fore-2-neg message-card-tag">edited</span>}
                </span>
                {!message.isFromOther && <>
                    {message.isError && <BugFill className="fore-2" />}
                    {message.isPending && <Hourglass className="fore-2" />}
                    {!message.isPending && !message.isError && !isEdit && <ShowMoreLayout>
                        <TimedPortal threshold={maxTimeThreshold}>
                            <PencilFill className="fore-2-btn" onClick={() => setEdit(true)} />
                        </TimedPortal>
                        <TrashFill className="fore-2-btn" onClick={onDelete} />
                    </ShowMoreLayout>}
                </>}
            </div>}
        </div>
    </>
}
