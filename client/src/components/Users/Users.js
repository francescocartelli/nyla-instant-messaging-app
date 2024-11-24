import { useState } from "react"
import { Person, PersonFill, PersonXFill, Search, XCircleFill } from "react-bootstrap-icons"

import { ErrorAlert, LoadingAlert } from "components/Commons/Alerts"
import { StatusLayout } from "components/Commons/Layout"
import { Text } from "components/Commons/Inputs"

import { useDebounce, useStatus } from "hooks"

function UserCard({ user, badges, children }) {
    return <div className="row-center card-1 align-items-center position-relative">
        <div className="crd-icon-30 fore-2">{user.username.substring(0, 2)}</div>
        <div className="d-flex flex-column">
            <span className="fs-110 fw-500">{user.username}</span>
            <span className="fore-2 fs-80"><i>{user.bio}</i></span>
        </div>
        {badges && badges}
        {children}
    </div>
}

function UserList({ users, status, onEmpty, onRenderItem }) {
    return <div className="d-flex flex-column gap-3 flex-grow-1 scroll-y">
        <StatusLayout status={status}
            loading={<div className="d-flex flex-grow-1 align-items-center justify-content-center m-2"><LoadingAlert /></div>}
            ready={users?.length > 0 ? users.map(u => onRenderItem(u)) : onEmpty()}
            error={<div className="d-flex flex-grow-1 align-items-center justify-content-center m-2"><ErrorAlert /></div>}
        />
    </div>
}

function UsersSearchInput({ value, onChange, onSearch, onLoading, onReady, onError, debounceDelay = 1000 }) {
    const [onDebouncePlay, onDebounceStop] = useDebounce((v) => {
        onSearch(v)
            .then(res => res.json())
            .then(u => onReady(u))
            .catch(err => onError(err))
    }, debounceDelay)

    const onChangeValue = (ev) => {
        const value = ev.target.value
        onChange(value)
        if (value === "") {
            onReady([]); onDebounceStop()
        } else { onLoading(); onDebouncePlay(value) }
    }

    return <div className="d-flex flex-row gap-2" >
        <Text title="User search:" autoComplete="new-password" value={value} placeholder="Search by username..." onChange={onChangeValue}
            left={<Search className="size-1 fore-2" />}
            right={value === "" ? <></> : <XCircleFill onClick={() => onChangeValue({ target: { value: "" } })} className="size-1 fore-2-btn" />} />
    </div>
}

function UsersSearchList({ onSearch, onRenderItem = () => { } }) {
    const [users, setUsers] = useState([])
    const [userSearch, setUserSearch] = useState("")

    const [userSearchStatus, userSearchStatusActions] = useStatus({ isReady: true })

    return <div className="d-flex flex-column gap-3 flex-grow-1 scroll-y">
        <UsersSearchInput onSearch={onSearch} value={userSearch} onChange={setUserSearch}
            onLoading={() => userSearchStatusActions.setLoading()}
            onReady={(u) => { setUsers(u); userSearchStatusActions.setReady() }}
            onError={(err) => { console.log(err); userSearchStatusActions.setError() }} />
        <UserList users={users} status={userSearchStatus}
            onRenderItem={onRenderItem}
            onEmpty={() => userSearch === "" ? <div className="card-1 d-flex flex-row justify-content-center align-items-center gap-2">
                <Person className="size-2 fore-2" />
                <p className="m-0 text-center fore-2"><i>Mathing users will appear here...</i></p>
            </div> :
                <div className="card-1 d-flex flex-row justify-content-center align-items-center gap-2">
                    <PersonXFill className="size-2 fore-2" />
                    <p className="m-0 text-center text-center fore-2"><i>No users found...</i></p>
                </div>
            } />
    </div>
}

export { UserCard, UserList, UsersSearchInput, UsersSearchList }