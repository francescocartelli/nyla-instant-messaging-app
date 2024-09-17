import { useState } from "react"
import { Check, Check2, Check2Square, ChevronDown, ChevronUp, Hourglass, Lock, Pencil, Person, TrashFill, Unlock, X, XCircle } from "react-bootstrap-icons"
import { useNavigate } from "react-router-dom"

import { useStatus } from "hooks"

import { Button } from "components/Common/Buttons"
import { Text } from "components/Common/Inputs"
import { UserCard, UserList, UsersSearchList } from "components/Pages/Users/Users"

import { StatusLayout } from "components/Common/Layout"
import { ErrorAlert, LoadingAlert } from "components/Alerts/Alerts"

import chatAPI from "api/chatAPI"

function EmptyUserList() {
    return <div className="card-1 d-flex flex-row justify-content-center align-items-center gap-2">
        <Person className="size-2 fore-2" />
        <p className="m-0 text-center fore-2"><i>Users in chat will appear here...</i></p>
    </div>
}

function UserCardInChat({ user, onAdd, onRemove, isEditing = false, isSelected = false, isUser = false }) {
    const [isLoading, setLoading] = useState(false)

    return <UserCard user={user}>
        {isEditing && <>{isLoading ? <Hourglass className="fore-2 size-1" /> :
            <>
                {isUser ? <div className="card-2"><p className="fore-2 m-0">You</p></div> : <>
                    {isSelected ?
                        <Button onClick={() => onRemove(user, setLoading)}>Remove <XCircle className="fore-danger size-1" /></Button> :
                        <Button onClick={() => onAdd(user, setLoading)}>Add <Check2Square className="fore-success size-1" /></Button>}
                </>}
            </>}
        </>}
    </UserCard>
}

