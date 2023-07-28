import './Inputs.css'

function Text({ left, right, className="", ...props }) {
    return <div className={`input-wrap ${className}`}>
        {left}
        <input type={props.type ? props.type : "text"} {...props}></input>
        {right}
    </div>
}

export { Text }