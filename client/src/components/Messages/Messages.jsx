import { useMemo } from 'react'
import { BugFill, Hourglass, TrashFill } from 'react-bootstrap-icons'

import { ShowMoreLayout } from '@/components/Commons/Layout'
import { RTViewer } from '@/components/SEditor'

function DateLabel({ date }) {
    return <div className="d-flex align-items-center card-2 text-center align-self-center">
        <span className="fs-80 fore-2 pr-2 pl-2">{date}</span>
    </div>
}

function MessageCard({ message, isGroup, prev, onDelete }) {
    const isDateVisible = useMemo(() => prev?.createdAtDate !== message.createdAtDate, [prev, message.createdAtDate])
    const isSenderChanged = useMemo(() => !prev || (message.idSender?.toString() !== prev?.idSender.toString()), [message, prev])
    const isSenderVisible = useMemo(() => isGroup && message.isFromOther && isSenderChanged, [isGroup, message, isSenderChanged])
    const isRichText = useMemo(() => (typeof message.content) !== "string", [message])

    const onDeleteMessageClick = () => onDelete(message)

    return <>
        {isDateVisible && <DateLabel date={message.createdAtDate} />}
        <div className={`d-flex flex-column card-1 min-w-100 message-card-width break-word ${message.isFromOther ? "align-self-start" : "align-self-end"} ${isSenderChanged ? "mt-2" : ""}`}>
            {isSenderVisible && <span className="fore-2 fs-80 fw-600">{message.senderUsername}</span>}
            {isRichText ? <RTViewer value={message.content} /> : <p className="m-0 text-wrap">{message.content}</p>}
            <div className="d-flex flex-row gap-1 align-items-center">
                <span className="fore-2 fs-70 pr-2 flex-grow-1">{message.createdAtTime}</span>
                {!message.isFromOther && <>
                    {message.isError && <BugFill className="fore-2" />}
                    {message.isPending && <Hourglass className="fore-2" />}
                    {!message.isPending && !message.isError && <ShowMoreLayout>
                        <TrashFill className="fore-2-btn" onClick={onDeleteMessageClick} />
                    </ShowMoreLayout>}
                </>}
            </div>
        </div>
    </>
}

function SkeletonMessageCard({ message }) {
    return <div className={`d-flex flex-column card-1 min-w-100 message-card-width break-word gap-1 ${message.isFromOther ? "align-self-start" : "align-self-end"} ${message.isSenderChanged ? "mt-2" : ""}`}>
        {message.isFromOther && message.isSenderChanged && <span className="fore-2 fs-80 fw-600 skeleton">_</span>}
        <p className="m-0 text-wrap skeleton">{message.content}</p>
        <div className="d-flex flex-row gap-1 align-items-center">
            <span className="fore-2 fs-70 pr-2 flex-grow-1 skeleton">_</span>
            <span className="fore-2 fs-70 pr-2 flex-grow-1 skeleton">_</span>
        </div>
    </div>
}

function SkeletonMessages() {
    return <>
        <SkeletonMessageCard message={{ content: "__________________________________________________________________________________________", isFromOther: true }} />
        <SkeletonMessageCard message={{ content: "__________________________________________________________________________________________", isFromOther: true }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "______________________________", isFromOther: true }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________", isFromOther: true }} />
        <SkeletonMessageCard message={{ content: "__________________________________________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "______________________________", isFromOther: true, isSenderChanged: true }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "______________________________", isFromOther: true, isSenderChanged: true }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "__________________________________________________________________________________________", isFromOther: true }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________", isFromOther: true, isSenderChanged: true }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________", isFromOther: true }} />
        <SkeletonMessageCard message={{ content: "__________________________________________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "______________________________", isFromOther: true, isSenderChanged: true }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "______________________________", isFromOther: true, isSenderChanged: true }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________" }} />
        <SkeletonMessageCard message={{ content: "______________________________________________________________" }} />
    </>
}

export { MessageCard, SkeletonMessages }
