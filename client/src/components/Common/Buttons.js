import { Link } from 'react-router-dom'
import './Buttons.css'

function Button({ isDisabled, onClick, className, children }) {
    return <button className={`button-wrap ${className} ${isDisabled ? "disabled" : ''}`}
        onClick={() => !isDisabled && onClick()}>
        {children}
    </button>
}

function LinkButton({ isDisabled, to = '#', className, children }) {
    return <Link className={`button-wrap ${className} ${isDisabled ? "disabled" : ''}`} to={to}>
        {children}
    </Link>
}

export { Button, LinkButton }