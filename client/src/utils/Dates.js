const dayjs = require("dayjs")

function getDateAndTime(datetime) {
    const dt = dayjs(datetime)

    const date = dt.format('YYYY/MM/DD')
    const time = dt.format('HH:mm')

    return [date, time]
}

export { getDateAndTime }