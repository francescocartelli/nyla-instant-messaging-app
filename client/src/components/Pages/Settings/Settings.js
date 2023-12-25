import { WrenchAdjustable } from "react-bootstrap-icons"

function Settings() {
    return <div className="d-flex flex-row flex-grow-1 justify-content-center align-items-center gap-2">
    <div className="d-flex flex-column align-items-center gap-2">
        <WrenchAdjustable className="fore-1" size={128} />
        <h1 className="text-center fore-2 m-0">Work in Progress</h1>
        <p style={{ fontSize: '1.2em' }}>This page is not ready yet...</p>
    </div>
</div>
}

export { Settings }