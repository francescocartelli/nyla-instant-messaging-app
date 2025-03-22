import { useCallback, useEffect, useRef } from 'react'

import { useArray, useCounter, useInit, useStatus, useVieport } from '@/hooks'

import { MessageCard, SkeletonMessages } from '@/components/Chats/Messages'
import { Button } from '@/components/Commons/Buttons'
import { StatusLayout } from '@/components/Commons/Layout'
import { InformationBox, SomethingWentWrong } from '@/components/Commons/misc'

import MessageEditor from '@/components/Chats/MessageEditor'

import { NewMessagesBadge } from './Messages'

function Messages({ messages, isGroup, onDeleteMessage }) {
    return <>
        {messages.length === 0 && <InformationBox title="Wow, such an empty!" subtitle="All the exchanged messages will be shown here!" />}
        {messages.map((message, i, arr) => <MessageCard key={message.id} message={message} isGroup={isGroup} prev={arr[i - 1]} onDelete={() => onDeleteMessage(message)} />)}
    </>
}

function useMessagesContainer(
    userId,
    messageMapping,
    onCreateMessageSubscription,
    onDeleteMessageSubscription,
    getMessages,
    sendMessage,
    deleteMessage
) {
    const lookupMessages = useCallback(({ id }) => id, [])
    const [messages, messagesActions] = useArray([], lookupMessages)
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
                messagesActions.prextend(res.messages.map(messageMapping))
                messagesCursor.current = res.nextCursor
                setReady()
            })
            .catch(err => setError())
    }, [getMessages, messageMapping, messagesActions])

    const onDeleteMessage = useCallback(message => {
        messagesActions.set(message.id, { ...message, isPending: true, isError: false })
        deleteMessage(message)
            .then(() => messagesActions.delete(message.id))
            .catch(() => messagesActions.set(message.id, { ...message, isPending: false, isError: true }))
    }, [deleteMessage, messagesActions])

    const onSendMessage = useCallback(content => {
        const message = messageMapping({ content, idSender: userId, isPending: true })
        isScrollRequired.current = true
        messagesActions.append(message)
        sendMessage(message)
            .then(res => messagesActions.set(message.id, { ...message, id: res.id.toString(), isPending: false, isError: false }))
            .catch(err => messagesActions.set(message.id, { ...message, isPending: false, isError: true }))
    }, [sendMessage, userId, messageMapping, messagesActions])

    const onNewMessagesBadgeClick = useCallback(() => { resetNewMessagesNumber(); scrollToLastMessage() }, [scrollToLastMessage, resetNewMessagesNumber])
    const onGetPreviousMessagesClick = useCallback(() => onGetMessages(messagesCursor.current, messagesRefetchStatusActions), [onGetMessages, messagesRefetchStatusActions])

    // callbacks
    const messageReceived = useCallback(message => {
        if (userId === message.idSender) return
        messagesActions.append(messageMapping(message))
        isMessageReceived.current = true
    }, [userId, messageMapping, messagesActions])

    const messageDeleted = useCallback(message => (userId !== message.idSender) && messagesActions.delete(message.id), [userId, messagesActions])

    // init
    const initCallback = useCallback(done => {
        isScrollRequired.current = true
        onGetMessages(messagesCursor.current, messagesStatusActions)
        done()
    }, [onGetMessages, messagesStatusActions])
    useInit(initCallback)

    useEffect(() => {
        const unsubCreateMessage = onCreateMessageSubscription(({ message }) => messageReceived(message))
        const unsubDeleteMessage = onDeleteMessageSubscription(({ message }) => messageDeleted(message))

        return () => { unsubCreateMessage(); unsubDeleteMessage() }
    }, [onCreateMessageSubscription, onDeleteMessageSubscription, messageReceived, messageDeleted])

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
        onSendMessage, onDeleteMessage, onGetPreviousMessagesClick
    }
}

function MessagesContainer({
    userId,
    isGroup,
    messageMapping,
    onCreateMessageSubscription,
    onDeleteMessageSubscription,
    getMessages,
    sendMessage,
    deleteMessage
}) {
    const { messagesCursor, messages, messagesStatus, messagesRefetchStatus,
        newMessagesNumber, onNewMessagesBadgeClick, lastRef,
        onSendMessage, onDeleteMessage, onGetPreviousMessagesClick } = useMessagesContainer(
            userId,
            messageMapping,
            onCreateMessageSubscription,
            onDeleteMessageSubscription,
            getMessages,
            sendMessage,
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
                ready={<Messages messages={messages} isGroup={isGroup} onDeleteMessage={onDeleteMessage} />}
                error={<SomethingWentWrong explanation="It is not possible to load any message!" />}
            />
            <div ref={lastRef} style={{ color: "transparent" }}>_</div>
        </div>
        <div className="position-relative">
            {newMessagesNumber > 0 && <NewMessagesBadge onClick={onNewMessagesBadgeClick} count={newMessagesNumber} />}
            <MessageEditor onSendMessage={onSendMessage} isDisabled={!messagesStatus.isReady} />
        </div>
    </>
}

export default MessagesContainer

