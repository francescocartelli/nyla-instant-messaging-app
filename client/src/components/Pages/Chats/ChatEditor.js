import { useState } from "react"
import { Chat, Check, Check2, Check2Square, CheckSquareFill, ChevronBarUp, Hourglass, Lock, PenFill, Pencil, Person, PersonBadge, PersonFill, Square, Unlock, X, XCircle } from "react-bootstrap-icons"

import { Button } from "components/Common/Buttons"
import { Text } from "components/Common/Inputs"
import { UserList, UsersSearchInput, UsersSearchList } from "components/Pages/Users/Users"
import { FlowState, sleep } from "utils/Utils"
import chatAPI from "api/chatAPI"

function UserCard({ user, onClick, onRemove, isSelected }) {
    const [isLoading, setLoading] = useState(false)

    return <div className="row-center card-1">
        <div className="crd-icon"><PersonFill className="fore-2 size-2" /></div>
        <div className="d-flex flex-column flex-grow-1">
            <p className="crd-title">{user.username}</p>
            <p className="crd-subtitle c-gray"><i>{user.bio}</i></p>
        </div>
        {isLoading ? <Hourglass className="fore-2 size-1" /> : <>
            {onClick && <Button onClick={() => onClick(user, setLoading)}>
                {isSelected ? <Check2 className="fore-success size-1" /> : <Square className="fore-2 size-1" />}
            </Button>}
            {onRemove && <Button onClick={() => onRemove(user, setLoading)}><XCircle className="fore-danger size-1" /></Button>}
        </>}
    </div>
}

function ChatEditor({ chat, setChat, users, setUsers, close }) {
    const [chatName, setChatName] = useState(chat?.name)

    const [isSearchVisible, setSearchVisible] = useState(false)

    const [isEditingChat, setEditingChat] = useState(false)
    const [isEditingUsers, setEditingUsers] = useState(false)

    const add = async (u, setLoading) => {
        setLoading(true)
        await sleep(3000)
        chatAPI.addUserChat(chat.id, u.id).then(() => {
            setLoading(false)
            setUsers(p => [...p, u])
        }).catch(err => console.log(err))
    }

    const remove = async (u, setLoading) => {
        setLoading(true)
        await sleep(3000)
        chatAPI.removeUserChat(chat.id, u.id).then(() => {
            setLoading(false)
            setUsers(p => p.filter(i => i.id !== u.id))
        }).catch(err => console.log(err))
    }

    return <div className="d-flex flex-column flex-grow-1 gap-3">
        <div className="d-flex flex-column card-1 gap-2">
            <div className="d-flex flex-row align-items-center">
                <p className="crd-title flex-grow-1">Edit chat:</p>
                <Button className='circle' onClick={() => close()}><X className="fore-2-btn size-1" /></Button>
            </div>
            <div className="d-flex flex-row gap-2">
                <Text className="flex-grow-1" placeholder="Group name..." disabled={!isEditingChat} value={chatName} onChange={(ev) => { setChatName(ev.target.value) }} />
                <div>{isEditingChat ?
                    <div className="d-flex flex-row gap-2">
                        <Button onClick={() => {
                            setEditingChat(false)
                            setChatName(chat.name)
                        }}><XCircle className="fore-2-btn size-1" /></Button>
                        <Button onClick={() => {
                            chatAPI.updateChat(chat.id, { name: chatName }).then(() => {
                                setChat(p => { return { ...p, name: chatName } })
                                setEditingChat(false)
                            }).catch(() => console.log("error"))
                        }}><Check2 className="fore-2-btn size-1" /></Button>
                    </div> : <Button onClick={() => setEditingChat(true)}><Pencil className="fore-2-btn size-1" /></Button>
                }</div>
            </div>
        </div>
        <div className="d-flex flex-row gap-2 card-1 align-items-center">
            <p className="crd-title flex-grow-1">Users in chat: {users.length}</p>
            {isEditingUsers ?
                <Button onClick={() => { setEditingUsers(false) }}><Unlock className="fore-2 size-1" /></Button> :
                <Button onClick={() => { setEditingUsers(true) }}><Lock className="fore-2 size-1" /></Button>}
        </div>
        {isEditingUsers && <Button onClick={() => setSearchVisible(p => !p)}>{
            isSearchVisible ? 'Show users...' : 'Search users...'
        }</Button>}
        {isSearchVisible && <>
            <UsersSearchList onRenderItem={(u) => {
                const isSelected = users.find(i => i.id === u.id)
                return <UserCard key={u.id} user={u} isSelected={isSelected} onClick={isSelected ? remove : add} />
            }} /></>}
        {!isSearchVisible && <>
            <UserList users={users} flowState={'ready'} initialCondition={true}
                onRenderItem={(u) => {
                    const onRemove = isEditingUsers ? () => remove : false
                    return <UserCard key={u.id} user={u} onRemove={remove}/>
                }}
                onEmpty={() => <div className="card-1 d-flex flex-row justify-content-center align-items-center gap-2">
                    <Person className="size-2 fore-2" />
                    <p className="m-0 text-center fore-2"><i>Users in chat will appear here...</i></p>
                </div>} />
        </>}
    </div>
}

export { ChatEditor }