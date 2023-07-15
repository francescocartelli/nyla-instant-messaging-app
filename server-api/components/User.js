exports.newUser = function (u) {
    return {
        username: u.username,
        email: u.email,
        bio: "",
        hash: u.hash,
        confirmed: false
    }
}