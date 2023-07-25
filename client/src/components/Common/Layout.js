import { useState } from 'react'

import 'styles/style.css'
import './Layout.css'

function Tab(props) {
    return <div className={`tab ${props.isActive ? "fore-1" : 'fore-2'}`} onClick={() => props.onClick()}>
        {props.children}
    </div>
}

function TabsLayout(props) {
    const [selected, setSelected] = useState(0)

    return <>
        <div className='tabs-layout overflow-hidden card-1 p-0 gap-1 mt-2 overflow-auto'>
            {props.children.map((child, i) => <Tab key={i}
                onClick={() => setSelected(i)}
                isActive={i === selected}>
                {child.props.title}
            </Tab>)}
        </div>
        {props.children[selected].props.children}
    </>
}

export { TabsLayout }