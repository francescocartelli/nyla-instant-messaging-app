const { createWSC } = require("./wsc")

const createWSCRouter = (url, options, routes, {
    filterMessage = null,
    fallbackBehavior = null,
    logger = null
} = {}) => createWSC(url, options, {
    onOpen: () => {
        logger?.debug('WS open')
    },
    onClose: () => {
        logger?.debug('WS close')
    },
    onMessage: async payload => {
        try {
            const { type, chat, message } = JSON.parse(payload.data)
            if (filterMessage?.(message)) return

            const behavior = routes[type]
            if (!behavior) return fallbackBehavior?.({ chat, message })

            await behavior({ chat, message })
        } catch (err) {
            logger?.error(err)
        }
    }
})

exports.createWSCRouter = createWSCRouter