import { useState } from 'react'
import { InfoCircle, XCircle } from 'react-bootstrap-icons'

import './Push.css'
import 'styles/style.css'

function Notification({ notification, onClose, delay = 5000 }) {
    useState(() => {
        const timeout = setTimeout(() => onClose(), delay)

        return () => clearTimeout(timeout)
    }, [])

    return <div className='d-flex flex-row align-items-center card-2 gap-2 box-glow'>
        <InfoCircle className='fore-2 size-2'/>
        <div className='d-flex flex-column flex-grow-1'>
            <p className='crd-subtitle'>{notification.title}</p>
            <p className='m-0'>{notification.text}</p>
        </div>
        <XCircle className='fore-2-btn size-1' onClick={() => onClose()} />
    </div>
}

function PushContainer({ notifications, setNotifications }) {
    return <div className='push-wrapper adaptive-p'>
        {notifications?.map(n => {
            return <Notification key={n.id} notification={n}
                onClose={() => setNotifications(p => p.filter(i => i.id !== n.id))} />
        })}
    </div>
}

export { PushContainer }