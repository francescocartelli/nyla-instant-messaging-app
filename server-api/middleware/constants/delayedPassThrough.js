const delayedPassThrough = delay => (req, res, next) => setTimeout(next, delay)

export default delayedPassThrough