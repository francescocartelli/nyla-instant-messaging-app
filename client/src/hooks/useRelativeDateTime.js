import { useCallback, useMemo } from "react"

const dayjs = require("dayjs")
const relativeTime = require("dayjs/plugin/relativeTime")

function useRelativeDateTime(dt) {
    const now = useMemo(() => {
        dayjs.extend(relativeTime)
        return dayjs(dt)
    }, [dt])

    const getRelative = useCallback((datetime) => {
        return now?.from(datetime, true)
    }, [now])

    return getRelative
}

export default useRelativeDateTime