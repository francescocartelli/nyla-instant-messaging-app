import { Logo } from "components/Icons/Icons"

function About() {
    return <div className="d-flex flex-row flex-grow-1 justify-content-center align-items-center gap-2">
        <div className="d-flex flex-column align-items-center gap-2">
            <Logo fontSize={128}/>
            <p className="text-center mt-2" style={{ fontSize: '1.2em' }}>
                <i><b>Nyla</b> is an open source instant messaging app.</i><br/>
            </p>
            <p className="text-center mt-5" style={{ fontWeight: 200 }}>created by Francesco Cartelli<br />® 2023</p>
        </div>
    </div>
}

export { About }