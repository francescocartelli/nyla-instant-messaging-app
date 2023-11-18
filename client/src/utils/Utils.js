import { useState } from 'react'

function sleep(delay) {
    return new Promise(res => setTimeout(res, delay))
}

const states = {
    loading: 'loading',
    ready: 'ready',
    error: 'error'
}

const FlowState = (initial = states.loading) => {
    const [state, setState] = useState(initial)

    const get = () => { return state }

    const isLoading = () => { return state === states.loading }
    const isReady = () => { return state === states.ready }
    const isError = () => { return state === states.error }

    const setLoading = () => { setState(states.loading) }
    const setReady = () => { setState(states.ready) }
    const setError = () => { setState(states.error) }

    return { get, isLoading, isReady, isError, setLoading, setReady, setError, toString }
}

export { sleep, FlowState }