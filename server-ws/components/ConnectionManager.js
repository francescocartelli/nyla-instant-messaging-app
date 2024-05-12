const { v4: uuidv4 } = require('uuid')
const { logger } = require.main.require('./components/Logger')

const getDefault = (map, key, defaultValue = {}) => {
    if (!map.has(key)) map.set(key, defaultValue)
    return map.get(key)
}

const createConnectionManager = () => {
    const connGroups = new Map()

    const add = (key, ws, id = uuidv4()) => {
        const group = getDefault(connGroups, key)
        group[id] = ws

        logger.debug(`added: ${key}-${id}`)

        return {
            to: (callback) => to(group, callback), // send message to all connections in group
            remove: (onClose) => remove(group, key, id, onClose), // remove connection from the connection group
            isInit: Object.keys(group).length === 1
        }
    }

    const to = (group, callback) => {
        Object.values(group).forEach(conn => callback(conn))
    }

    const remove = (group, key, id, onClose) => {
        removeConnection(group, id)
        removeGroup(group, key, onClose)
    }

    const removeConnection = (group, id) => {
        group[id].close()
        delete group[id]

        logger.debug(`removed: ${id}`)
    }

    const removeGroup = (group, key, onClose = () => { }, force = false) => {
        if (force || Object.keys(group) < 1) {
            connGroups.delete(key)
            onClose()

            logger.debug(`deleted: ${key}`)
        }
    }

    return { addConnection: add }
}

exports.createConnectionManager = createConnectionManager