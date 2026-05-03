import { useRef, useState, useCallback, useEffect } from 'react'

import { useMessages } from './useMessages'

import { useCounter, useInit, useStatus, useVieport } from '@/hooks'

export default function useMessagesContainer(
    userId,
    messageMapping,
    onCreateMessageSubscription,
    onUpdateMessageSubscription,
    onDeleteMessageSubscription,
    getMessages,
    sendMessage,
    updateMessage,
    deleteMessage) {
    const [messages, messagesActions] = useMessages(messageMapping)
    const [messagesStatus, messagesStatusActions] = useStatus()
    const [messagesRefetchStatus, messagesRefetchStatusActions] = useStatus({ isReady: true })
    const messagesCursor = useRef(null)

    const [newMessagesNumber, incrementNewMessagesNumber, resetNewMessagesNumber] = useCounter(0)

    const { ref: lastRef, isInViewport: isLastInViewport, scrollTo: scrollToLastMessage } = useVieport(resetNewMessagesNumber)

    const isScrollRequired = useRef(false)
    const isMessageReceived = useRef(false)

    const [replyTo, setReplyTo] = useState()

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

    const onSendMessage = useCallback((content, replyTo) => {
        const message = messageMapping({ content, idSender: userId, createdAt: new Date(), isPending: true, repliedTo: replyTo })
        isScrollRequired.current = true
        messagesActions.append(message)
        sendMessage({ ...message, repliedToId: replyTo?.id })
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

    const onReplyTo = useCallback(message => setReplyTo(message), [])
    const clearReplyTo = useCallback(() => setReplyTo(null), [])

    const onNewMessagesBadgeClick = useCallback(() => {
        resetNewMessagesNumber()
        scrollToLastMessage()
    }, [scrollToLastMessage, resetNewMessagesNumber])
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
        onSendMessage, onUpdateMessage, onDeleteMessage, onGetPreviousMessagesClick,
        replyTo, onReplyTo, clearReplyTo
    }
}
