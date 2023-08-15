import ColorHash from 'color-hash'
import { useState } from 'react'

let seed = (Math.random() + 1).toString(36).substring(7)

var colorHash = new ColorHash({
    lightness: 0.6,
    saturation: 0.6,
    hue: { min: 170, max: 300 }
})

function sleep(delay) {
    return new Promise(res => setTimeout(res, delay))
}

const getColor = (text, opacity = '80') => {
    return `${colorHash.hex(text + seed)}${opacity}`
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

export { sleep, getColor, FlowState }