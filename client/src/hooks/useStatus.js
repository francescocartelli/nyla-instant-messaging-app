import { useMemo, useState } from 'react'

function useStatus(initial = { isLoading: true, isReady: false, isError: false }) {
    const [status, setStatus] = useState(initial)

    const setStatusActions = useMemo(() => ({
        setLoading: () => setStatus({ isLoading: true, isReady: false, isError: false }),
        setReady: () => setStatus({ isLoading: false, isReady: true, isError: false }),
        setError: () => setStatus({ isLoading: false, isReady: false, isError: true }),
    }), [setStatus])

    return [status, setStatusActions]
}

export default useStatus