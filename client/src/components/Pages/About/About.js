import { Button } from "components/Common/Buttons"
import { Logo } from "components/Icons/Icons"
import { Github, Linkedin, Medium } from "react-bootstrap-icons"

function About() {
    return <div className="d-flex flex-row flex-grow-1 justify-content-center align-items-center gap-2">
        <div className="d-flex flex-column gap-5">
            <div className="d-flex flex-column align-items-center">
                <Logo fontSize={96} />
                <h1 className="text-center fore-2 m-0">Welcome to <i><b>Nyla</b></i></h1>
                <p className="text-center fs-120">
                    <i><b>Nyla</b> is an open source instant messaging app.</i><br />
                </p>
                <a href="https://github.com/francescocartelli/nyla-instant-messaging-app" className="button-wrap fore-1">
                    show me the code <Github className="fore-2 size-2" />
                </a>
            </div>
            <div className="d-flex flex-column align-items-center gap-2 mt-4" style={{ fontWeight: 300 }}>
                <span className="text-center fore-2">a project from <b>Francesco Cartelli</b></span>
                <div className="d-flex flex-row gap-3 fore-2 justify-items-center align-items-center">
                    <a href="https://www.linkedin.com/in/francescocartelli/"><Linkedin fontSize={36} /></a>
                    <a href="https://github.com/francescocartelli"><Github fontSize={36} /></a>
                    <a href="https://medium.com/@cartelli.francesco"><Medium fontSize={36} /></a>
                </div>
                <span className="fs-80 fore-2">® 2023</span>
            </div>
        </div>
    </div>
}

export { About }