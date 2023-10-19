import { useContext, useEffect, useRef, useState } from 'react'
import { InfoCircle, XCircle } from 'react-bootstrap-icons'

import './Push.css'
import 'styles/style.css'

import { WebSocketContext, channelTypes } from 'components/Ws/WsContext'

function Notification({ notification, onClose, delay = 4000 }) {
    const refOnClose = useRef(onClose)
    useEffect(() => {
        const timeout = setTimeout(() => refOnClose.current(), delay)
        return () => clearTimeout(timeout)
    }, [delay])

    return <div className='d-flex flex-row align-items-center card-1 gap-2 box-glow'>
        <InfoCircle className='fore-2 size-2 flex-shrink-0' />
        <div className='d-flex flex-column flex-grow-1' style={{ minWidth: 0 }}>
            <p className='crd-subtitle text-truncate'>{notification.title}</p>
            <p className='m-0 text-truncate'>{notification.text}</p>
        </div>
        <XCircle className='fore-2-btn size-1 flex-shrink-0' onClick={() => onClose()} />
    </div>
}

function PushContainer({ maxNoticationsN = 4 }) {
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
                title: message.chatName ? `Message from ${message.senderUsername} in ${message.chatName}` : `Message from ${message.senderUsername}`,
                text: message.content
            })
        })
        return () => { unsubscribe(channelDefault) }
    }, [maxNoticationsN, subscribe, unsubscribe])

    return <div className='push-wrapper adaptive-p'>
        {notifications?.map(n => {
            return <Notification key={n.id} notification={n}
                onClose={() => removeNotication(n)} />
        })}
    </div>
}

export { PushContainer }