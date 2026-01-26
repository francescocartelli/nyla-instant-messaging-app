import { memo, useCallback, useEffect, useRef } from 'react'

import { useCounter, useInit, useStatus, useVieport } from '@/hooks'

import { Button } from '@/components/Commons/Buttons'
import { StatusLayout } from '@/components/Commons/Layout'
import { InformationBox, SomethingWentWrong } from '@/components/Commons/misc'

import { useMessages } from './useMessages'

import MessageCard from './MessageCard'
import MessageEditor from './MessageEditor'
import NewMessagesBadge from './NewMessagesBadge'
import SkeletonMessages from './SkeletonMessages'

function Messages({ messages, onUpdateMessage, onDeleteMessage }) {    
    return <>
        {messages.length === 0 && <InformationBox title="Wow, such an empty!" subtitle="All the exchanged messages will be shown here!" />}
        {messages.map(message => <MessageCard
            key={message.id}
            message={message}
            onUpdate={onUpdateMessage}
            onDelete={() => onDeleteMessage(message)}
        />)}
    </>
}

const MessagesMemo = memo(Messages)

function useMessagesContainer(
    userId,
    messageMapping,
    onCreateMessageSubscription,
    onUpdateMessageSubscription,
    onDeleteMessageSubscription,
    getMessages,
    sendMessage,
    updateMessage,
    deleteMessage
) {
    const [messages, messagesActions] = useMessages(messageMapping)
    const [messagesStatus, messagesStatusActions] = useStatus()
    const [messagesRefetchStatus, messagesRefetchStatusActions] = useStatus({ isReady: true })
    const messagesCursor = useRef(null)

    const [newMessagesNumber, incrementNewMessagesNumber, resetNewMessagesNumber] = useCounter(0)

    const { ref: lastRef, isInViewport: isLastInViewport, scrollTo: scrollToLastMessage } = useVieport(resetNewMessagesNumber)

    const isScrollRequired = useRef(false)
    const isMessageReceived = useRef(false)

    // actions
    const onGetMessages = useCallback((cur, { setReady, setLoading, setError }) => {
        setLoading()
        getMessages(cur)
            .then(res => {
                if (res.messages.length > 0 && res.nextCursor === messagesCursor.current) return
                res.messages.reverse()
                messagesActions.prextend(res.messages)
                messagesCursor.current = res.nextCursor
                setReady()
            })
            .catch(err => setError())
    }, [getMessages, messagesActions])

    const onDeleteMessage = useCallback(message => {
        messagesActions.update(message.id, { ...message, isPending: true, isError: false })
        deleteMessage(message)
            .then(() => messagesActions.update(message.id, { ...message, content: null, deletedAt: new Date() }))
            .catch(() => messagesActions.update(message.id, { ...message, isPending: false, isError: true }))
    }, [deleteMessage, messagesActions])

    const onSendMessage = useCallback(content => {
        const message = messageMapping({ content, idSender: userId, createdAt: new Date(), isPending: true })
        isScrollRequired.current = true
        messagesActions.append(message)
        sendMessage(message)
            .then(res => messagesActions.update(message.id, { ...message, id: res.id.toString(), isPending: false, isError: false }))
            .catch(err => messagesActions.update(message.id, { ...message, isPending: false, isError: true }))
    }, [sendMessage, userId, messagesActions])

    const onUpdateMessage = useCallback(message => new Promise((resolve, reject) => {
        messagesActions.update(message.id, { ...message, updatedAt: new Date(), isPending: true, isError: false })
        updateMessage(message)
            .then(res => {
                messagesActions.update(message.id, { ...message, isPending: false, isError: false })
                resolve(res)
            })
            .catch(err => {
                messagesActions.update(message.id, { ...message, isPending: false, isError: true })
                reject(err)
            })
    }), [messagesActions])

    const onNewMessagesBadgeClick = useCallback(() => { resetNewMessagesNumber(); scrollToLastMessage() }, [scrollToLastMessage, resetNewMessagesNumber])
    const onGetPreviousMessagesClick = useCallback(() => onGetMessages(messagesCursor.current, messagesRefetchStatusActions), [onGetMessages, messagesRefetchStatusActions])

    // callbacks
    const messageReceived = useCallback(message => {
        if (userId === message.idSender) return
        messagesActions.append(message)
        isMessageReceived.current = true
    }, [userId, messagesActions])

    const messageUpdated = useCallback(message => {
        if (userId === message.idSender) return
        messagesActions.update(message.id, message)
    }, [userId, messagesActions])

    const messageDeleted = useCallback(message => (userId !== message.idSender) && messagesActions.update(message.id, { content: null, deletedAt: new Date() }), [userId, messagesActions])

    // init
    const initCallback = useCallback(done => {
        isScrollRequired.current = true
        onGetMessages(messagesCursor.current, messagesStatusActions)
        done()
    }, [onGetMessages, messagesStatusActions])
    useInit(initCallback)

    useEffect(() => {
        const unsubCreateMessage = onCreateMessageSubscription(({ message }) => messageReceived(message))
        const unsubUpdateMessage = onUpdateMessageSubscription(({ message }) => messageUpdated(message))
        const unsubDeleteMessage = onDeleteMessageSubscription(({ message }) => messageDeleted(message))

        return () => {
            unsubCreateMessage()
            unsubUpdateMessage()
            unsubDeleteMessage()
        }
    }, [onCreateMessageSubscription, onUpdateMessageSubscription, onDeleteMessageSubscription, messageReceived, messageDeleted])

    // when message list rerenders scroll to bottom if needed or update the new messages number
    useEffect(() => {
        if (isScrollRequired.current) {
            scrollToLastMessage()
            isScrollRequired.current = false
        }
        if (isMessageReceived.current) {
            isLastInViewport ? scrollToLastMessage() : incrementNewMessagesNumber()
            isMessageReceived.current = false
        }
    }, [messages, incrementNewMessagesNumber, scrollToLastMessage, isLastInViewport])

    return {
        messagesCursor, messages, messagesStatus, messagesRefetchStatus,
        newMessagesNumber, onNewMessagesBadgeClick, lastRef,
        onSendMessage, onUpdateMessage, onDeleteMessage, onGetPreviousMessagesClick
    }
}

