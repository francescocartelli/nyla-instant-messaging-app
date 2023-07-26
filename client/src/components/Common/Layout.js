import { useState } from 'react'

import 'styles/style.css'
import './Layout.css'

function Tab({ onClick=() => {}, isActive=true, children=<></> }) {
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

function FlowLayout({ state, children }) {
    return <>
        {state && children.filter(child => child.type === state).map(i => i.props.children)}
    </>
}

export { TabsLayout, FlowLayout }