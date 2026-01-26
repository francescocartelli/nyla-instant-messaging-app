export default function SkeletonMessageCard({ message }) {
    return <div className={`d-flex flex-column card-1 min-w-100 message-card-width break-word gap-1 ${message.isFromOther ? "align-self-start" : "align-self-end"} ${message.isSenderChanged ? "mt-2" : ""}`}>
        {message.isFromOther && message.isSenderChanged && <span className="fore-2 fs-80 fw-600 skeleton">_</span>}
        <p className="m-0 text-wrap skeleton">{message.content}</p>
        <div className="d-flex flex-row gap-1 align-items-center">
            <span className="fore-2 fs-70 pr-2 flex-grow-1 skeleton">_</span>
            <span className="fore-2 fs-70 pr-2 flex-grow-1 skeleton">_</span>
        </div>
    </div>
}