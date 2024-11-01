function InformationBox({ title, subtitle }) {
    return <div className="d-flex justify-content-center align-items-center flex-grow-1">
        <div className="card-1">
            <p className="text-center m-0"><b>{title}</b></p>
            <span className="fore-2 fs-80 text-center">{subtitle}</span>
        </div>
    </div>
}

function SomethingWentWrong({ explanation }) {
    return <InformationBox title="Something went wrong!" subtitle={explanation} />
}

export { InformationBox, SomethingWentWrong }