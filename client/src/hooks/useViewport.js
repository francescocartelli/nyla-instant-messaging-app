import { useCallback, useEffect, useState, useRef } from 'react'

function useIsInViewport(ref) {
    const [isIntersecting, setIsIntersecting] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setIsIntersecting(entry.isIntersecting))

        observer.observe(ref.current)

        return () => observer.disconnect()
    }, [ref])

    return isIntersecting
}

function useVieport(onVieport) {
    const ref = useRef(null)
    const isInViewport = useIsInViewport(ref)

    const scrollTo = useCallback(() => ref.current.scrollIntoView({ behavior: "smooth" }), [ref])

    useEffect(() => {
        isInViewport && onVieport()
    }, [isInViewport, onVieport])

    return {
        ref,
        isInViewport,
        scrollTo
    }
}

export default useVieport