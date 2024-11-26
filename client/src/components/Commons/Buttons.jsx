import { Link } from 'react-router-dom'

import './Buttons.css'

function Button({className, children, ...props }) {
    return <button className={`button-wrap ${className ? className : ""}`} {...props}>
        {children}
    </button>
}

function LinkButton({ disabled, to = '#', className, children }) {
    return <Link className={`button-wrap ${className ? className : ""} ${disabled ? "disabled" : ''}`} to={to}>
        {children}
    </Link>
}

export { Button, LinkButton }