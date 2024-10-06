import { useEffect, useRef } from 'react'

function useWS(user) {
    const ws = useRef(null)
    const channels = useRef({})

    const subscribe = (channel, callback) => {
        channels.current[channel] = callback
    }

    const unsubscribe = (channel) => {
        delete channels.current[channel]
    }

    useEffect(() => {
        if (!user) {
            // if user is absent ws cannot be opened
            // if ws is open a logout was performed => close ws
            ws.current?.close()
            return
        }
        const wsURL = new URL(process.env.REACT_APP_WSS_URL)
        ws.current = new WebSocket(`ws://${window.location.hostname}:${wsURL.port}`)
        ws.current.onopen = () => { console.log('WS open') }
        ws.current.onclose = () => { console.log('WS close') }
        ws.current.onmessage = (message) => {
            const { type, chat, ...data } = JSON.parse(message.data)
            const chatChannel = `${type}_${chat}`
            // lookup for a listening (is rendered) chat on message create or delete
            // if no chat is listening (is rendered) send message into generic channel for push mechanism
            if (channels.current[chatChannel]) channels.current[chatChannel](data)
            else channels.current[type]?.(data)
        }
        return () => { ws.current.close() }
    }, [user])

    return [ subscribe, unsubscribe ]
}

export default useWS