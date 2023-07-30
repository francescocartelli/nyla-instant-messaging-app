import { useState } from "react"
import { Chat, Check, Check2, Check2Square, CheckSquareFill, PersonFill, Square, XCircle } from "react-bootstrap-icons"

import { Button } from "components/Common/Buttons"
import { Text } from "components/Common/Inputs"
import { UserList, UsersSearchInput } from "components/Pages/Users/Users"
import { FlowState } from "utils/Utils"

function UserCard({ user }) {
    const [isSelected, setSelected] = useState(false)

    return <div className="row-center card-1">
        <div className="crd-icon"><PersonFill className="fore-2 size-2" /></div>
        <div className="d-flex flex-column flex-grow-1">
            <p className="crd-title">{user.username}</p>
            <p className="crd-subtitle c-gray"><i>{user.bio}</i></p>
        </div>
        <div>
            <Button onClick={() => setSelected(p => !p)}>
                {isSelected ? <Check2 className="fore-success size-1" /> : <Square className="fore-2 size-1"/>}
            </Button>
        </div>
    </div>
}

function ChatEditor({ chat, close }) {
    const [users, setUsers] = useState([])
    const [userSearch, setUserSearch] = useState("")

    const userSearchFlow = FlowState()

    return <>
        <div className="d-flex flex-column card-1 gap-2">
            <div className="d-flex flex-row align-items-center">
                <p className="crd-title flex-grow-1">Edit chat:</p>
                <div><Button onClick={() => close()}><XCircle className="fore-2-btn" /></Button></div>
            </div>
            <Text value={chat.name} onChange={(ev) => { }} />
        </div>
        <div className="d-flex flex-column card-1 flex-grow-1">
            <p className="crd-title">Add users:</p>
            <UsersSearchInput value={userSearch} onChange={setUserSearch}
                onLoading={() => userSearchFlow.setLoading()}
                onReady={(u) => {
                    setUsers(u)
                    userSearchFlow.setReady()
                }}
                onError={() => userSearchFlow.onError()} />
            <UserList users={users} flowState={userSearchFlow.toString()} initialCondition={userSearch === ""}
                onRenderItem={(u) => <UserCard key={u.id} user={u} />} />
        </div>

    </>
}

export { ChatEditor }