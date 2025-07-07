const { v4: uuidv4 } = require('uuid')

const getDefault = (map, key, defaultValue = new Map()) => {
    if (!map.has(key)) map.set(key, defaultValue)
    return map.get(key)
}

const createConnectionManager = ({ log = () => { } }) => {
    const connGroups = new Map()

    const add = (key, ws, id = uuidv4()) => {
        const group = getDefault(connGroups, key)
        group.set(id, ws)

        log(`added: ${key}-${id}`)

        return {
            to: to(group), // send message to all connections in group
            remove: remove(group, key, id), // remove connection from the connection group
            isInit: group.size === 1
        }
    }

    const to = group => callback => {
        Array.from(group.values()).forEach(callback)
    }

    const remove = (group, key, id) => (onRemoveConnection = () => { }, onRemoveGroup = () => { }) => {
        removeConnection(group, id, onRemoveConnection)
        removeGroup(group, key, onRemoveGroup)
    }

    const removeConnection = (group, id, onRemoveConnection) => {
        onRemoveConnection(group.get(id))
        group.delete(id)

        log(`removed: ${id}`)
    }

    const removeGroup = (group, key, onClose, force = false) => {
        if (!force && group.size > 0) return

        connGroups.delete(key)
        onClose()

        log(`deleted: ${key}`)
    }

    return { addConnection: add }
}

module.exports = createConnectionManager