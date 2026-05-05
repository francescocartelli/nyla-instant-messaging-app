const createWSC = (url, options, {
    onOpen,
    onClose,
    onMessage
}) => {
    const _url = new URL(url)

    let wsc = new WebSocket(_url, options)

    wsc.onopen = onOpen
    wsc.onclose = onClose
    wsc.onmessage = onMessage

    return wsc
}

exports.createWSC = createWSC