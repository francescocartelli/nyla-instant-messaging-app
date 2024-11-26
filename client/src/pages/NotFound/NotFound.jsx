import { QuestionDiamond } from 'react-bootstrap-icons'

function NotFound() {
    return <div className="d-flex flex-row flex-grow-1 justify-content-center align-items-center gap-2">
        <div className="d-flex flex-column align-items-center gap-2">
            <QuestionDiamond className="fore-1" size={128} />
            <h1 className="text-center fore-2 m-0">Page Not found </h1>
            <p className="fs-120">The page you are looking for cannot be found...</p>
        </div>
    </div>
}

export { NotFound }