function MessagesContainer({
    userId,
    messageMapping,
    onCreateMessageSubscription,
    onUpdateMessageSubscription,
    onDeleteMessageSubscription,
    getMessages,
    sendMessage,
    updateMessage,
    deleteMessage
}) {
    const { messagesCursor, messages, messagesStatus, messagesRefetchStatus,
        newMessagesNumber, onNewMessagesBadgeClick, lastRef,
        onSendMessage, onDeleteMessage, onUpdateMessage,
        onGetPreviousMessagesClick } = useMessagesContainer(
            userId,
            messageMapping,
            onCreateMessageSubscription,
            onUpdateMessageSubscription,
            onDeleteMessageSubscription,
            getMessages,
            sendMessage,
            updateMessage,
            deleteMessage
        )

    return <>
        <div className="d-flex flex-column flex-grow-1 h-0 gap-2 scroll-y pr-2 pl-2">
            {messagesCursor.current !== null && <Button onClick={onGetPreviousMessagesClick} disabled={!messagesRefetchStatus.isReady}>
                <StatusLayout status={messagesRefetchStatus}
                    loading={<>Loading...</>}
                    ready={<>Get Previous Messages...</>}
                    error={<>Error while retrieving more messages. Retry?</>}
                /></Button>}
            <StatusLayout status={messagesStatus}
                loading={<SkeletonMessages />}
                ready={<MessagesMemo messages={messages} onUpdateMessage={onUpdateMessage} onDeleteMessage={onDeleteMessage} />}
                error={<SomethingWentWrong explanation="It is not possible to load any message!" />}
            />
            <div ref={lastRef} style={{ color: "transparent" }}>_</div>
        </div>
        <div className="position-relative">
            {newMessagesNumber > 0 && <NewMessagesBadge onClick={onNewMessagesBadgeClick} count={newMessagesNumber} />}
            <div className="d-flex flex-row gap-2 align-items-center card-1">
                <MessageEditor onSendMessage={onSendMessage} isDisabled={!messagesStatus.isReady} />
            </div>
        </div>
    </>
}

export default MessagesContainer

