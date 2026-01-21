import { useMemo } from 'react'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'

const getDateAndTime = datetime => {
    const dt = dayjs(datetime)

    const date = dt.format('YYYY/MM/DD')
    const time = dt.format('HH:mm')

    return [date, time]
}

const createMessage = ({ id, idChat, content, idSender, senderUsername, isFromOther, createdAt, updatedAt, isPending = false, isError = false }) => {
    const [date, time] = getDateAndTime(createdAt)

    return {
        id: id || uuidv4(),
        idChat,
        content,
        idSender,
        senderUsername,
        isFromOther,
        createdAtDate: date,
        createdAtTime: time,
        updatedAt,
        isPending,
        isError
    }
}

function useMessageMapping(users, user) {
    const usernamesTranslation = useMemo(() => Object.fromEntries(users.map(({ id, username }) => [id.toString(), username])), [users])
    const messageMapping = useMemo(() => Object.keys(usernamesTranslation).length > 0 ? message => createMessage({
        ...message,
        senderUsername: (usernamesTranslation[message.idSender.toString()] || "<deleted>"),
        isFromOther: user.id !== message.idSender
    }) : null, [user, usernamesTranslation])

    return messageMapping
}

export default useMessageMapping