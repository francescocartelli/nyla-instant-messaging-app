import './Buttons.css'

function Button({isDisabled, onClick, className, children}) {
    return <button className={`button-wrap ${className} ${isDisabled ? "disabled" : ''}`}
        onClick={() => !isDisabled && onClick()}>
        {children}
    </button>
}

export { Button }