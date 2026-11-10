import { WebSocket } from "ws"

export type Callbacks = {
    onOpen: () => void
    onClose: () => void
    onMessage: (message: WebSocket.MessageEvent) => void
}

export type CreateWSC = (
    url: string,
    options: WebSocket.ClientOptions,
    callbacks: Callbacks
) => WebSocket

export const createWSC: CreateWSC = (url, options, {
    onOpen,
    onClose,
    onMessage
}) => {
    const _url = new URL(url)

    let wsc = new WebSocket(_url, options)

    wsc.onopen = onOpen
    wsc.onclose = onClose
    wsc.onmessage = onMessage

    return wsc
}