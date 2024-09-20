import React, { useCallback, useMemo, useState } from "react"
import { ArrowDownSquareFill, ArrowUpSquareFill, Check, Check2, Check2Square, ChevronDown, ChevronRight, ChevronUp, DoorOpenFill, Hourglass, Pencil, Person, Stars, ThreeDotsVertical, TrashFill, X, XCircle } from "react-bootstrap-icons"
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

function UserBadges({ isSelf, isAdmin }) {
    const isVisible = isSelf || isAdmin

    return <>
        {isVisible && <>
            {isSelf && <div className="card-2"><span className="fore-2">You</span></div>}
            {isAdmin && <Stars className="text-warning size-2" />}</>}
    </>
}

function BasicSettings({ title, close, isGroup, children }) {
    return <div className="d-flex flex-column card-1 gap-2">
        <div className="d-flex flex-row align-items-center">
            <span className="fs-110 fw-500 flex-grow-1">{title}</span>
            <Button className="circle" onClick={close}><X className="fore-2-btn size-1" /></Button>
        </div>
        {isGroup && children}
    </div>
}

function MoreOptions({ isVisible, setVisible, onToggleUserInChat, onAdmin }) {
    const buttons = useMemo(() => [
        onToggleUserInChat,
        ...(onAdmin ? [onAdmin] : [])
    ], [onToggleUserInChat, onAdmin])

    const expandRequired = useMemo(() => buttons?.length > 1, [buttons])
    const areButtonsVisible = useMemo(() => !expandRequired || isVisible, [expandRequired, isVisible])

    return <>
        {areButtonsVisible && buttons}
        {expandRequired && <Button onClick={() => setVisible(p => !p)}>
            {isVisible ? <ChevronRight className="fore-2 size-1" /> : <ThreeDotsVertical className="fore-2 size-1" />}
        </Button>}
    </>
}

function UserCardInChat({ user, onAdd, onAdmin, onRemove, isSelected = false, isSelf = false, isAdmin = false, isNewChat = false }) {
    const [isMoreOptionsVisible, setMoreOptionsVisible] = useState(false)
    const [isLoading, setLoading] = useState(false)

    const canSeeMoreOptions = !isSelf && isAdmin
    const canLeaveGroup = isSelf && !isNewChat

    const userInChatButton = useMemo(() => <Button key="add-remove" onClick={() => isSelected ? onRemove(user, setLoading) : onAdd(user, setLoading)}>
        {isSelected ? <>Remove <XCircle className="fore-danger size-1" /></> : <>Add<Check2Square className="fore-success size-1" /></>}
    </Button>, [isSelected, onAdd, onRemove, user])

    const adminButton = useMemo(() => onAdmin && <Button key="update" onClick={() => onAdmin({ id: user.id, isAdmin: !user.isAdmin }, setLoading)}>
        {user.isAdmin ? <>Remove<ArrowDownSquareFill className="fore-2 size-1" /></> : <>Add<ArrowUpSquareFill className="fore-2 size-1" /></>}
    </Button>, [onAdmin, user])

    return <UserCard user={user} badges={<UserBadges isSelf={isSelf} isAdmin={user.isAdmin} />}>
        <div className={`d-flex flex-grow-1 justify-content-end gap-2 align-items-center more-options ${isMoreOptionsVisible ? "active" : ""}`}>
            {isLoading ? <Hourglass className="fore-2 size-1" /> : <>
                {canSeeMoreOptions && <MoreOptions isVisible={isMoreOptionsVisible} setVisible={setMoreOptionsVisible}
                    isLoading={isLoading} isSelected={isSelected} onToggleUserInChat={userInChatButton} onAdmin={adminButton} />}
                {canLeaveGroup && <Button onClick={() => onRemove(user, setLoading)}>Leave group<DoorOpenFill className="fore-2 size-1" /></Button>}
            </>}
        </div>
    </UserCard>
}

