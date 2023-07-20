exports.newUser = function (u) {
    return {
        username: u.username,
        email: u.email,
        bio: "",
        hash: u.hash,
        confirmed: false
    }
}

// projections
exports.userProjection = {
    _id: 0, 
    id: '$_id', 
    username: 1, 
    email: 1, 
    confirmed: 1
}