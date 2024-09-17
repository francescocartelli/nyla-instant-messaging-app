import { useState } from "react"
import { BoxArrowInRight, Check2, EnvelopeFill, EyeFill, EyeSlashFill, Hourglass, Lock, LockFill, PersonFill, PersonPlusFill, XCircle } from "react-bootstrap-icons"
import { Link, useNavigate } from "react-router-dom"

import { useDebounce, useStatus } from "hooks"

import { ErrorAlert, LoadingAlert } from "components/Alerts/Alerts"
import { Text, TextVal } from "components/Common/Inputs"
import { Button } from "components/Common/Buttons"
import { StatusLayout, TabsLayout } from "components/Common/Layout"
import { Logo } from "components/Icons/Icons"

import usefullRegExp from "utils/UsefullRegExp"

import userAPI from "api/userAPI"

function LoginTab({ signinSuccessful }) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [isShowPassword, setShowPassword] = useState(false)
    const [message, setMessage] = useState("")

    const [loginStatus, loginStatusActions] = useStatus("ready")

    const onSubmit = (ev) => {
        ev.preventDefault()
        loginStatusActions.setLoading()
        userAPI.signin(username, password)
            .then(res => res.json())
            .then(res => {
                loginStatusActions.setReady()
                signinSuccessful(res)
            })
            .catch(err => {
                loginStatusActions.setReady()
                err.json()
                    .then(err => setMessage(err.message))
            })

    }

    const onChangeUsername = (ev) => setUsername(ev.target.value)
    const onChangePassword = (ev) => setPassword(ev.target.value)
    const onShowPassword = (ev) => setShowPassword(false)
    const onHidePassword = (ev) => setShowPassword(true)

    const passwordType = isShowPassword ? "text" : "password"
    const isLoginButtonDisabled = !username || !password

    return <form className="d-flex align-self-stretch flex-column gap-3" onSubmit={onSubmit}>
        {message && <div className="card-1 warning fs-80 p-2"><span><i>{message}</i></span></div>}
        <div className="d-flex flex-column gap-2">
            <Text autoComplete="new-password" value={username} placeholder="Username or email..." onChange={onChangeUsername} left={<PersonFill className="fore-2 size-1" />} />
            <Text autoComplete="new-password" type={passwordType} placeholder="Password..." value={password} onChange={onChangePassword} left={<LockFill className="fore-2 size-1" />}
                right={isShowPassword ?
                    <EyeFill className="fore-2-btn size-1" onClick={onShowPassword} /> :
                    <EyeSlashFill className="fore-2-btn size-1" onClick={onHidePassword} />
                } />
        </div>
        <StatusLayout status={loginStatus}>
            <loading><LoadingAlert /></loading>
            <ready>
                <div className="d-flex align-self-stretch">
                    <Button className="flex-grow-1" type="submit" disabled={isLoginButtonDisabled}>Login</Button>
                </div>
            </ready>
            <error><ErrorAlert /></error>
        </StatusLayout>
        <p className="align-self-center" style={{ color: "#ffffff80", fontSize: "0.8em" }}>
            <i>You forgot your <Link to="/login/forgot/username">username</Link> or <Link to="/login/forgot">password</Link>?</i>
        </p>
    </form>
}

function UsernameRegistration({ username, setUsername, setInvalid, ...props }) {
    const [isUsernameInvalid, setUsernameInvalid] = useState(true)
    const [isUsernameTaken, setUsernameTaken] = useState(false)

    const [usernameTakenStatus, usernameTakenStatusActions] = useStatus("ready")

    const onUsernameChange = (ev) => {
        const [value, usernameInvalid] = [ev.target.value, !usefullRegExp.usernameReg.test(ev.target.value)]
        setUsername(value)
        setUsernameInvalid(usernameInvalid)
        setInvalid(true) // just for now, if username is valid, bebounce will fix this transition
        if (usernameInvalid || username === "") {
            usernameTakenStatusActions.setReady()
            stopUsernameDebounce()
        } else {
            usernameTakenStatusActions.setLoading()
            checkUsernameDebounce(value, usernameInvalid)
        }
    }

    const [checkUsernameDebounce, stopUsernameDebounce] = useDebounce((u, usernameInvalid) => {
        userAPI.getUsers(u, "exact")
            .then(res => res.json())
            .then(users => {
                const taken = users.length > 0
                setUsernameTaken(taken)
                setInvalid(usernameInvalid || taken)
                usernameTakenStatusActions.setReady()
            })
            .catch(err => usernameTakenStatusActions.setError())
    }, 2000)

    return <>
        <TextVal autoComplete="new-password" value={username} placeholder="Username..." onChange={onUsernameChange}
            left={<PersonFill className="fore-2 size-1" />} isInvalid={isUsernameInvalid} message={
                <>
                    <span><b>Required username pattern:</b></span>
                    <span>Between 8 and 20 characters are required.</span>
                </>
            } {...props} />
        {!isUsernameInvalid && username !== "" && <StatusLayout status={usernameTakenStatus}>
            <loading>
                <div className="card-1 d-flex flex-row gap-2 align-items-center">
                    <span className="fore-2 fs-80 flex-grow-1">Checking username uniqueness...</span> <Hourglass className="size-1 fore-2" />
                </div>
            </loading>
            <ready>
                {isUsernameTaken ?
                    <div className="card-1 d-flex flex-row gap-2 align-items-center">
                        <span className="fore-2 fs-80 flex-grow-1">Username is already taken.</span> <XCircle className="size-1 fore-danger" />
                    </div> :
                    <div className="card-1 d-flex flex-row gap-2 align-items-center">
                        <span className="fore-2 fs-80 flex-grow-1">Username is unique.</span> <Check2 className="size-1 fore-success" />
                    </div>}
            </ready>
            <error></error>
        </StatusLayout>}
    </>
}

