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
    return <div className={`input-wrap ${className}`}>
        {left}
        <textarea {...props}></textarea>
        {right}
    </div>
}


export { Text, TextArea }