import { useEffect, useState } from "react"
import { BoxArrowInRight, Check2, EnvelopeFill, EyeFill, EyeSlashFill, Hourglass, Lock, LockFill, PersonFill, PersonPlusFill, XCircle } from "react-bootstrap-icons"
import { Link, useNavigate } from "react-router-dom"

import "./Account.css"

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
        userAPI.signin(username, password).then((response) => {
            loginStatusActions.setReady()
            signinSuccessful(response)
        }).catch((err) => {
            loginStatusActions.setReady()
            console.log(err)
            setMessage(err.message)
        })
    }

    const onChangeUsername = (ev) => setUsername(ev.target.value)
    const onChangePassword = (ev) => setPassword(ev.target.value)
    const onShowPassword = (ev) => setShowPassword(false)
    const onHidePassword = (ev) => setShowPassword(true)

    const passwordType = isShowPassword ? "text" : "password"
    const isLoginButtonDisabled = !username || !password

    return <form className="d-flex align-self-stretch flex-column gap-3" onSubmit={onSubmit}>
        {message && <div className="alert warning"><p><i>{message}</i></p></div>}
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

function RegistrationTab({ signupSuccessful }) {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [passwordRepeat, setPasswordRepeat] = useState("")
    const [email, setEMail] = useState("")

    const [isUsernameTaken, setUsernameTaken] = useState(false)

    const [isUsernameInvalid, setUsernameInvalid] = useState(true)
    const [isPasswordInvalid, setPasswordInvalid] = useState(true)
    const [isPasswordRepeatInvalid, setPasswordRepeatInvalid] = useState(true)
    const [isEmailInvalid, setEmailInvalid] = useState(true)

    const [message, setMessage] = useState("")

    const [checkUsernameDebounce, stopUsernameDebounce] = useDebounce((u) => {
        userAPI.getUsers(u, "exact").then(users => {
            const taken = users.length > 0
            setUsernameTaken(taken)
            console.log(taken)
            usernameTakenStatusActions.setReady()
        }).catch((err) => { console.log(err); usernameTakenStatusActions.setError() })
    }, 2000)

    const [registrationStatus, registrationStatusActions] = useStatus("ready")
    const [usernameTakenStatus, usernameTakenStatusActions] = useStatus("ready")

    const onRegister = (e) => {
        e.preventDefault()
        userAPI.signup(username, password, email).then((response) => {
            registrationStatusActions.setReady()
            signupSuccessful(response)
        }).catch(err => {
            registrationStatusActions.setReady()
            setMessage(err.message)
        })
    }

    const onUsernameChange = (ev) => {
        const value = ev.target.value
        const isInvalid = !usefullRegExp.usernameReg.test(value)
        setUsername(value)
        setUsernameInvalid(isInvalid)

        if (!isInvalid && username !== "") {
            usernameTakenStatusActions.setLoading()
            checkUsernameDebounce(value)
        } else {
            usernameTakenStatusActions.setReady()
            stopUsernameDebounce()
        }
    }

    const onChangeEMail = (ev) => {
        const value = ev.target.value
        setEMail(value)
        setEmailInvalid(!usefullRegExp.emailReg.test(value))
    }

    const onChangePassword = (ev) => {
        const value = ev.target.value
        setPassword(value)
        setPasswordInvalid(!usefullRegExp.passwordReg.test(value))
        setPasswordRepeatInvalid(value !== passwordRepeat)
    }

    const onChangeRepeatPassword = (ev) => {
        const value = ev.target.value
        setPasswordRepeat(ev.target.value)
        setPasswordRepeatInvalid(password !== value)
    }

    const isRegisterButtonDisabled = isUsernameInvalid || isPasswordInvalid || isPasswordRepeatInvalid || isEmailInvalid || isUsernameTaken

    return <form className="d-flex flex-column align-self-stretch gap-3" onSubmit={onRegister}>
        {message && <div className="alert warning"><p><i>{message}</i></p></div>}
        <div className="d-flex flex-column gap-2">
            <TextVal autoComplete="new-password" value={username} placeholder="Username..." onChange={onUsernameChange}
                left={<PersonFill className="fore-2 size-1" />} isInvalid={isUsernameInvalid} message={
                    <>
                        <span><b>Required username pattern:</b></span>
                        <span>Between 8 and 20 characters are required.</span>
                    </>
                } />
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
            <TextVal autoComplete="new-password" value={email} placeholder="Email..." onChange={onChangeEMail}
                left={<EnvelopeFill className="fore-2 size-1" />} isInvalid={isEmailInvalid} message={
                    <>
                        <span><b>Required email pattern:</b></span>
                        <span>Provide a valid email address.</span>
                    </>
                } />
            <TextVal autoComplete="new-password" type="password" placeholder="Password..." value={password} onChange={onChangePassword}
                left={<LockFill className="fore-2 size-1" />} isInvalid={isPasswordInvalid} message={
                    <>
                        <span><b>Required password pattern:</b></span>
                        <span>At least 1 lowercase character is required.</span>
                        <span>At least 1 uppercase character is required.</span>
                        <span>At least 1 special character is required.</span>
                        <span>At least 1 number is required.</span>
                    </>
                } />
            <TextVal autoComplete="new-password" type="password" placeholder="Repeat password..." value={passwordRepeat} onChange={onChangeRepeatPassword}
                left={<Lock className="fore-2 size-1" />} isInvalid={isPasswordRepeatInvalid} message={
                    <>
                        <span><b>Required repeat password rule:</b></span>
                        <span>Passwords should match.</span>
                    </>
                } />
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

    const onSigninSuccessful = (response) => {
        setUser(response)
        navigate("/")
    }

    const onSignupSuccessful = (response) => {
        setUser(response)
        navigate("/")
    }

    return <div className="d-flex flex-column align-self-center gap-2 align-items-center flex-grow-1 justify-content-center p-0 max-s">
        <div style={{ marginTop: "-5em" }} className="align-self-center"><Logo fontSize={64} /></div>
        <TabsLayout>
            <div title={<>Sign In <BoxArrowInRight className="size-1" /></>}><LoginTab signinSuccessful={onSigninSuccessful} /></div>
            <div title={<>Sign Up <PersonPlusFill className="size-1" /></>}><RegistrationTab signupSuccessful={onSignupSuccessful} /></div>
        </TabsLayout>
    </div >
}

export { Account }