function PasswordRegistration({ password, setPassword, setInvalid, ...props }) {
    /* password is managed outside for father form visibility */
    const [passwordRepeat, setPasswordRepeat] = useState("")

    /* invalidity is collapsed for father form visibility */
    const [isPasswordInvalid, setPasswordInvalid] = useState(true)
    const [isPasswordRepeatInvalid, setPasswordRepeatInvalid] = useState(true)

    const onChangePassword = (ev) => {
        const passwordInvalid = !usefullRegExp.passwordReg.test(ev.target.value)
        const repeatPasswordInvalid = ev.target.value !== passwordRepeat
        setPassword(ev.target.value)
        setPasswordInvalid(passwordInvalid)
        setPasswordRepeatInvalid(repeatPasswordInvalid)
        setInvalid(passwordInvalid || repeatPasswordInvalid)
    }

    const onChangeRepeatPassword = (ev) => {
        const repeatPasswordInvalid = ev.target.value !== password
        setPasswordRepeat(ev.target.value)
        setPasswordRepeatInvalid(repeatPasswordInvalid)
        setInvalid(isPasswordInvalid || repeatPasswordInvalid)
    }

    return <>
        <TextVal autoComplete="new-password" type="password" placeholder="Password..." value={password} onChange={onChangePassword}
            left={<LockFill className="fore-2 size-1" />} isInvalid={isPasswordInvalid} message={
                <>
                    <span><b>Required password pattern:</b></span>
                    <span>At least 1 lowercase character is required.</span>
                    <span>At least 1 uppercase character is required.</span>
                    <span>At least 1 special character is required.</span>
                    <span>At least 1 number is required.</span>
                </>
            } {...props} />
        <TextVal autoComplete="new-password" type="password" placeholder="Repeat password..." value={passwordRepeat} onChange={onChangeRepeatPassword}
            left={<Lock className="fore-2 size-1" />} isInvalid={isPasswordRepeatInvalid} message={
                <>
                    <span><b>Required repeat password rule:</b></span>
                    <span>Passwords should match.</span>
                </>
            } {...props} />
    </>
}

function RegistrationTab({ signupSuccessful }) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [email, setEMail] = useState("")

    const [isUsernameInvalidOrTaken, setUsernameInvalidOrTaken] = useState(true)
    const [isAnyPasswordInvalid, setAnyPasswordInvalid] = useState(true)
    const [isEmailInvalid, setEmailInvalid] = useState(true)

    const [message, setMessage] = useState("")

    const [registrationStatus, registrationStatusActions] = useStatus("ready")

    const onRegister = ev => {
        ev.preventDefault()
        userAPI.signup(username, password, email)
            .then(res => res.json())
            .then(res => {
                registrationStatusActions.setReady()
                signupSuccessful(res)
            })
            .catch(err => {
                registrationStatusActions.setReady()
                err.json()
                    .then(err => setMessage(err.message))
            })

    }

    const onChangeEMail = (ev) => {
        const value = ev.target.value
        setEMail(value)
        setEmailInvalid(!usefullRegExp.emailReg.test(value))
    }

    const isRegisterButtonDisabled = isUsernameInvalidOrTaken || isAnyPasswordInvalid || isEmailInvalid

    return <form className="d-flex flex-column align-self-stretch gap-3" onSubmit={onRegister}>
        {message && <div className="card-1 warning fs-80 p-2"><span><i>{message}</i></span></div>}
        <div className="d-flex flex-column gap-2">
            <UsernameRegistration username={username} setUsername={setUsername} setInvalid={setUsernameInvalidOrTaken} />
            <TextVal autoComplete="new-password" value={email} placeholder="Email..." onChange={onChangeEMail}
                left={<EnvelopeFill className="fore-2 size-1" />} isInvalid={isEmailInvalid} message={
                    <>
                        <span><b>Required email pattern:</b></span>
                        <span>Provide a valid email address.</span>
                    </>
                } />
            <PasswordRegistration password={password} setPassword={setPassword} setInvalid={setAnyPasswordInvalid} />
        </div>
        <StatusLayout status={registrationStatus}>
            <loading><LoadingAlert /></loading>
            <ready>
                <div className="d-flex align-self-stretch">
                    <Button type="submit" className="flex-grow-1" disabled={isRegisterButtonDisabled}>Register</Button>
                </div>
            </ready>
            <error><ErrorAlert /></error>
        </StatusLayout>
    </form>
}

function Account({ setUser }) {
    const navigate = useNavigate()

    const onSigninSuccessful = (response) => { setUser(response); navigate("/") }
    const onSignupSuccessful = (response) => { setUser(response); navigate("/") }

    return <div className="d-flex flex-column align-self-center gap-2 align-items-center flex-grow-1 justify-content-center p-0 max-w-300">
        <div style={{ marginTop: "-5em" }} className="align-self-center"><Logo fontSize={64} /></div>
        <TabsLayout>
            <div title={<>Sign In <BoxArrowInRight className="size-1" /></>}><LoginTab signinSuccessful={onSigninSuccessful} /></div>
            <div title={<>Sign Up <PersonPlusFill className="size-1" /></>}><RegistrationTab signupSuccessful={onSignupSuccessful} /></div>
        </TabsLayout>
    </div >
}

export { Account, UsernameRegistration, PasswordRegistration }