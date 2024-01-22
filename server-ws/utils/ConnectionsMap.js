const { v4: uuidv4 } = require('uuid')
const logger = require.main.require('./utils/Logger').logger

/*
    structure:
    userA
        idX: ws
        idY: ws
    userB
        idZ: ws
        idW: ws
*/

const forEachConnection = (key, conns) => (callback) => {
    conns.forEach((v, k) => {
        logger.debug(`(${key}, ${k}) - callback`)
        callback(v)
    })
}

const onRemove = (key, connId, outer, inner) => (onEmptyCallback) => {
    logger.debug(`(${key}, ${connId}) - remove`)
    inner.delete(connId)
    if (inner.size === 0) {
        logger.debug(`(${key}, ${connId}) - empty`)
        onEmptyCallback()
        outer.delete(key)
    }
}

exports.ConnMap = function () {
    this.outer = new Map()

    this.add = (key, value) => {
        const connId = uuidv4()

        let inner = null
        let isInit = false
        if (this.outer.has(key)) {
            logger.debug(`(${key}, ${connId}) - add`)

            inner = this.outer.get(key)
            inner.set(connId, value)
        } else {
            logger.debug(`(${key}, ${connId}) - init`)

            isInit = true
            inner = new Map([[connId, value]])
            this.outer.set(key, inner)
        }

        return [
            forEachConnection(key, inner),
            onRemove(key, connId, this.outer, inner),
            isInit
        ]
    }
}