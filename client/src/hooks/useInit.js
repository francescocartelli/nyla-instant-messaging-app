import { useCallback, useEffect, useRef } from "react"

function useInit(initFunction, name) {
    const isInit = useRef(true)

    const done = useCallback(() => isInit.current = false, [])

    useEffect(() => {
        if (isInit.current) {
            const cleanup = initFunction(done)
            return () => cleanup && cleanup()
        }
    }, [done, initFunction])
}

export default useInit