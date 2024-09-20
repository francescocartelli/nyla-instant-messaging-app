import { useState } from "react"
import { Chat, Person, PersonFill, PersonXFill, Search, XCircleFill } from "react-bootstrap-icons"
import { useNavigate } from "react-router-dom"

import { useStatus, useDebounce } from 'hooks'

import { ErrorAlert, LoadingAlert } from "components/Alerts/Alerts"
import { Text } from "components/Common/Inputs"
import { StatusLayout } from "components/Common/Layout"
import { Button } from "components/Common/Buttons"

import userAPI from 'api/userAPI'
import chatAPI from "api/chatAPI"

function UserCard({ user, badges, children }) {
    return <div className="row-center card-1 align-items-center position-relative">
        <div className="crd-icon-30"><PersonFill className="fore-2 size-2" /></div>
        <div className="d-flex flex-column">
            <span className="fs-110 fw-500">{user.username}</span>
            <span className="fore-2 fs-80"><i>{user.bio}</i></span>
        </div>
        {badges && badges}
        {children}
    </div>
}

function UsersSearchInput({ value, onChange, onLoading, onReady, onError, debounceDelay = 1000 }) {
    const [onDebouncePlay, onDebounceStop] = useDebounce((v) => {
        userAPI.getUsers(v)
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

function UserList({ users, status, onEmpty, onRenderItem }) {
    return <div className="d-flex flex-column gap-3 flex-grow-1 scroll-y">
        <StatusLayout status={status}>
            <loading>
                <div className="d-flex flex-grow-1 align-items-center justify-content-center m-2"><LoadingAlert /></div>
            </loading>
            <ready>
                {users?.length > 0 ? users.map(u => onRenderItem(u)) : onEmpty()}
            </ready>
            <error>
                <div className="d-flex flex-grow-1 align-items-center justify-content-center m-2"><ErrorAlert /></div>
            </error>
        </StatusLayout>
    </div>
}

function UsersSearchList({ onRenderItem = () => { } }) {
    const [users, setUsers] = useState([])
    const [userSearch, setUserSearch] = useState("")

    const [userSearchStatus, userSearchStatusActions] = useStatus('ready')

    return <div className="d-flex flex-column gap-3 flex-grow-1 scroll-y">
        <UsersSearchInput value={userSearch} onChange={setUserSearch}
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

function UsersSearch({ user }) {
    const navigate = useNavigate()

    const [redirectStatus, redirectStatusActions] = useStatus("ready")

    const onRedirect = (idChat) => navigate(`/chats/${idChat}`)

    const onClickOpenChat = (u) => {
        redirectStatusActions.setLoading()
        chatAPI.createChat({ name: null, users: [u, user], isGroup: false })
            .then(res => res.json())
            .then(chat => {
                onRedirect(chat.id);
                redirectStatusActions.setReady()
            })
            .catch(err => { console.log(err); redirectStatusActions.setError() })
    }

    return <div className="d-flex flex-grow-1 align-self-stretch mt-2 mb-2 h-0">
        <UsersSearchList onRenderItem={(u) => <UserCard key={u.id} user={u}>
            <div className="d-flex flex-grow-1 justify-content-end gap-2">
                {user.id === u.id ?
                    <div className="card-2"><p className="fore-2 m-0">You</p></div> :
                    <Button disabled={redirectStatus === "loading"} onClick={() => onClickOpenChat(u)}>open chat <Chat className="size-2 fore-2-btn" /></Button>
                }
            </div>
        </UserCard>} />
    </div>
}

export { UsersSearch, UsersSearchList, UsersSearchInput, UserList, UserCard }