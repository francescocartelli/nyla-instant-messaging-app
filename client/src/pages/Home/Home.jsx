import { Logo } from '@/components/Icons/Icons'

import './Home.css'

function Home() {
    return <div className="d-flex flex-row flex-grow-1 justify-content-center align-items-center gap-2">
        <Logo fontSize={192} />
        <div className="d-flex flex-column">
            <span className="app-title">nyla</span>
        </div>
    </div>
}

export { Home }