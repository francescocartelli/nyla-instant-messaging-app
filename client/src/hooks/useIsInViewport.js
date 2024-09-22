import { useEffect, useState } from "react"

function useIsInViewport(ref) {
    const [isIntersecting, setIsIntersecting] = useState(false)

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => setIsIntersecting(entry.isIntersecting))

        observer.observe(ref.current)

        return () => observer.disconnect()
    }, [ref])

    return isIntersecting
}

export default useIsInViewport