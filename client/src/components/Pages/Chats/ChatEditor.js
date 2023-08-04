import { useState } from "react"
import { Check2, Hourglass, Lock, Pencil, Person, PersonFill, Square, Unlock, X, XCircle } from "react-bootstrap-icons"

import { Button } from "components/Common/Buttons"
import { Text } from "components/Common/Inputs"
import { UserList, UsersSearchList } from "components/Pages/Users/Users"
import chatAPI from "api/chatAPI"
import { useHistory } from "react-router-dom"
import { sleep } from "utils/Utils"

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
                {isSelected ? <>Added<Check2 className="fore-success size-1" /></> : <> Add<Square className="fore-2 size-1" /></>}
            </Button>}
            {onRemove && <Button onClick={() => onRemove(user, setLoading)}><XCircle className="fore-danger size-1" /></Button>}
        </>}
    </div>
}

function ChatEditor({user, chat, setChat, users, setUsers, close }) {
    const [chatName, setChatName] = useState(chat?.name)

    const [isSearchVisible, setSearchVisible] = useState(false)

    const [isEditingChat, setEditingChat] = useState(false)
    const [isEditingUsers, setEditingUsers] = useState(false)

    const add = async (u, setLoading) => {
        setLoading(true)
        chatAPI.addUserChat(chat.id, u.id).then(() => {
            setLoading(false)
            setUsers(p => [...p, u])
        }).catch(err => console.log(err))
    }

    const remove = async (u, setLoading) => {
        setLoading(true)
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
            <p className="crd-title flex-grow-1">Users in chat: {users?.length}</p>
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
                    const isUser = user.id === u.id
                    return <UserCard key={u.id} user={u} onRemove={isEditingUsers && !isUser ? remove : false} />
                }}
                onEmpty={() => <div className="card-1 d-flex flex-row justify-content-center align-items-center gap-2">
                    <Person className="size-2 fore-2" />
                    <p className="m-0 text-center fore-2"><i>Users in chat will appear here...</i></p>
                </div>} />
        </>}
    </div>
}


function NewChatEditor({ user }) {
    const [chat, setChat] = useState({ name: "", users: [user], isGroup: true })
    const [isSearchVisible, setSearchVisible] = useState(false)
    const [isLoading, setLoading] = useState(false)

    const history = useHistory()

    const submit = () => {
        sleep(3000)
        setLoading(true)
        chatAPI.createChat(chat).then((chat) => {
            history.push(`/chats/${chat.id}`)
        }).catch(err => {
            setLoading(false)
        })
    }

    const add = (u) => setChat(p => { return { ...p, users: [...p.users, u] } })
    const remove = (u) => setChat(p => { return { ...p, users: p.users.filter(i => i.id !== u.id) } })

    const isInvalid = () => { return chat.users?.length < 2 || chat.name === "" }

    return <div className="d-flex flex-column flex-grow-1 align-self-stretch gap-3 mt-2">
        <div className="d-flex flex-column card-1 gap-2">
            <div className="d-flex flex-row align-items-center">
                <p className="crd-title flex-grow-1">Edit chat:</p>
                <Button className='circle' onClick={() => { history.push('/chats') }}><X className="fore-2-btn size-1" /></Button>
            </div>
            <div className="d-flex flex-row gap-2">
                <Text className="flex-grow-1" placeholder="Group name..." value={chat.name}
                    onChange={(ev) => setChat(p => { return { ...p, name: ev.target.value } })} />
            </div>
        </div>
        <div className="d-flex flex-row gap-2 card-1 align-items-center">
            <p className="crd-title flex-grow-1">Users in chat: {chat.users?.length}</p>
        </div>
        <Button onClick={() => setSearchVisible(p => !p)}>{
            isSearchVisible ? 'Show users...' : 'Search users...'
        }</Button>
        {isSearchVisible && <>
            <UsersSearchList onRenderItem={(u) => {
                const isSelected = chat.users?.find(i => i.id === u.id)
                const isUser = u.id === user.id
                return <UserCard key={u.id} user={u} isSelected={isSelected} onClick={isUser ? false : (isSelected ? remove : add)} />
            }} /></>}
        {!isSearchVisible && <>
            <UserList users={chat.users} flowState={'ready'} initialCondition={true}
                onRenderItem={(u) => {
                    const isUser = u.id === user.id
                    return <UserCard key={u.id} user={u} onRemove={isUser ? false : remove} />
                }}
                onEmpty={() => <div className="card-1 d-flex flex-row justify-content-center align-items-center gap-2">
                    <Person className="size-2 fore-2" />
                    <p className="m-0 text-center fore-2"><i>Users in chat will appear here...</i></p>
                </div>} />
        </>}
        <Button isDisabled={isLoading || isInvalid()} onClick={() => submit()}>Create Group Chat</Button>
    </div>
}

export { ChatEditor, NewChatEditor }