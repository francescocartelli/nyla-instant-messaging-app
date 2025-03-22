import { useMemo, useState } from 'react'

function useArray(initial = [], lookup = x => x) {
    const [items, setItems] = useState(initial)

    const actions = useMemo(() => ({
        set: (id, item) => setItems(p => p.map(q => id === lookup(q) ? item : q)),
        append: item => setItems(p => [...p, item]),
        prepend: item => setItems(p => [item, ...p]),
        extend: x => setItems(p => [...p, ...x]),
        prextend: x => setItems(p => [...x, ...p]),
        delete: id => setItems(p => p.filter(q => lookup(q) !== id)),
        clear: () => setItems([])
    }), [lookup])

    return [items, actions]
}

export default useArray