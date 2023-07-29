import { useRef, useState } from 'react'

import './Inputs.css'

function Text({ left, right, className = "", ...props }) {
    return <div className={`input-wrap ${className}`}>
        {left}
        <input type={props.type ? props.type : "text"} {...props}></input>
        {right}
    </div>
}

function TextArea({ left, right, maxRows = 1, className = "", ...props }) {
    return <div className={`input-wrap ${className}`}>
        {left}
        <textarea {...props}></textarea>
        {right}
    </div>
}


export { Text, TextArea }