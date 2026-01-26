import { Button } from '@/components/Commons/Buttons'
import { useMemo } from 'react'
import { ArrowDown } from 'react-bootstrap-icons'

export default function NewMessagesBadge({ onClick, count }) {
    const formattedCount = useMemo(() => count > 99 ? "99+" : count, [count])

    return <Button onClick={onClick} className="box-glow position-absolute" style={{ top: "-50px", right: "1.5em" }}>
        <ArrowDown className="fore-2 size-1" />
        <div className="position-absolute crd-icon-15" style={{ backgroundColor: "#BD44D6", top: "-0.6em", left: "-0.6em" }}>
            <span className="fs-70">{formattedCount}</span>
        </div>
    </Button>
}
