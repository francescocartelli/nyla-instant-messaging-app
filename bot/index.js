const dotenv = require('dotenv')

const { providerEndpoints } = require('./services/llms')
const { sendMessage, getMessages } = require('./services/messages')
const { signBot } = require('./services/authenticate')

const createLogger = require('./utilities/Logger')
const { assistancePrompt, assistanceWithHistoryPrompt, messageToPrompt } = require('./utilities/prompts')
const { jwtTCookieHeader } = require('./utilities/CookieJWT')
const { flatRTNodes } = require('./utilities/RichText')
const { invokeFetch } = require('./utilities/network')
const { createWSCRouter } = require('./utilities/wscRouter')

dotenv.config()

const logger = createLogger(process.env.LOGGING_LEVEL)

const serviceUnavailableResponse = `I apologize, but I'm unable to assist you with this right now. Please feel free to reach out again later.`

const mapMessage = ({ idSender, content, createdAt, deletedAt }, id) => ({
    sender: idSender === id ? 'you' : 'user',
    content: content ? flatRTNodes(content) : null,
    createdAt,
    deletedAt
})

const flatMessageHistory = (messages, idUser) => {
    const mappedMessages = [...messages].reverse().map(message => mapMessage(message, idUser))
    const messagesPrompt = mappedMessages.map(messageToPrompt)

    return messagesPrompt.join('\n')
}

const getPrompt = async (message, chat, jwt, user) => {
    if (!process.env.HAS_HISTORY) {
        const flat = flatRTNodes(message.content)
        return assistancePrompt(flat)
    }

    const res = await getMessages(chat, jwt)
    const history = flatMessageHistory(res.messages, user.id)

    return assistanceWithHistoryPrompt(history)
}

const boot = async () => {
    let wsc = null

    try {
        const { user, jwt } = await signBot({
            username: process.env.BOT_USERNAME,
            password: process.env.BOT_PASSWORD,
            email: process.env.BOT_EMAIL
        })
        if (!jwt) return

        const createLLMEndpoint = providerEndpoints[process.env.LLM_PROVIDER]
        if (!createLLMEndpoint) {
            logger.error(`llm api provider "${process.env.LLM_PROVIDER}" not recognized`)
            logger.info(`supported providers: ${Object.keys(providerEndpoints).join(', ')}`)
            return
        }

        const fetchLLM = createLLMEndpoint({
            secret: process.env.LLM_API_KEY,
            endpoint: process.env.LLM_ENDPOINT,
            model: process.env.LLM_MODEL
        }, invokeFetch)

        logger.info(`Bot signed`)
        logger.debug(JSON.stringify(user))

        wsc = createWSCRouter(process.env.WSS_URL, { headers: jwtTCookieHeader(jwt) }, {
            'MESSAGE_CREATE': async ({ chat, message }) => {
                const prompt = await getPrompt(message, chat, jwt, user)
                logger.debug('request prompt:', prompt)

                let llmResponse = await fetchLLM(prompt)
                llmResponse = llmResponse || serviceUnavailableResponse

                logger.debug(`prompt response: ${llmResponse}`)

                sendMessage(chat, jwt, llmResponse)
            }
        }, {
            filterMessage: message => message.idSender === user.id,
            logger
        })
    } catch (err) {
        wsc?.close()

        logger.error(err)

        return
    }
}

boot()