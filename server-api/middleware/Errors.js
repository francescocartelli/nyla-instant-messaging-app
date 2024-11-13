const { SERVER_ERROR } = require("../constants/ResponseMessages")

exports.safeController = controller => async (req, res, next) => {
    try {
        await controller(req, res, next)
    } catch (err) {
        next(err)
    }
}

exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack)
    return res.status(500).json({ message: SERVER_ERROR })
}