function AdvancedSettings({ deleteChatApi, deleteChatCallback }) {
    const [isAdvancedSettings, setAdvancedSettings] = useState(false)
    const [isDeletingChat, setDeletingChat] = useState(false)

    const [deleteStatus, deleteStatusActions] = useStatus("ready")

    const toggleAdvandedSettings = () => setAdvancedSettings(p => !p)

    const deleteChat = () => {
        deleteStatusActions.setLoading()
        deleteChatApi()
            .then(deleteChatCallback)
            .catch(err => deleteStatusActions.setError())
    }

    return <div className="d-flex flex-column card-1 gap-2 ">
        <StatusLayout status={deleteStatus}>
            <loading><LoadingAlert /></loading>
            <ready>
                <div className="d-flex flex-row gap-2 align-items-center">
                    <span className="fs-110 fw-500 flex-grow-1">Advanced Settings:</span>
                    <Button onClick={toggleAdvandedSettings}>{isAdvancedSettings ?
                        <ChevronUp className="fore-2-btn size-1" /> :
                        <ChevronDown className="fore-2-btn size-1" />}
                    </Button>
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
}

function UsersManager({ isAdmin, renderUserInSearch, renderUserInChat, users }) {
    const [isSearchVisible, setSearchVisible] = useState(false)

    return <>
        <div className="d-flex flex-row gap-2 card-1 align-items-center">
            <span className="fs-110 fw-500 flex-grow-1">Users in chat: {users?.length}</span>
            {isAdmin && <Button onClick={() => setSearchVisible(p => !p)}>{isSearchVisible ? "Show users" : "Add users"}</Button>}
        </div>
        <div className="d-flex flex-grow-1 scroll-y h-0">
            {isSearchVisible ?
                <UsersSearchList onRenderItem={renderUserInSearch} /> :
                <UserList users={users} status={"ready"} onRenderItem={renderUserInChat} onEmpty={() => <EmptyUserList />} />}
        </div>
    </>
}

function ExistingChatUsersManager({ user, chat, setChat, users, setUsers, isAdmin }) {
    const addUser = useCallback((u, setLoading) => {
        setLoading(true)
        chatAPI.addUserChat(chat.id, u.id)
            .then(() => {
                setLoading(false)
                setUsers(p => [...p, u])
                setChat(p => ({ ...p, nUsers: p.nUsers + 1 }))
            })
            .catch(err => setLoading(false))
    }, [chat.id, setChat, setUsers])

    const updateUser = useCallback((u, setLoading) => {
        setLoading(true)
        chatAPI.updateUserChat(chat.id, u.id, u)
            .then(() => {
                setLoading(false)
                setUsers(p => p.map(q => q.id === u.id ? { ...q, ...u } : q))
            })
            .catch(err => setLoading(false))
    }, [chat.id, setUsers])

    const removeUser = useCallback((u, setLoading) => {
        setLoading(true)
        chatAPI.removeUserChat(chat.id, u.id)
            .then(() => {
                setLoading(false)
                setUsers(p => p.filter(i => i.id !== u.id))
                setChat(p => ({ ...p, nUsers: p.nUsers - 1 }))
            })
            .catch(err => setLoading(false))
    }, [chat.id, setChat, setUsers])

    const renderUserBase = useCallback(isToggleAdmin => u => <UserCardInChat key={u.id} user={u}
        onAdd={addUser} onAdmin={isToggleAdmin ? updateUser : null} onRemove={removeUser}
        isSelected={users?.find(i => i.id === u.id)}
        isSelf={u.id === user.id}
        isAdmin={isAdmin}
        isNewChat={false}>
    </UserCardInChat>, [addUser, updateUser, removeUser, users, isAdmin, user.id])

    const renderUserInChat = useCallback(renderUserBase(true), [renderUserBase])
    const renderUserInSearch = useCallback(renderUserBase(false), [renderUserBase])

    return <UsersManager isAdmin={isAdmin} renderUserInChat={renderUserInChat} renderUserInSearch={renderUserInSearch} users={users} />
}

