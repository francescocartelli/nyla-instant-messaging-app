import { useState } from 'react'

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

function StatusLayout({ status, children }) {
    return <>
        {status && children.filter(child => child.type === status).map(i => i.props.children)}
    </>
}

function PagesControl({ page, nPages, onClick = () => { } }) {
    return <div className='pages-control card-2 p-0'>
        {page > 2 ? <p className='right-b fore-2-btn enabled' onClick={() => onClick(1)}>1</p> : <p className='right-b'></p>}
        {<p className='right-b sep'></p>}
        {page > 1 ? <p className='right-b  fore-2-btn enabled' onClick={() => onClick(page - 1)}>{page - 1}</p> : <p className='right-b'></p>}
        <p className='right-b actual'>{page}</p>
        {page < nPages ? <p className='right-b  fore-2-btn enabled' onClick={() => onClick(page + 1)}>{page + 1}</p> : <p className='right-b'></p>}
        {<p className='right-b sep'></p>}
        {page + 1 < nPages ? <p className=' fore-2-btn enabled' onClick={() => onClick(nPages)}>{nPages}</p> : <p className=''></p>}
    </div>
}

export { TabsLayout, StatusLayout, PagesControl, Tab }