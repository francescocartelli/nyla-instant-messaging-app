import { useMemo } from 'react'
import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'

const getDateAndTime = datetime => {
    const dt = dayjs(datetime)

    const date = dt.format('YYYY/MM/DD')
    const time = dt.format('HH:mm')

    return [date, time]
}

const createMessageMapping = (isGroup, user, usersMap) => ({
    id,
    idChat,
    content,
    idSender,
    createdAt,
    updatedAt,
    deletedAt,
    isPending = false,
    isError = false
} = {}, prev) => {
    const [createdAtDate, createdAtTime] = getDateAndTime(createdAt)
    const _idSender = idSender?.toString()
    const isFromOther = user.id !== idSender
    const isDateVisible = !prev || prev.createdAtDate !== createdAtDate
    const isSenderChanged = !prev || (_idSender !== prev?.idSender)

    return {
        id: id || uuidv4(),
        idChat,
        content,
        isGroup,
        idSender: _idSender,
        senderUsername: usersMap[_idSender] || "<deleted>",
        isRichText: typeof content !== 'string',
        isFromOther,
        isDateVisible,
        isSenderVisible: isGroup && isFromOther && isSenderChanged,
        createdAt,
        createdAtDate,
        createdAtTime,
        updatedAt,
        deletedAt,
        isPending,
        isError
    }
}

function useMessageMapping(isGroup, user, users) {
    const messageMapping = useMemo(() => {
        const usersMap = Object.fromEntries(users.map(({ id, username }) => [id.toString(), username]))
        const hasAny = Object.keys(usersMap).length > 0

        return hasAny ? createMessageMapping(isGroup, user, usersMap) : null
    }, [isGroup, user, users])

    return messageMapping
}

export default useMessageMapping