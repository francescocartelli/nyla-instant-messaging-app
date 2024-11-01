import { BugFill, HourglassSplit } from 'react-bootstrap-icons'

import './Alerts.css'

function LoadingAlert(props) {
    return <HourglassSplit className="alert-icon" {...props} size={props.size ? props.size : 48} />
}

function ErrorAlert(props) {
    return <BugFill className="alert-icon" {...props} size={props.size ? props.size : 48} />
}

export { LoadingAlert, ErrorAlert }