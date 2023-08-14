exports.mqCreateMessage = function (message) {
    return {
        type: "MESSAGE_CREATE",
        data: message
    }
}

exports.mqDeleteMessage = function (message) {
    return {
        type: "MESSAGE_DELETE",
        data: message
    }
}