import { useMemo, useState } from "react"

export function useMessages(messageMapping) {
    const [messages, setMessages] = useState([])

    const actions = useMemo(() => ({
        update: (id, message) =>
            setMessages(p => {
                const idx = p.findIndex(m => m.id === id)
                if (idx === -1) return p

                const n = [...p]

                const prev = n[idx - 1]
                n[idx] = messageMapping({ ...n[idx], ...message }, prev)

                if (n[idx + 1]) {
                    n[idx + 1] = messageMapping(n[idx + 1], n[idx])
                }

                return n
            }),
        append: message =>
            setMessages(p => {
                const prev = p[p.length - 1]
                return [...p, messageMapping(message, prev)]
            }),
        prepend: message =>
            setMessages(p => {
                const first = messageMapping(message, undefined)

                if (p[0]) {
                    p = [
                        messageMapping(p[0], first),
                        ...p.slice(1)
                    ]
                }

                return [first, ...p]
            }),

        extend: messages =>
            setMessages(p => {
                const startPrev = p[p.length - 1]

                const mapped = messages.reduce((acc, m) => {
                    const prev = acc.length
                        ? acc[acc.length - 1]
                        : startPrev

                    acc.push(messageMapping(m, prev))
                    return acc
                }, [])

                return [...p, ...mapped]
            }),
        prextend: messages =>
            setMessages(p => {
                const mapped = messages.reduce((acc, m) => {
                    const prev = acc.length ? acc[acc.length - 1] : undefined
                    acc.push(messageMapping(m, prev))
                    return acc
                }, [])

                if (p[0]) {
                    p = [
                        messageMapping(p[0], mapped[mapped.length - 1]),
                        ...p.slice(1)
                    ]
                }

                return [...mapped, ...p]
            }),
        delete: id =>
            setMessages(p => {
                const idx = p.findIndex(m => m.id === id)
                if (idx === -1) return p

                const n = [...p]
                const prev = n[idx - 1]

                n.splice(idx, 1)

                if (n[idx]) {
                    n[idx] = messageMapping(n[idx], prev)
                }

                return n
            })
    }), [messageMapping])

    return [messages, actions]
}