function ExistingChatBasicSettings({ chat, setChat, isAdmin, close }) {
    const [chatName, setChatName] = useState(chat?.name)
    const [isEditingChat, setEditingChat] = useState(false)
    const [chatNameStatus, chatNameStatusActions] = useStatus("ready")

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

    const onChangeChatName = ev => setChatName(ev.target.value)

    return <BasicSettings title="Settings:" close={close} isGroup={chat.isGroup}>
        {chat.isGroup && <div className="d-flex flex-row gap-2 align-items-center">
            <Text className="flex-grow-1" placeholder="Group name..." disabled={!isEditingChat} value={chatName} onChange={onChangeChatName} />
            {isAdmin && <div>{isEditingChat ?
                <div className="d-flex flex-row gap-2">
                    <Button onClick={onClickCancelEditChatName}><XCircle className="fore-2-btn size-1" /></Button>
                    <Button disabled={chatNameStatus === "loading"} onClick={onClickConfirmEditChatName}><Check2 className="fore-2-btn size-1" /></Button>
                </div> : <Button onClick={onClickEditChat}><Pencil className="fore-2-btn size-1" /></Button>
            }</div>}
        </div>}
    </BasicSettings>
}

function NewChatBasicSettings({ name, onChange, close }) {
    return <BasicSettings title="Create new chat:" close={close} isGroup={true}>
        <div className="d-flex flex-row gap-2">
            <Text className="flex-grow-1" placeholder="Group name..." value={name} onChange={onChange} />
        </div>
    </BasicSettings>
}

function ChatEditor({ user, chat, setChat, users, setUsers, close }) {
    const isAdmin = useMemo(() => users && users.find && users.find(u => u.id === user.id)?.isAdmin, [user.id, users])

    const navigate = useNavigate()

    return <div className="d-flex flex-column flex-grow-1 gap-3 mb-1 h-0">
        <ExistingChatBasicSettings chat={chat} setChat={setChat} isAdmin={isAdmin} close={close} />
        {chat.isGroup && <ExistingChatUsersManager user={user} chat={chat} setChat={setChat} users={users} setUsers={setUsers} isAdmin={isAdmin} />}
        {(isAdmin || !chat.isGroup) && <AdvancedSettings deleteChatApi={() => chatAPI.deleteChat(chat.id)} deleteChatCallback={() => navigate("/chats")} />}
    </div>
}

function NewChatEditor({ user }) {
    const [chat, setChat] = useState({ name: "", users: [user], isGroup: true })
    const [isLoading, setLoading] = useState(false)

    const navigate = useNavigate()

    const onSubmit = () => {
        setLoading(true)
        chatAPI.createChat(chat, user)
            .then(res => res.json())
            .then(chat => navigate(`/chats/${chat.id}`))
            .catch(err => setLoading(false))
    }
    const addUser = (u) => setChat(p => ({ ...p, users: [...p.users, u] }))
    const removeUser = (u) => setChat(p => ({ ...p, users: p.users.filter(i => i.id !== u.id) }))
    const onChangeGroupName = (ev) => setChat(p => ({ ...p, name: ev.target.value }))
    const onClickNewChatExit = () => navigate("/chats")
    const renderUser = useCallback((u) => <UserCardInChat key={u.id} user={u}
        onAdd={addUser} onRemove={removeUser}
        isSelected={chat?.users?.find(i => i.id === u.id)}
        isSelf={u.id === user.id}
        isAdmin={true}
        isNewChat={true}>
    </UserCardInChat>, [chat.users, user.id])

    const isSubmitButtonDisabled = isLoading || chat.users?.length < 2 || chat.name === ""

    return <div className="d-flex flex-column flex-grow-1 align-self-stretch gap-3 mt-2 mb-1 h-0">
        <NewChatBasicSettings close={onClickNewChatExit} name={chat.name} onChange={onChangeGroupName} />
        <UsersManager isAdmin={true} renderUserInSearch={renderUser} renderUserInChat={renderUser} users={chat.users} />
        <Button disabled={isSubmitButtonDisabled} onClick={onSubmit}>Create Group Chat</Button>
    </div>
}

export { ChatEditor, NewChatEditor }