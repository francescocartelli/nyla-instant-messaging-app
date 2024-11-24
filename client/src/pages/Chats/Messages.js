import { useCallback, useMemo, useState, useRef } from "react"
import { BugFill, Hourglass, TrashFill, Check2 } from "react-bootstrap-icons"

import { ShowMoreLayout } from "components/Commons/Layout"
import { Button } from "components/Commons/Buttons"
import { RTViewer } from "components/SEditor"
import { RTEditor, Toolbar } from "components/SEditor"

import { getDateAndTime, initialContent } from "./Utils"

function DateLabel({ date }) {
    return <div className="d-flex align-items-center card-2 text-center align-self-center">
        <span className="fs-80 fore-2 pr-2 pl-2">{date}</span>
    </div>
}

function MessageCard({ message, prev, onDelete }) {
    const [isDeleting, setDeleting] = useState(false)

    const [date, time] = getDateAndTime(message.createdAt)
    const [prevDate,] = getDateAndTime(prev?.createdAt)
    const isDateVisible = useMemo(() => prevDate !== date, [prevDate, date])
    const isSenderChanged = useMemo(() => !prev || (message.idSender?.toString() !== prev?.idSender.toString()), [message, prev])
    const isRichText = useMemo(() => (typeof message.content) !== "string", [message])

    const onClickMessageDelete = useCallback(() => {
        setDeleting(true)
        onDelete().then().catch(err => setDeleting(false))
    }, [onDelete, setDeleting])

    return <>
        {isDateVisible && <DateLabel date={date} />}
        <div className={`d-flex flex-column card-1 min-w-100 message-card-width break-word ${message.isFromOther ? "align-self-start" : "align-self-end"} ${isSenderChanged ? "mt-2" : ""}`}>
            {message.isFromOther && isSenderChanged && <span className="fore-2 fs-80 fw-600">{message.senderUsername}</span>}
            {isRichText ? <RTViewer value={message.content} /> : <p className="m-0 text-wrap">{message.content}</p>}
            <div className="d-flex flex-row gap-1 align-items-center">
                <span className="fore-2 fs-70 pr-2 flex-grow-1">{time}</span>
                {!message.isFromOther && <>
                    {message.isError && <BugFill className="fore-2" />}
                    {message.isPending && <Hourglass className="fore-2" />}
                    {!message.isPending && !message.isError && <ShowMoreLayout> {isDeleting ?
                        <Hourglass className="fore-2" /> :
                        <TrashFill className="fore-2-btn" onClick={onClickMessageDelete} />}
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

function MessageEditor({ onSendMessage, isDisabled }) {
    const [content, setContent] = useState(initialContent)
    const editorRef = useRef()

    const resetEditor = useCallback(() => {
        setContent(initialContent)
        editorRef.current.reset()
    }, [])

    const onSubmitMessage = ev => {
        ev.preventDefault()
        onSendMessage(content)
        resetEditor()
    }

    return <div className="d-flex flex-row gap-2 align-items-center card-1">
        <RTEditor value={content} setValue={setContent} toolbar={<Toolbar />} placeholder="Write yout message here..." ref={editorRef} />
        <form onSubmit={onSubmitMessage}>
            <Button type="submit" className={"circle"} disabled={isDisabled}><Check2 className="fore-success size-1" /></Button>
        </form>
    </div>
}

export { MessageCard, MessageEditor, SkeletonMessages }
