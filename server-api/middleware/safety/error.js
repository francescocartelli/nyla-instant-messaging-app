exports.error = ({ onError, message }) => (err, req, res, next) => {
    onError?.(err.stack)
    
    return res.status(500).json({ message })
}