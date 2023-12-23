import { useMemo, useState } from 'react'

function useStatus(initial = 'loading') {
    const [status, setStatus] = useState(initial)

    const setStatusActions = useMemo(() => {
        return {
            setLoading: () => setStatus('loading'),
            setReady: () => setStatus('ready'),
            setError: () => setStatus('error')
        }
    }, [setStatus])

    return [status, setStatusActions]
}

export { useStatus }