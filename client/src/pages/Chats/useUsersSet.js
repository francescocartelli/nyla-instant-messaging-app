import { useMemo } from 'react'

function useUsersSet(users) {
    const usersIdsSet = useMemo(() => new Set(users.map(u => u.id)), [users])

    return usersIdsSet
}

export default useUsersSet