function ChatEditor({ user, chat, setChat, users, setUsers, close }) {
    const [chatName, setChatName] = useState(chat?.name)

    const [isSearchVisible, setSearchVisible] = useState(false)

    const [isEditingChat, setEditingChat] = useState(false)
    const [isEditingUsers, setEditingUsers] = useState(false)
    const [isAdvancedSettings, setAdvancedSettings] = useState(false)
    const [isDeletingChat, setDeletingChat] = useState(false)

    const [chatNameStatus, chatNameStatusActions] = useStatus("ready")
    const [deleteStatus, deleteStatusActions] = useStatus("ready")

    const navigate = useNavigate()

    const addUser = async (u, setLoading) => {
        setLoading(true)
        chatAPI.addUserChat(chat.id, u.id)
            .then(() => {
                setLoading(false)
                setUsers(p => [...p, u])
                setChat(p => ({ ...p, nUsers: p.nUsers + 1 }))
            })
            .catch(err => console.log(err))
    }
    const removeUser = async (u, setLoading) => {
        setLoading(true)
        chatAPI.removeUserChat(chat.id, u.id)
            .then(() => {
                setLoading(false)
                setUsers(p => p.filter(i => i.id !== u.id))
                setChat(p => ({ ...p, nUsers: p.nUsers - 1 }))
            })
            .catch(err => console.log(err))
    }
    const deleteChat = () => {
        deleteStatusActions.setLoading()
        chatAPI.deleteChat(chat.id)
            .then(() => {
                navigate("/chats")
            })
            .catch(err => { deleteStatusActions.setError(); console.log(err) })
    }
    const onClickEditChat = () => setEditingChat(true)
    const onClickCancelEditChatName = () => { setEditingChat(false); setChatName(chat.name) }
    const onClickConfirmEditChatName = () => {
        chatNameStatusActions.setLoading()
        chatAPI.updateChat(chat.id, { name: chatName })
            .then(() => {
                chatNameStatusActions.setReady()
                setChat(p => { return { ...p, name: chatName } })
                setEditingChat(false)
            })
            .catch(err => {
                chatNameStatusActions.setError()
                setEditingChat(false)
            })
    }
    const onChangeChatName = (ev) => setChatName(ev.target.value)
    const onClickEditUsers = () => { setEditingUsers(true) }
    const onClickCancelEditUsers = () => { setEditingUsers(false); setSearchVisible(false) }
    const renderUser = (u) => {
        return <UserCardInChat key={u.id} user={u}
            onAdd={addUser} onRemove={removeUser}
            isEditing={isEditingUsers}
            isSelected={users.find(i => i.id === u.id)}
            isUser={u.id === user.id}>
        </UserCardInChat>
    }

    return <div className="d-flex flex-column flex-grow-1 gap-3 mb-1 h-0">
        <div className="d-flex flex-column card-1 gap-2">
            <div className="d-flex flex-row align-items-center">
                <span className="fs-110 fw-500 flex-grow-1">Settings:</span>
                <Button className="circle" onClick={close}><X className="fore-2-btn size-1" /></Button>
            </div>
            {chat.isGroup && <div className="d-flex flex-row gap-2 align-items-center">
                <Text className="flex-grow-1" placeholder="Group name..." disabled={!isEditingChat} value={chatName} onChange={onChangeChatName} />
                <div>{isEditingChat ?
                    <div className="d-flex flex-row gap-2">
                        <Button onClick={onClickCancelEditChatName}><XCircle className="fore-2-btn size-1" /></Button>
                        <Button disabled={chatNameStatus === "loading"} onClick={onClickConfirmEditChatName}><Check2 className="fore-2-btn size-1" /></Button>
                    </div> : <Button onClick={onClickEditChat}><Pencil className="fore-2-btn size-1" /></Button>
                }</div>
            </div>}
        </div>
        {chat.isGroup && <>
            <div className="d-flex flex-row gap-2 card-1 align-items-center">
                <span className="fs-110 fw-500 flex-grow-1">Users in chat: {users?.length}</span>
                {isEditingUsers ? <>
                    <Button onClick={() => setSearchVisible(p => !p)}>{isSearchVisible ? "Show users" : "Add new users"}</Button>
                    <Button onClick={onClickCancelEditUsers}><Unlock className="fore-2 size-1" /></Button>
                </> : <Button onClick={onClickEditUsers}><Lock className="fore-2 size-1" /></Button>}
            </div>
            <div className="d-flex flex-grow-1 scroll-y h-0">
                {isSearchVisible ?
                    <UsersSearchList onRenderItem={(u) => renderUser(u)} /> :
                    <UserList users={users} status={"ready"} onRenderItem={(u) => renderUser(u)} onEmpty={() => <EmptyUserList />} />
                }
            </div>
        </>}
        <div className="d-flex flex-column card-1 gap-2 ">
            <StatusLayout status={deleteStatus}>
                <loading><LoadingAlert /></loading>
                <ready>
                    <div className="d-flex flex-row gap-2 align-items-center">
                        <span className="fs-110 fw-500 flex-grow-1">Advanced Settings:</span>
                        {isAdvancedSettings ?
                            <Button onClick={() => setAdvancedSettings(false)}><ChevronUp className="fore-2-btn size-1" /></Button> :
                            <Button onClick={() => setAdvancedSettings(true)}><ChevronDown className="fore-2-btn size-1" /></Button>
                        }
                    </div>
                    {isAdvancedSettings && <div className="d-flex flex-row gap-2">
                        {isDeletingChat ? <>
                            <Button className="flex-grow-1" onClick={() => deleteChat()}>Confirm <Check className="fore-danger size-1" /></Button>
                            <Button className="flex-grow-1" onClick={() => setDeletingChat(false)}>Cancel <X className="fore-2-btn size-1" /></Button>
                        </> : <Button className="flex-grow-1" onClick={() => setDeletingChat(true)}>Delete Chat <TrashFill className="fore-danger size-1" /></Button>}
                    </div>}
                </ready>
                <error><ErrorAlert /></error>
            </StatusLayout>
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
            .then(res => res.json())
            .then(chat => navigate(`/chats/${chat.id}`))
            .catch(err => setLoading(false))
    }
    const addUser = (u) => setChat(p => { return { ...p, users: [...p.users, u] } })
    const removeUser = (u) => setChat(p => { return { ...p, users: p.users.filter(i => i.id !== u.id) } })
    const onChangeGroupName = (ev) => setChat(p => { return { ...p, name: ev.target.value } })
    const onClickNewChatExit = () => navigate("/chats")
    const renderUser = (u) => {
        return <UserCardInChat key={u.id} user={u}
            onAdd={addUser} onRemove={removeUser}
            isEditing={true}
            isSelected={chat.users.find(i => i.id === u.id)}
            isUser={u.id === user.id}>
        </UserCardInChat>
    }

    const isSubmitButtonDisabled = isLoading || chat.users?.length < 2 || chat.name === ""

    return <div className="d-flex flex-column flex-grow-1 align-self-stretch gap-3 mt-2 mb-1 h-0">
        <div className="d-flex flex-column card-1 gap-2">
            <div className="d-flex flex-row align-items-center">
                <span className="fs-110 fw-500 flex-grow-1">Create a new chat:</span>
                <Button className="circle" onClick={onClickNewChatExit}><X className="fore-2-btn size-1" /></Button>
            </div>
            <div className="d-flex flex-row gap-2">
                <Text className="flex-grow-1" placeholder="Group name..." value={chat.name} onChange={onChangeGroupName} />
            </div>
        </div>
        <div className="d-flex flex-row gap-2 card-1 align-items-center">
            <span className="fs-110 fw-500 fw-500 flex-grow-1">Users in chat: {chat.users?.length}</span>
            <Button onClick={() => setSearchVisible(p => !p)}>{isSearchVisible ? "Show actual users" : "Add new users"}</Button>
        </div>
        {isSearchVisible ?
            <UsersSearchList onRenderItem={(u) => renderUser(u)} /> :
            <UserList users={chat.users} status={"ready"} onRenderItem={(u) => renderUser(u)} onEmpty={() => <EmptyUserList />} />
        }
        <Button disabled={isSubmitButtonDisabled} onClick={onSubmit}>Create Group Chat</Button>
    </div>
}

export { ChatEditor, NewChatEditor }