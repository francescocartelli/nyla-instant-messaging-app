const usernameReg = /^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/
const emailReg = /^\S+@\S+\.\S+$/
const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$/

const usefullRegExp = { usernameReg, emailReg, passwordReg }

export default usefullRegExp