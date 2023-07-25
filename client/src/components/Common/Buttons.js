import './Buttons.css'

function Button({isDisabled, onClick, children}) {
    return <button className={`button-wrap ${isDisabled ? "disabled" : ''}`}
        onClick={() => !isDisabled && onClick()}>
        {children}
    </button>
}

export { Button }