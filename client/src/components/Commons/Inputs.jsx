import { useState } from 'react'
import { CheckCircle, ChevronUp, ExclamationCircle } from 'react-bootstrap-icons'

import './Inputs.css'

function Text({ left, right, className = "", ...props }) {
    const disabled = props.disabled || props.readOnly ? ' disabled' : ''

    return <div className={`input-wrap ${className} ${disabled}`}>
        {left}
        <input type={props.type ? props.type : "text"} {...props}></input>
        {right}
    </div>
}

function TextArea({ left, right, maxRows = 1, className = "", ...props }) {
    const disabled = props.disabled || props.readOnly ? ' disabled' : ''

    return <div className={`input-wrap ${className} ${disabled}`}>
        {left}
        <textarea {...props}></textarea>
        {right}
    </div>
}

function TextVal({ isInvalid, value, message, ...props }) {
    const [isMessageVisible, setMessageVisible] = useState(false)

    const applyVisibility = () => setMessageVisible(value !== "" && isInvalid)

    return <div className='text-val'>
        <Text onBlur={applyVisibility} onClick={applyVisibility} right={value !== "" && (isInvalid ?
            <ExclamationCircle onClick={applyVisibility} className='fore-danger size-1' /> :
            <CheckCircle className='fore-success size-1' />)}
            {...props} value={value} />
        {message && <>
            {value !== "" && isMessageVisible && <div className='d-flex flex-row align-items-center card-1 message-wrapper'>
                <div className='d-flex flex-column flex-grow-1 message-wrapper-text'>{message}</div>
                <ChevronUp className='size-1 fore-2-btn' onClick={() => setMessageVisible(false)} />
            </div>}
        </>}

    </div>
}

export { Text, TextArea, TextVal }