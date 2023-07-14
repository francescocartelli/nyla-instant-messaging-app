const { ObjectId } = require('mongodb')

exports.validateId = function(idParam) {
    return function (req, res, next) {
        const id = req.params[idParam]
        if (!ObjectId.isValid(id)) res.status(400).send("Bad id")
        else next()
    }
}