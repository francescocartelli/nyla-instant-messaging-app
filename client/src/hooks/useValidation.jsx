import { useState, useMemo } from 'react'

export const useValidation = (initialValue, test = () => true) => {
    const [value, setValue] = useState(initialValue)

    const isValid = useMemo(() => test(value), [value, test])
    const isInvalid = useMemo(() => !isValid, [isValid])

    return { value, setValue, isValid, isInvalid }
}

export default useValidation