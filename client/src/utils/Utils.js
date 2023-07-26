import * as dayjs from 'dayjs'
import ColorHash from 'color-hash'
import { useState } from 'react'

let seed = (Math.random() + 1).toString(36).substring(7)

var colorHash = new ColorHash({
    lightness: 0.6,
    saturation: 0.6,
    hue: { min: 170, max: 300 }
})

function sleep(delay) {
    return new Promise(res => setTimeout(res, delay));
}

const getColor = (text, opacity = '80') => {
    return `${colorHash.hex(text + seed)}${opacity}`
}

const states = {
    loading: 0,
    ready: 1,
    error: 2
}

const FlowState = () => {
    const [state, setState] = useState(states.loading)

    const get = () => { return state }

    const toString = () => {
        switch (state) {
            case 0:
                return 'loading'
            case 1:
                return 'ready'
            case 2:
                return 'error'
            default:
                return 'error'
        }
    }

    const isLoading = () => { return state === states.loading }
    const isReady = () => { return state === states.ready }
    const isError = () => { return state === states.error }

    const setLoading = () => { setState(states.loading) }
    const setReady = () => { setState(states.ready) }
    const setError = () => { setState(states.error) }

    return { get, isLoading, isReady, isError, setLoading, setReady, setError, toString }
}

export { sleep, getIPV4, getMessageTimeFormat, getColor, FlowState, dateTimeVerbosity }