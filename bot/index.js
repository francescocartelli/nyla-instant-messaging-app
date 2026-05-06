const dotenv = require('dotenv')

const { providerEndpoints } = require('./services/llms')
const { sendMessage } = require('./services/messages')
const { signBot } = require('./services/authenticate')

const createLogger = require('./utilities/Logger')
const { assistancePrompt } = require('./utilities/prompts')
const { jwtTCookieHeader } = require('./utilities/CookieJWT')
const { flatRTNodes } = require('./utilities/RichText')
const { invokeFetch } = require('./utilities/network')
const { createWSC } = require('./utilities/wsc')

dotenv.config()

const logger = createLogger(process.env.LOGGING_LEVEL)

const bot = {
    username: process.env.BOT_USERNAME,
    password: process.env.BOT_PASSWORD,
    email: process.env.BOT_EMAIL
}

const createOnMessage = ({ user, jwt, fetchLLM, promptTemplate }) => async payload => {
    const { type, chat, message } = JSON.parse(payload.data)
    if (type !== 'MESSAGE_CREATE' || message.idSender === user.id) return

    const flat = flatRTNodes(message.content)
    logger.debug(`received message: ${flat}`)

    const text = await fetchLLM(promptTemplate(flat))
    if (!text) return

    logger.debug(`sending response: ${text}`)

    sendMessage(chat, jwt, text)
}

const boot = async () => {
    let wsc = null

    try {
        const { user, jwt } = await signBot(bot)
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

        wsc = createWSC(process.env.WSS_URL, { headers: jwtTCookieHeader(jwt) }, {
            onOpen: () => {
                logger.debug('WS open')
            },
            onClose: () => {
                logger.debug('WS close')
            },
            onMessage: createOnMessage({
                user,
                jwt,
                fetchLLM,
                promptTemplate: assistancePrompt
            })
        })
    } catch (err) {
        wsc?.close()

        logger.error(err)

        return
    }
}

boot()