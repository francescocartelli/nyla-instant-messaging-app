exports.newUser = function ({username, email, hash}) {
    return {
        username: username,
        email: email,
        bio: "",
        hash: hash,
        confirmed: false,
        createdAt: new Date()
    }
}

// projections
exports.userProjection = {
    _id: 0, 
    id: '$_id', 
    username: 1, 
    confirmed: 1
}