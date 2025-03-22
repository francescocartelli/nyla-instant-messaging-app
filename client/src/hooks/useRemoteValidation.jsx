import { useCallback, useEffect, useState } from 'react'

import { useStatus, useValidation, useDebounce } from '@/hooks'

function useRemoteValidation(initial, test, onCheck, debounceDelay) {
    const { value, setValue, isInvalid } = useValidation(initial, test)

    const [isRemoteInvalid, setRemoteInvalid] = useState(true)
    const [checkStatus, checkStatusActions] = useStatus({ isReady: true })

    const debounceCallback = useCallback(param => onCheck(param, setRemoteInvalid)
        .then(checkStatusActions.setReady)
        .catch(() => {
            setRemoteInvalid(true)
            checkStatusActions.setError()
        }), [checkStatusActions, onCheck])
    const [check, stopCheck] = useDebounce(debounceCallback, debounceDelay)

    useEffect(() => {
        setRemoteInvalid(true)
        if (value !== initial && !isInvalid) {
            checkStatusActions.setLoading()
            check(value)
        } else {
            checkStatusActions.setReady()
            stopCheck()
        }
    }, [value, isInvalid, check, stopCheck, checkStatusActions])

    return { value, setValue, isInvalid, checkStatus, isRemoteInvalid }
}

export default useRemoteValidation