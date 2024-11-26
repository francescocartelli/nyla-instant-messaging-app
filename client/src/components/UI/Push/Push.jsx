import { useContext, useEffect, useRef, useState } from 'react'
import { InfoCircle, XCircle } from 'react-bootstrap-icons'
import { useNavigate } from 'react-router'

import './Push.css'
import '@/styles/style.css'

import { flatRTNodes } from '@/components/SEditor/utils'
import { WebSocketContext, channelTypes } from '@/components/Ws/WsContext'

function Notification({ title, text, onClick, onClose, delay = 4000 }) {
    const refOnClose = useRef(onClose)
    useEffect(() => {
        const timeout = setTimeout(() => refOnClose.current(), delay)
        return () => clearTimeout(timeout)
    }, [delay])

    return <div className='d-flex flex-row align-items-center card-1 gap-2 box-glow' onClick={() => { onClick(); onClose() }}>
        <InfoCircle className='fore-2 size-2 flex-shrink-0' />
        <div className='d-flex flex-column flex-grow-1' style={{ minWidth: 0 }}>
            <span className='fore-2 fs-80 text-truncate'>{title}</span>
            <span className='m-0 push-text'>{text}</span>
        </div>
        <XCircle className='fore-2-btn size-1 flex-shrink-0' onClick={(ev) => { ev.stopPropagation(); onClose() }} />
    </div>
}

function PushContainer({ maxNoticationsN = 4 }) {
    const navigate = useNavigate()

    const [notifications, setNotifications] = useState([])
    const [subscribe, unsubscribe] = useContext(WebSocketContext)

    const removeNotication = ({ id }) => setNotifications(p => p.filter(i => i.id !== id))

    useEffect(() => {
        // add notication and limit the number by removing the first if max is reached
        const addNotification = (notification) => setNotifications(p => {
            return p.length >= maxNoticationsN ? [...p.slice(1), notification] : [...p, notification]
        })

        const channelDefault = channelTypes.createMessage()
        subscribe(channelDefault, ({ message }) => {
            addNotification({
                id: message.id,
                onClick: () => { navigate(`/chats/${message.idChat}`) },
                title: message.chatName ? <>Message from <b>{message.senderUsername}</b> in <b>{message.chatName}</b></> : <>Message from <b>{message.senderUsername}</b></>,
                text: flatRTNodes(message.content)
            })
        })
        return () => { unsubscribe(channelDefault) }
    }, [maxNoticationsN, subscribe, unsubscribe, navigate])

    return <div className='push-wrapper adaptive-p'>
        {notifications?.map(({ id, ...n }) => <Notification key={id} {...n} onClose={() => removeNotication({ id })} />)}
    </div>
}

export { PushContainer }