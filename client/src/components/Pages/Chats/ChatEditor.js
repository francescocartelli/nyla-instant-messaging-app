import { useState } from "react"
import { Check, Check2, ChevronDown, ChevronUp, Hourglass, Lock, Pencil, Person, PersonFill, Square, TrashFill, Unlock, X, XCircle } from "react-bootstrap-icons"
import { useNavigate } from "react-router-dom"

import { Button } from "components/Common/Buttons"
import { Text } from "components/Common/Inputs"
import { UserList, UsersSearchList } from "components/Pages/Users/Users"
import { useStatus } from "hooks/useStatus"

import { FlowLayout } from "components/Common/Layout"
import { ErrorAlert, LoadingAlert } from "components/Alerts/Alerts"

import chatAPI from "api/chatAPI"

function UserCard({ user, onClick, onRemove, isSelected }) {
    const [isLoading, setLoading] = useState(false)

    const onClickAddUser = () => onClick(user, setLoading)
    const onClickRemoveUser = () => onRemove(user, setLoading)

    return <div className="row-center card-1">
        <div className="crd-icon"><PersonFill className="fore-2 size-2" /></div>
        <div className="d-flex flex-column flex-grow-1">
            <p className="crd-title">{user.username}</p>
            <p className="crd-subtitle c-gray"><i>{user.bio}</i></p>
        </div>
        {isLoading ? <Hourglass className="fore-2 size-1" /> : <>
            {onClick && <Button onClick={onClickAddUser}>
                {isSelected ? <>Added<Check2 className="fore-success size-1" /></> : <> Add<Square className="fore-2 size-1" /></>}
            </Button>}
            {onRemove && <Button onClick={onClickRemoveUser}><XCircle className="fore-danger size-1" /></Button>}
        </>}
    </div>
}

function ChatEditor({ user, chat, setChat, usersFlow, users, setUsers, close }) {
    const [chatName, setChatName] = useState(chat?.name)

    const [isSearchVisible, setSearchVisible] = useState(false)

    const [isUpdating, setUpdating] = useState(false)
    const [isEditingChat, setEditingChat] = useState(false)
    const [isEditingUsers, setEditingUsers] = useState(false)
    const [isAdvancedSettings, setAdvancedSettings] = useState(false)
    const [isDeletingChat, setDeletingChat] = useState(false)

    const [deleteStatus, deleteStatusActions] = useStatus('ready')

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
    const deleteChat = () => {
        deleteStatusActions.setLoading()
        chatAPI.deleteChat(chat.id).then(() => {
            // no need to redirect here, await websocket message
        }).catch(err => { deleteStatusActions.setError(); console.log(err) })
    }
    const onClickEditChat = () => setEditingChat(true)
    const onClickCancelEditChatName = () => { setEditingChat(false); setChatName(chat.name) }
    const onClickConfirmEditChatName = () => {
        setUpdating(true)
        chatAPI.updateChat(chat.id, { name: chatName }).then(() => {
            setUpdating(false)
            setChat(p => { return { ...p, name: chatName } })
            setEditingChat(false)
        }).catch((err) => {
            setUpdating(false)
            setEditingChat(false)
            console.log(err)
        })
    }
    const onChangeChatName = (ev) => setChatName(ev.target.value)
    const onClickEditUsers = () => { setEditingUsers(false) }
    const onClickCancelEditUsers = () => { setEditingUsers(true) }

    return <div className="d-flex flex-column flex-grow-1 gap-3 scroll-y mb-1 h-0">
        <div className="d-flex flex-column card-1 gap-2">
            <div className="d-flex flex-row align-items-center">
                <p className="crd-title flex-grow-1">Settings:</p>
                <Button className='circle' onClick={close}><X className="fore-2-btn size-1" /></Button>
            </div>
            {chat.isGroup && <div className="d-flex flex-row gap-2 align-items-center">
                <Text className="flex-grow-1" placeholder="Group name..." disabled={!isEditingChat} value={chatName} onChange={onChangeChatName} />
                <div>{isEditingChat ?
                    <div className="d-flex flex-row gap-2">
                        <Button onClick={onClickCancelEditChatName}><XCircle className="fore-2-btn size-1" /></Button>
                        <Button disabled={isUpdating} onClick={onClickConfirmEditChatName}><Check2 className="fore-2-btn size-1" /></Button>
                    </div> : <Button onClick={onClickEditChat}><Pencil className="fore-2-btn size-1" /></Button>
                }</div>
            </div>}
        </div>
        {chat.isGroup && <>
            <div className="d-flex flex-row gap-2 card-1 align-items-center">
                <p className="crd-title flex-grow-1">Users in chat: {users?.length}</p>
                {isEditingUsers ?
                    <Button onClick={onClickEditUsers}><Unlock className="fore-2 size-1" /></Button> :
                    <Button onClick={onClickCancelEditUsers}><Lock className="fore-2 size-1" /></Button>}
            </div>
            {isEditingUsers && <Button onClick={() => setSearchVisible(p => !p)}>{isSearchVisible ? 'Show users...' : 'Search users...'}</Button>}
            {isSearchVisible && <>
                <UsersSearchList onRenderItem={(u) => {
                    const isSelected = users.find(i => i.id === u.id)
                    return <UserCard key={u.id} user={u} isSelected={isSelected} onClick={isSelected ? remove : add} />
                }} /></>}
            {!isSearchVisible && <>
                <UserList users={users} status={'ready'} initialCondition={true}
                    onRenderItem={(u) => {
                        const isUser = user.id === u.id
                        return <UserCard key={u.id} user={u} onRemove={isEditingUsers && !isUser ? remove : false} />
                    }}
                    onEmpty={() => <div className="card-1 d-flex flex-row justify-content-center align-items-center gap-2">
                        <Person className="size-2 fore-2" />
                        <p className="m-0 text-center fore-2"><i>Users in chat will appear here...</i></p>
                    </div>} />
            </>}</>}
        <div className="d-flex flex-column card-1 gap-2 ">
            <FlowLayout status={deleteStatus}>
                <loading><LoadingAlert /></loading>
                <ready>
                    <div className="d-flex flex-row gap-2 align-items-center">
                        <p className="crd-title flex-grow-1">Advanced Settings:</p>
                        {isAdvancedSettings ?
                            <Button onClick={() => setAdvancedSettings(false)}><ChevronUp className="fore-2-btn size-1" /></Button> :
                            <Button onClick={() => setAdvancedSettings(true)}><ChevronDown className="fore-2-btn size-1" /></Button>
                        }
                    </div>
                    {isAdvancedSettings && <div className="d-flex flex-row gap-2">
                        {isDeletingChat ? <>
                            <Button className="flex-grow-1" onClick={() => deleteChat()}>Confirm Delete <Check className="fore-danger size-1" /></Button>
                            <Button className="flex-grow-1" onClick={() => setDeletingChat(false)}>Cancel Delete <X className="fore-2-btn size-1" /></Button>
                        </> : <Button className="flex-grow-1" onClick={() => setDeletingChat(true)}>Delete Chat <TrashFill className="fore-danger size-1" /></Button>}
                    </div>}
                </ready>
                <error><ErrorAlert /></error>
            </FlowLayout>
        </div>
    </div>
}


