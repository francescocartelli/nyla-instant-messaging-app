const delayedPassThrough = delay => (req, res, next) => setTimeout(next, delay)

module.exports = delayedPassThrough
