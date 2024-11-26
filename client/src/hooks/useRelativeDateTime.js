import { useCallback, useMemo } from 'react'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

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