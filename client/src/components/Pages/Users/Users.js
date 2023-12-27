import { useState } from "react"
import { Chat, Person, PersonFill, PersonXFill, Search, XCircleFill } from "react-bootstrap-icons"
import { useNavigate } from "react-router-dom"

import './Users.css'

import { useStatus } from 'hooks/useStatus'

import { ErrorAlert, LoadingAlert } from "components/Alerts/Alerts"
import { Text } from "components/Common/Inputs"
import { StatusLayout } from "components/Common/Layout"
import { Button } from "components/Common/Buttons"

import userAPI from 'api/userAPI'
import chatAPI from "api/chatAPI"
import { useDebounce } from "hooks/useDebounce"

function UserCard({ user, currentUser, onRedirect }) {
    const [isLoading, setLoading] = useState(false)

    const onClickOpenChat = () => {
        setLoading(true)
        chatAPI.createChat({ name: null, users: [user, currentUser], isGroup: false })
            .then(chat => onRedirect(chat.id))
            .catch(err => { console.log(err); setLoading(false) })
    }

    return <div className="row-center card-1">
        <div className="crd-icon-30"><PersonFill className="fore-2 size-2" /></div>
        <div className="d-flex flex-column flex-grow-1">
            <p className="crd-title">{user.username}</p>
            <p className="crd-subtitle c-gray"><i>{user.bio}</i></p>
        </div>
        {user.id !== currentUser.id ?
            <Button disabled={isLoading} onClick={onClickOpenChat}>open chat <Chat className="size-2 fore-2-btn" /></Button> :
            <div className="card-2"><p className="fore-2 m-0">You</p></div>}
    </div>
}

function UsersSearchInput({ value, onChange, onLoading, onReady, onError, debounceDelay = 1000 }) {
    const [onDebouncePlay, onDebounceStop] = useDebounce((v) => {
        userAPI.getUsers(v)
            .then((u) => onReady(u))
            .catch(err => { console.log(err); onError(err) })
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
    return <div className="d-flex flex-column gap-3 flex-grow-1">
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

    const onRedirect = (idChat) => navigate(`/chats/${idChat}`)

    return <div className="d-flex flex-grow-1 align-self-stretch mt-2 mb-2">
        <UsersSearchList onRenderItem={(u) => <UserCard key={u.id} user={u} currentUser={user} onRedirect={onRedirect} />} />
    </div>
}

export { UsersSearch, UsersSearchList, UsersSearchInput, UserList }