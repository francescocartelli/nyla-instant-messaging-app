function sleep(delay) {
    return new Promise(res => setTimeout(res, delay))
}

export { sleep }