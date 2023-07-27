import './Inputs.css'

function Text({ left, right, ...props }) {
    return <div className='input-wrap'>
        {left}
        <input type={props.type ? props.type : "text"} {...props}></input>
        {right}
    </div>
}

export { Text }