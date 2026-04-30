import { X } from 'react-bootstrap-icons'

import { Button } from '@/components/Commons/Buttons'
import { RTViewer } from '@/components/SEditor'

export default function ReplyToEditor({ replyTo, clearReplyTo }) {
    return <div className='d-flex flex-column gap-2 align-items-start card-1 mb-2'>
        <div className='d-flex flex-row align-items-center justify-content-between w-100'>
            <span className='fore-2 fs-80'>
                <i>replying to</i> <b>{replyTo.senderUsername}</b>
            </span>
            <Button className={"circle"} onClick={clearReplyTo}><X /></Button>
        </div>
        <RTViewer key={replyTo.id} value={replyTo.content} />
        <span className="d-flex flex-row gap-1 align-items-center fs-70 pr-2 flex-grow-1">
            <span className="fore-2 flex-grow-1">{replyTo.createdAtTime}</span>
        </span>
    </div>
}