function NewChatEditor({ user }) {
    const [chat, setChat] = useState({ name: "", users: [user], isGroup: true })
    const [isSearchVisible, setSearchVisible] = useState(false)
    const [isLoading, setLoading] = useState(false)

    const navigate = useNavigate()

    const onSubmit = () => {
        setLoading(true)
        chatAPI.createChat(chat)
            .then((chat) => navigate(`/chats/${chat.id}`))
            .catch(err => setLoading(false))
    }

    const addUser = (u) => setChat(p => { return { ...p, users: [...p.users, u] } })
    const removeUser = (u) => setChat(p => { return { ...p, users: p.users.filter(i => i.id !== u.id) } })
    const onChangeGroupName = (ev) => setChat(p => { return { ...p, name: ev.target.value } })
    const onClickNewChatExit = () => navigate('/chats')

    const isSubmitButtonDisabled = isLoading || chat.users?.length < 2 || chat.name === ""

    return <div className="d-flex flex-column flex-grow-1 align-self-stretch gap-3 mt-2 mb-1 overflow-">
        <div className="d-flex flex-column card-1 gap-2">
            <div className="d-flex flex-row align-items-center">
                <p className="crd-title flex-grow-1">Create a new chat:</p>
                <Button className='circle' onClick={onClickNewChatExit}><X className="fore-2-btn size-1" /></Button>
            </div>
            <div className="d-flex flex-row gap-2">
                <Text className="flex-grow-1" placeholder="Group name..." value={chat.name} onChange={onChangeGroupName} />
            </div>
        </div>
        <div className="d-flex flex-row gap-2 card-1 align-items-center">
            <p className="crd-title flex-grow-1">Users in chat: {chat.users?.length}</p>
        </div>
        <Button onClick={() => setSearchVisible(p => !p)}>{isSearchVisible ? 'Show users...' : 'Search users...'}</Button>
        {isSearchVisible && <>
            <UsersSearchList onRenderItem={(u) => {
                const isSelected = chat.users?.find(i => i.id === u.id)
                const isUser = u.id === user.id
                return <UserCard key={u.id} user={u} isSelected={isSelected} onClick={isUser ? false : (isSelected ? removeUser : addUser)} />
            }} /></>}
        {!isSearchVisible && <>
            <UserList users={chat.users} status={'ready'} initialCondition={true}
                onRenderItem={(u) => {
                    const isUser = u.id === user.id
                    return <UserCard key={u.id} user={u} onRemove={isUser ? false : removeUser} />
                }}
                onEmpty={() => <div className="card-1 d-flex flex-row justify-content-center align-items-center gap-2">
                    <Person className="size-2 fore-2" />
                    <p className="m-0 text-center fore-2"><i>Users in chat will appear here...</i></p>
                </div>} />
        </>}
        <Button disabled={isSubmitButtonDisabled} onClick={onSubmit}>Create Group Chat</Button>
    </div>
}

export { ChatEditor, NewChatEditor }