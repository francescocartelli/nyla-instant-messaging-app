import dayjs from "dayjs"
import { v4 as uuidv4 } from 'uuid'

const format99Plus = number => number > 99 ? "99+" : number

const getDateAndTime = datetime => {
    const dt = dayjs(datetime)

    const date = dt.format('YYYY/MM/DD')
    const time = dt.format('HH:mm')

    return [date, time]
}

const initialContent = [{ type: 'paragraph', children: [{ text: '' }] }]

const createMessage = ({ id, content, idSender, isPending = true, isError = false }) => ({
    id: id || uuidv4(),
    content,
    isPending,
    isError,
    idSender
})

export { format99Plus, getDateAndTime, initialContent, createMessage }