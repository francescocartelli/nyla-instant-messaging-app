import { useCallback, useRef } from "react"

function useDebounce(callback, delay) {
    const timeout = useRef()

    const onPlay = useCallback((...args) => {
        if (timeout.current) clearTimeout(timeout.current)
        timeout.current = setTimeout(() => callback(...args), delay)
    }, [callback, delay])

    const onStop = useCallback(() => {
        if (timeout.current) clearTimeout(timeout.current)
    }, [])

    return [onPlay, onStop]
}

export default useDebounce