import { useEffect, useState } from "react"
import { Chat, ChatFill, Exclamation, ExclamationCircleFill, Person, PersonCircle, PersonFill, PersonXFill, Search, X, XCircleFill } from "react-bootstrap-icons"

import userAPI from 'api/userAPI'
import { FlowState } from "utils/Utils"

import { ErrorAlert, LoadingAlert } from "components/Alerts/Alerts"
import { Text } from "components/Common/Inputs"
import { FlowLayout } from "components/Common/Layout"

import './Users.css'

function UserCard({ user }) {
    return <div className="row-center card-1">
        <div className="crd-icon"><PersonFill className="fore-2 size-2" /></div>
        <div className="d-flex flex-column flex-grow-1">
            <p className="crd-title">{user.username}</p>
            <p className="crd-subtitle c-gray"><i>{user.bio}</i></p>
        </div>
        <Chat className="size-2 fore-2-btn" />
    </div>
}

function UsersSearchInput({ value, onChange, onLoading, onReady, onError }) {
    const [userSearchDebounce, setUserSearchDebounce] = useState(null)

    useEffect(() => {
        onLoading()
        if (userSearchDebounce) clearTimeout(userSearchDebounce)
        setUserSearchDebounce(setTimeout(() => {
            userAPI.getUsers(value).then((u) => {
                onReady(u)
            }).catch(err => {
                onError(err)
            })
        }, 1000))
    }, [value])

    return <div className="d-flex flex-row gap-2" >
        <Text title="User search:" autoComplete="new-password" value={value} placeholder="Search by username..."
            onChange={(ev) => onChange(ev.target.value)}
            left={<Search className="size-1 fore-2" />}
            right={value === "" ? <></> : <XCircleFill onClick={() => onChange("")} className="size-1 fore-2-btn" />} />
    </div>
}

function UserList({ users, flowState, onEmpty, onRenderItem }) {
    return <div className="d-flex flex-column gap-3 flex-grow-1">
        <FlowLayout state={flowState}>
            <loading>
                <div className="d-flex flex-grow-1 align-items-center justify-content-center m-2"><LoadingAlert /></div>
            </loading>
            <ready>
                {users.length > 0 ? users.map(u => onRenderItem(u)) : onEmpty()}
            </ready>
            <error>
                <div className="d-flex flex-grow-1 align-items-center justify-content-center m-2"><ErrorAlert /></div>
            </error>
        </FlowLayout>
    </div>
}

function UsersSearchList({ onRenderItem = () => { } }) {
    const [users, setUsers] = useState([])
    const [userSearch, setUserSearch] = useState("")

    const userSearchFlow = FlowState()

    return <div className="d-flex flex-column gap-3 flex-grow-1 scroll-y">
        <UsersSearchInput value={userSearch} onChange={setUserSearch}
            onLoading={() => userSearchFlow.setLoading()}
            onReady={(u) => {
                setUsers(u)
                userSearchFlow.setReady()
            }}
            onError={(err) => userSearchFlow.setError()} />
        <UserList users={users} flowState={userSearchFlow.toString()}
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

function UsersSearch() {
    return <div className="d-flex flex-grow-1 align-self-stretch mt-2 mb-2">
        <UsersSearchList onRenderItem={(u) => <UserCard key={u.id} user={u} />} />
    </div>
}

export { UsersSearch, UsersSearchList, UsersSearchInput, UserList }