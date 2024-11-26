import { useCallback, useEffect, useState } from 'react'

function useIsInViewport(ref) {
    const [isIntersecting, setIsIntersecting] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setIsIntersecting(entry.isIntersecting))

        observer.observe(ref.current)

        return () => observer.disconnect()
    }, [ref])

    return isIntersecting
}

function useVieport(ref, onVieport) {
    const isInViewport = useIsInViewport(ref)

    const scrollTo = useCallback(() => ref.current.scrollIntoView({ behavior: "smooth" }), [ref])

    useEffect(() => {
        isInViewport && onVieport()
    }, [isInViewport, onVieport])

    return {
        isInViewport,
        scrollTo
    }
}

export default useVieport