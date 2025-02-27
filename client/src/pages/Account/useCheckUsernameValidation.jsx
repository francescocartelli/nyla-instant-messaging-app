import { useCallback, useEffect, useState } from 'react'

import { useStatus, useValidation, useDebounce } from '@/hooks'

export function useCheckUsernameValidation(initial, test, onCheck, debounceDelay) {
    const { value, setValue, isInvalid } = useValidation(initial, test)

    const [isTaken, setTaken] = useState(true)
    const [checkStatus, checkStatusActions] = useStatus({ isReady: true })

    const debounceCallback = useCallback(u => {
        onCheck(u).then(users => {
            setTaken(users.length > 0)
            checkStatusActions.setReady()
        }).catch(() => {
            setTaken(true)
            checkStatusActions.setError()
        })
    }, [checkStatusActions, onCheck])
    const [check, stopCheck] = useDebounce(debounceCallback, debounceDelay)

    useEffect(() => {
        setTaken(true)
        if (value && !isInvalid) {
            checkStatusActions.setLoading()
            check(value)
        } else {
            checkStatusActions.setReady()
            stopCheck()
        }
    }, [value, isInvalid, check, stopCheck, checkStatusActions])

    return { value, setValue, isInvalid, checkStatus, isTaken }
}

export default useCheckUsernameValidation