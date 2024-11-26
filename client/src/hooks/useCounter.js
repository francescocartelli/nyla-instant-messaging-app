import { useState, useCallback } from 'react'

function useCounter(initial) {
    const [counter, setCounter] = useState(initial)

    const increment = useCallback(() => setCounter(p => p + 1), [])
    const reset = useCallback(() => setCounter(initial), [initial])

    return [counter, increment, reset]
}

export default useCounter