import { useCallback, useMemo, useState } from 'react'
import { ChevronRight, ThreeDots, ThreeDotsVertical } from 'react-bootstrap-icons'

import { Button } from '@/components/Commons/Buttons'

import './Layout.css'

function Tab({ onClick = () => { }, isActive = true, children = <></> }) {
    return <div className={`tab ${isActive ? "fore-1" : 'fore-2'}`} onClick={() => onClick()}>
        {children}
    </div>
}

function TabsLayout({ children }) {
    const [selected, setSelected] = useState(0)

    return <>
        <div className='tabs-layout overflow-hidden card-1 p-0 gap-1 mt-2 overflow-auto'>
            {children.map((child, i) => <Tab key={i}
                onClick={() => setSelected(i)}
                isActive={i === selected}>
                {child.props.title}
            </Tab>)}
        </div>
        {children[selected].props.children}
    </>
}

function StatusLayout({ status: { isLoading, isReady, isError }, loading = <></>, ready = <></>, error = <></> }) {
    if (isLoading) return loading
    else if (isReady) return ready
    else if (isError) return error
    else return <></>
}

function OptionsLayout({ option, options }) {
    const displayed = options[option] || <></>

    return displayed
}

function PagesControl({ page, nPages, onChangePage = () => { }, disabled = false }) {
    const onClick = (page) => { if (!disabled) onChangePage(page) }

    return <div className='pages-control card-2 p-0'>
        {page > 2 ? <p className='right-b fore-2-btn' onClick={() => onClick(1)}>1</p> : <p className='right-b'></p>}
        {<p className='right-b sep'></p>}
        {page > 1 ? <p className='right-b  fore-2-btn' onClick={() => onClick(page - 1)}>{page - 1}</p> : <p className='right-b'></p>}
        <p className='right-b actual'>{page}</p>
        {page < nPages ? <p className='right-b  fore-2-btn' onClick={() => onClick(page + 1)}>{page + 1}</p> : <p className='right-b'></p>}
        {<p className='right-b sep'></p>}
        {page + 1 < nPages ? <p className=' fore-2-btn' onClick={() => onClick(nPages)}>{nPages}</p> : <p className=''></p>}
    </div>
}

function ShowMoreLayout({ children }) {
    const [isExpanded, setExpanded] = useState(false)

    return <>
        {isExpanded ? <>
            {children}
            <ChevronRight onClick={() => setExpanded(false)} className="fore-2-btn" />
        </> : <ThreeDots onClick={() => setExpanded(true)} className="fore-2-btn" />}
    </>
}

function MoreOptions({ buttons }) {
    const [isExpanded, setExpanded] = useState(false)
    const toggleExpansion = useCallback(() => setExpanded(p => !p), [])

    const requireExpanded = useMemo(() => buttons.length > 1, [buttons])
    const isVisible = useMemo(() => !requireExpanded || isExpanded, [requireExpanded, isExpanded])

    return <div className='d-flex flex-row gap-1 align-items-center'>
        {isVisible && buttons}
        {requireExpanded && <Button onClick={toggleExpansion}>
            {isExpanded ? <ChevronRight className="fore-2 size-1" /> : <ThreeDotsVertical className="fore-2 size-1" />}
        </Button>}
    </div>
}

export { MoreOptions, OptionsLayout, PagesControl, ShowMoreLayout, StatusLayout, Tab, TabsLayout }
