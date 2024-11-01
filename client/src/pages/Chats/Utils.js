import dayjs from "dayjs"

const format99Plus = number => number > 99 ? "99+" : number

const getDateAndTime = datetime => {
    const dt = dayjs(datetime)

    const date = dt.format('YYYY/MM/DD')
    const time = dt.format('HH:mm')

    return [date, time]
}

const initialContent = [{ type: 'paragraph', children: [{ text: '' }] }]

export { format99Plus, getDateAndTime, initialContent }