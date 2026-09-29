import { v4 as uuidv4 } from 'uuid'
import type { WebSocket } from 'ws'

type GroupType = Map<string, WebSocket>

export type OnRemoveConnectionType = (ws: WebSocket) => void
export type OnRemoveGroupType = () => void

const getDefault = (map: Map<string, GroupType>, key: string, defaultValue = new Map()) => {
    if (!map.has(key)) map.set(key, defaultValue)
    return map.get(key)!
}

export type Broadcast = (callback: BroadcastCallback) => void
export type BroadcastCallback = (ws: WebSocket) => void

export interface ConnectionManagerType {
    to: Broadcast
    remove: (onRemoveConnection: OnRemoveConnectionType, onRemoveGroup: OnRemoveGroupType) => void
    isInit: boolean
}

const createConnectionManager = ({ log = (_message: string) => { } } = {}) => {
    const connGroups = new Map()

    const add = (key: string, ws: WebSocket, id = uuidv4()): ConnectionManagerType => {
        const group = getDefault(connGroups, key)
        group.set(id, ws)

        log(`added: ${id} [${key}]`)

        return {
            to: to(group), // send message to all connections in group
            remove: remove(group, key, id), // remove connection from the connection group
            isInit: group.size === 1
        }
    }

    const to = (group: GroupType) => (callback: BroadcastCallback) => {
        Array.from(group.values()).forEach(callback)
    }

    const remove = (group: GroupType, key: string, id: string) => (
        onRemoveConnection: OnRemoveConnectionType = (_ws: WebSocket) => { },
        onRemoveGroup: OnRemoveGroupType = () => { }
    ) => {
        removeConnection(group, key, id, onRemoveConnection)
        removeGroup(group, key, onRemoveGroup)
    }

    const removeConnection = (group: GroupType, key: string, id: string, onRemoveConnection: OnRemoveConnectionType) => {
        onRemoveConnection(group.get(id)!)
        group.delete(id)

        log(`removed: ${id} [${key}]`)
    }

    const removeGroup = (group: GroupType, key: string, onClose: OnRemoveGroupType, force = false) => {
        if (!force && group.size > 0) return

        connGroups.delete(key)
        onClose()

        log(`deleted: ${key}`)
    }

    return { addConnection: add }
}

export default createConnectionManager