import dayjs from 'dayjs'
import { v4 as uuidv4 } from 'uuid'

const format99Plus = number => number > 99 ? "99+" : number

const getDateAndTime = datetime => {
    const dt = dayjs(datetime)

    const date = dt.format('YYYY/MM/DD')
    const time = dt.format('HH:mm')

    return [date, time]
}

const initialContent = [{ type: 'paragraph', children: [{ text: '' }] }]

const createMessage = ({ id, idChat, content, idSender, senderUsername, isFromOther, createdAt, isPending = false, isError = false }) => {
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
        isPending,
        isError
    }
}

export { format99Plus, getDateAndTime, initialContent, createMessage }