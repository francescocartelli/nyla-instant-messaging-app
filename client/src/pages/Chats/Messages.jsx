import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { ArrowDown, Check2 } from 'react-bootstrap-icons'

import { useArray, useCounter, useInit, useStatus, useVieport } from '@/hooks'

import { Button } from '@/components/Commons/Buttons'
import { StatusLayout } from '@/components/Commons/Layout'
import { InformationBox, SomethingWentWrong } from '@/components/Commons/misc'
import { MessageCard, SkeletonMessages } from '@/components/Messages/Messages'
import { RTEditor, Toolbar } from '@/components/SEditor'
import { WebSocketContext, channelTypes } from '@/components/Ws/WsContext'

import chatAPI from '@/api/chatAPI'

import { format99Plus, initialContent } from './Utils'

function MessageEditor({ onSendMessage, isDisabled }) {
    const [content, setContent] = useState(initialContent)
    const editorRef = useRef()

    const resetEditor = useCallback(() => {
        setContent(initialContent)
        editorRef.current.reset()
    }, [])

    const onSubmitMessage = ev => {
        ev.preventDefault()
        onSendMessage(content)
        resetEditor()
    }

    return <div className="d-flex flex-row gap-2 align-items-center card-1">
        <RTEditor value={content} setValue={setContent} toolbar={<Toolbar />} placeholder="Write yout message here..." ref={editorRef} />
        <form onSubmit={onSubmitMessage}>
            <Button type="submit" className={"circle"} disabled={isDisabled}><Check2 className="fore-success size-1" /></Button>
        </form>
    </div>
}

function Messages({ messages, chat, onDeleteMessage, messagesActions }) {
    return <>
        {messages.length === 0 && <InformationBox title="Wow, such an empty!" subtitle="All the exchanged messages will be shown here!" />}
        {messages.map((message, i, arr) => <MessageCard key={message.id} message={message} isGroup={chat.isGroup} prev={i > 0 ? arr[i - 1] : null} onDelete={onDeleteMessage} onDeleteSuccessfull={messagesActions.delete} />)}
    </>
}

function MessagesContainer({ id, user, chat, messageMapping }) {
    const lookupMessages = useCallback(({ id }) => id, [])
    const [messages, messagesActions] = useArray([], lookupMessages)
    const [messagesStatus, messagesStatusActions] = useStatus()
    const [messagesRefetchStatus, messagesRefetchStatusActions] = useStatus({ isReady: true })
    const messagesCursor = useRef(null)

    const [newMessagesNumber, incrementNewMessagesNumber, resetNewMessagesNumber] = useCounter(0)

    const { ref: lastRef, isInViewport: isLastInViewport, scrollTo: scrollToLastMessage } = useVieport(resetNewMessagesNumber)

    const isScrollRequired = useRef(false)
    const isMessageReceived = useRef(false)

    const getMessages = useCallback((cur, { setReady, setLoading, setError }) => {
        setLoading()
        chatAPI.getMessages(id, cur).then(res => res.json())
            .then(res => {
                if (res.messages.length > 0 && res.nextCursor === messagesCursor.current) return

                res.messages.reverse()
                messagesActions.prextend(res.messages.map(messageMapping))
                messagesCursor.current = res.nextCursor
                setReady()
            })
            .catch(err => setError())
    }, [id, messageMapping, messagesActions])

    const messageReceived = useCallback(message => {
        if (user.id === message.idSender) return
        messagesActions.append(messageMapping(message))
        isMessageReceived.current = true
    }, [user.id, messageMapping, messagesActions])

    const messageDeleted = useCallback(message => (user.id !== message.idSender) && messagesActions.delete(message.id), [user.id, messagesActions])

    /* get messages async and create ws events handlers */
    const [subscribe,] = useContext(WebSocketContext)

    const initCallback = useCallback(done => {
        isScrollRequired.current = true
        getMessages(messagesCursor.current, messagesStatusActions)
        done()
    }, [getMessages, messagesStatusActions])
    useInit(initCallback, 1)

    useEffect(() => {
        const unsubCreateMessage = subscribe(channelTypes.createMessageInChat(id), ({ message }) => messageReceived(message))
        const unsubDeleteMessage = subscribe(channelTypes.deleteMessageInChat(id), ({ message }) => messageDeleted(message))

        return () => {
            unsubCreateMessage()
            unsubDeleteMessage()
        }
    }, [id, subscribe, messageReceived, messageDeleted])

    const onClickNewMessages = useCallback(() => { resetNewMessagesNumber(); scrollToLastMessage() }, [scrollToLastMessage, resetNewMessagesNumber])

    const onDeleteMessage = useCallback(message => {
        messagesActions.set(message.id, { ...message, isPending: true, isError: false })
        chatAPI.deleteMessage(id, message.id)
            .then(() => messagesActions.delete(message.id))
            .catch(() => messagesActions.set(message.id, { ...message, isLoading: false, isError: true }))
    }, [id, messagesActions])

    const onSendMessage = useCallback(content => {
        const message = messageMapping({ content, idSender: user.id, isPending: true })

        isScrollRequired.current = true
        messagesActions.append(message)
        chatAPI.sendMessage(id, { content }).then(res => res.json())
            .then(res => messagesActions.set(message.id, { ...message, id: res.id.toString(), isPending: false, isError: false }))
            .catch(err => messagesActions.set(message.id, { ...message, isPending: false, isError: true }))
    }, [id, user.id, messageMapping, messagesActions])

    const onGetPreviousMessagesClick = useCallback(() => getMessages(messagesCursor.current, messagesRefetchStatusActions), [getMessages, messagesRefetchStatusActions])

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
                ready={<Messages messages={messages} chat={chat} onDeleteMessage={onDeleteMessage} messagesActions={messagesActions} />}
                error={<SomethingWentWrong explanation="It is not possible to load any message!" />}
            />
            <div ref={lastRef} style={{ color: "transparent" }}>_</div>
        </div>
        <div className="position-relative">
            {newMessagesNumber > 0 &&
                <Button onClick={onClickNewMessages} className="box-glow position-absolute" style={{ top: "-50px", right: "1.5em" }}>
                    <ArrowDown className="fore-2 size-1" />
                    <div className="position-absolute crd-icon-15" style={{ backgroundColor: "#BD44D6", top: "-0.6em", left: "-0.6em" }}>
                        <span className="fs-70">{format99Plus(newMessagesNumber)}</span>
                    </div>
                </Button>}
            <MessageEditor onSendMessage={onSendMessage} isDisabled={!messagesStatus.isReady} />
        </div>
    </>
}

export { MessageCard, MessageEditor, MessagesContainer }

