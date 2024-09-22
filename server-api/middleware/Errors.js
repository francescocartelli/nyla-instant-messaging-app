const { SERVER_ERROR } = require.main.require("./components/ResponseMessages")

exports.errorHandler = (err, req, res, next) => {
    console.error(err.stack)
    return res.status(500).json({ message: SERVER_ERROR })
}