function ChatAlert({ icon, title, subtitle }) {
    return <>
        {icon}
        <div className='d-flex flex-column flex-grow-1'>
            <span className='fs-110 fw-500'>{title}</span>
            <span className='fs-80 fore-2'>{subtitle}</span>
        </div>
    </>
}

export { ChatAlert }