import { useState } from "react"
import { Chat, Check, Check2, Check2Square, CheckSquareFill, ChevronBarUp, PenFill, Pencil, Person, PersonBadge, PersonFill, Square, XCircle } from "react-bootstrap-icons"

import { Button } from "components/Common/Buttons"
import { Text } from "components/Common/Inputs"
import { UserList, UsersSearchInput, UsersSearchList } from "components/Pages/Users/Users"
import { FlowState } from "utils/Utils"

function UserCard({ user, onClick, onRemove, isSelected }) {
    return <div className="row-center card-1">
        <div className="crd-icon"><PersonFill className="fore-2 size-2" /></div>
        <div className="d-flex flex-column flex-grow-1">
            <p className="crd-title">{user.username}</p>
            <p className="crd-subtitle c-gray"><i>{user.bio}</i></p>
        </div>
        <div>
            {onClick && <Button onClick={() => onClick()}>
                {isSelected ? <Check2 className="fore-success size-1" /> : <Square className="fore-2 size-1" />}
            </Button>}
            {onRemove && <Button onClick={() => onRemove()}><XCircle className="fore-danger size-1" /></Button>}
        </div>
    </div>
}

function ChatEditor({ chat, close }) {
    const [users, setUsers] = useState([])
    const [chatName, setChatName] = useState(chat?.name)

    const [isSearchVisible, setSearchVisible] = useState(false)
    const [isSelectedVisible, setSelectedVisible] = useState(true)

    const [isEditing, setEditing] = useState(false)

    const add = (u) => setUsers(p => [...p, u])
    const remove = (u) => setUsers(p => p.filter(i => i.id !== u.id))

    return <div className="d-flex flex-column flex-grow-1 gap-3">
        <div className="d-flex flex-column card-1 gap-2">
            <div className="d-flex flex-row align-items-center">
                <p className="crd-title flex-grow-1">Edit chat:</p>
                <div><Button onClick={() => close()}><XCircle className="fore-2-btn" /></Button></div>
            </div>
            <div className="d-flex flex-row gap-2">
                <Text className="flex-grow-1" readOnly={!isEditing} value={chatName} onChange={(ev) => { setChatName(ev.target.value) }} />
                <div>{isEditing ?
                    <div className="d-flex flex-row gap-2">
                        <Button onClick={() => {
                            setEditing(false)
                            setChatName(chat.name)
                        }}><XCircle className="fore-2-btn size-1" /></Button>
                        <Button onClick={() => {
                            setEditing(false)
                        }}><Check2 className="fore-2-btn size-1" /></Button>
                    </div> :
                    <Button onClick={() => setEditing(true)}><Pencil className="fore-2-btn size-1" /></Button>
                }</div>
            </div>
        </div>
        <div className="d-flex flex-row gap-2 card-1 align-items-center">
            <p className="crd-title flex-grow-1">Users in chat: {users.length}</p>
            <div>
                {isSearchVisible ?
                    <Button onClick={() => {
                        setSearchVisible(false)
                        setSelectedVisible(true)
                    }}>Confirm Changes</Button> :
                    <Button onClick={() => {
                        setSearchVisible(true)
                        setSelectedVisible(false)
                    }}>Edit Users</Button>}
            </div>
        </div>
        {isSearchVisible && <>
            <UsersSearchList onRenderItem={(u) => {
                const isSelected = users.find(i => i.id === u.id)
                return <UserCard key={u.id}
                    user={u} isSelected={isSelected}
                    onClick={() => isSelected ? remove(u) : add(u)} />
            }} /></>}
        {isSelectedVisible && <>
            <UserList users={users} flowState={'ready'} initialCondition={true}
                onRenderItem={(u) => <UserCard key={u.id} user={u} onRemove={() => remove(u)} />}
                onEmpty={() => <div className="card-1 d-flex flex-row justify-content-center align-items-center gap-2">
                    <Person className="size-2 fore-2" />
                    <p className="m-0 text-center fore-2"><i>Users in chat will appear here...</i></p>
                </div>} />
        </>}
    </div>
}

export { ChatEditor }