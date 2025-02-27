import { useMemo } from 'react'

function useRange(to, from = 0) {
    const items = useMemo(() => [...Array(to - from).keys()].map(i => i + from), [to, from])

    return items
}

export default useRange