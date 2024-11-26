import { useState } from 'react'
import { Check2, EnvelopeFill, Hourglass, Lock, LockFill, PersonFill, XCircle } from 'react-bootstrap-icons'

import { useDebounce, useStatus } from '@/hooks'

import { TextVal } from '@/components/Commons/Inputs'
import { StatusLayout } from '@/components/Commons/Layout'

const usernameReg = /^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$/
const emailReg = /^\S+@\S+\.\S+$/
const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$/

function UsernameRegistration({ username, setUsername, onCheck, setInvalid, ...props }) {
    const [isUsernameInvalid, setUsernameInvalid] = useState(true)
    const [isUsernameTaken, setUsernameTaken] = useState(false)

    const [usernameTakenStatus, usernameTakenStatusActions] = useStatus({ isReady: true })

    const onUsernameChange = (ev) => {
        const [value, usernameInvalid] = [ev.target.value, !usernameReg.test(ev.target.value)]
        setUsername(value)
        setUsernameInvalid(usernameInvalid)
        setInvalid(true) // just for now, if username is valid, bebounce will fix this transition
        if (usernameInvalid || value === "") {
            usernameTakenStatusActions.setReady()
            stopUsernameDebounce()
        } else {
            usernameTakenStatusActions.setLoading()
            checkUsernameDebounce(value, usernameInvalid)
        }
    }

    const [checkUsernameDebounce, stopUsernameDebounce] = useDebounce((u, usernameInvalid) => {
        onCheck(u, "exact")
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
        {!isUsernameInvalid && username !== "" &&
            <StatusLayout status={usernameTakenStatus}
                loading={<div className="card-1 d-flex flex-row gap-2 align-items-center">
                    <span className="fore-2 fs-80 flex-grow-1">Checking username uniqueness...</span> <Hourglass className="size-1 fore-2" />
                </div>}
                ready={isUsernameTaken ?
                    <div className="card-1 d-flex flex-row gap-2 align-items-center">
                        <span className="fore-2 fs-80 flex-grow-1">Username is already taken.</span> <XCircle className="size-1 fore-danger" />
                    </div> :
                    <div className="card-1 d-flex flex-row gap-2 align-items-center">
                        <span className="fore-2 fs-80 flex-grow-1">Username is unique.</span> <Check2 className="size-1 fore-success" />
                    </div>}
            />
        }
    </>
}

function PasswordRegistration({ password, setPassword, setInvalid, ...props }) {
    /* password is managed outside for father form visibility */
    const [passwordRepeat, setPasswordRepeat] = useState("")

    /* invalidity is collapsed for father form visibility */
    const [isPasswordInvalid, setPasswordInvalid] = useState(true)
    const [isPasswordRepeatInvalid, setPasswordRepeatInvalid] = useState(true)

    const onChangePassword = (ev) => {
        const passwordInvalid = !passwordReg.test(ev.target.value)
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

function EmailRegistration({email, setEMail, isEmailInvalid, setEmailInvalid}) {
    const onChangeEMail = ev => {
        const value = ev.target.value
        setEMail(value)
        setEmailInvalid(!emailReg.test(value))
    }

    return <TextVal autoComplete="new-password" value={email} placeholder="Email..." onChange={onChangeEMail}
        left={<EnvelopeFill className="fore-2 size-1" />} isInvalid={isEmailInvalid} message={
            <>
                <span><b>Required email pattern:</b></span>
                <span>Provide a valid email address.</span>
            </>
        } />
}

export { UsernameRegistration, PasswordRegistration, EmailRegistration }