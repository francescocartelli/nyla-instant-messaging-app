import winston from 'winston'

import { WebSocket } from "ws"

import { createWSC } from "./wsc.ts"

type Callback = (params: {
    chat: string
    message: any
}) => void

type Routes = Record<string, Callback>

type Options = {
    filterMessage?: ((message: any) => boolean) | null
    fallbackBehavior?: Callback | null
    logger?: winston.Logger | null
}

export const createWSCRouter = (url: string, options: WebSocket.ClientOptions, routes: Routes, {
    filterMessage = null,
    fallbackBehavior = null,
    logger = null
}: Options = {}) => createWSC(url, options, {
    onOpen: () => {
        logger?.debug('WS open')
    },
    onClose: () => {
        logger?.debug('WS close')
    },
    onMessage: async payload => {
        try {
            const { type, chat, message } = JSON.parse(payload.data.toString())
            if (filterMessage?.(message)) return

            const behavior = routes[type]
            if (!behavior) return fallbackBehavior?.({ chat, message })

            await behavior({ chat, message })
        } catch (err) {
            logger?.error(err)
        }
    }
})