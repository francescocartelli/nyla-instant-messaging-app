import { useEffect, useState } from 'react'

function useAuth(getCurrentUserApi) {
    const [user, setUser] = useState(false)
    const [isLoading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        getCurrentUserApi()
            .then(res => { setUser(res); setLoading(false) })
            .catch(err => { setUser(false); setLoading(false) })

        return () => { setUser(false); setLoading(false) }
    }, [getCurrentUserApi])

    return { user, isLoading, setUser }
}

export default useAuth