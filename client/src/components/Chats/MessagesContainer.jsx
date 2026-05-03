import { memo } from 'react'


import { Button } from '@/components/Commons/Buttons'
import { StatusLayout } from '@/components/Commons/Layout'
import { InformationBox, SomethingWentWrong } from '@/components/Commons/misc'


import MessageCard from './MessageCard'
import MessageEditor from './MessageEditor'
import NewMessagesBadge from './NewMessagesBadge'
import ReplyToEditor from './ReplyToEditor'
import SkeletonMessages from './SkeletonMessages'
import useMessagesContainer from './useMessagesContainer'

function Messages({ messages, onUpdateMessage, onDeleteMessage, onReplyTo }) {
    return <>
        {messages.length === 0 && <InformationBox title="Wow, such an empty!" subtitle="All the exchanged messages will be shown here!" />}
        {messages.map(message => <MessageCard
            key={message.id}
            message={message}
            onUpdate={onUpdateMessage}
            onDelete={() => onDeleteMessage(message)}
            onReplyTo={onReplyTo}
        />)}
    </>
}

const MessagesMemo = memo(Messages)

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
        onGetPreviousMessagesClick,
        replyTo, onReplyTo, clearReplyTo } = useMessagesContainer(
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
                ready={<MessagesMemo messages={messages} onUpdateMessage={onUpdateMessage} onDeleteMessage={onDeleteMessage} onReplyTo={onReplyTo} />}
                error={<SomethingWentWrong explanation="It is not possible to load any message!" />}
            />
            <div ref={lastRef} style={{ color: "transparent" }}>_</div>
        </div>
        <div className="position-relative">
            {newMessagesNumber > 0 && <NewMessagesBadge onClick={onNewMessagesBadgeClick} count={newMessagesNumber} />}
            {replyTo && <ReplyToEditor replyTo={replyTo} clearReplyTo={clearReplyTo} />}
            <div className="d-flex flex-row gap-2 align-items-center card-1">
                <MessageEditor replyTo={replyTo} clearReplyTo={clearReplyTo} onSendMessage={onSendMessage} isDisabled={!messagesStatus.isReady} />
            </div>
        </div>
    </>
}

export default MessagesContainer

