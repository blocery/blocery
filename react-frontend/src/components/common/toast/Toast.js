import React, {useState} from "react";
import {Div} from "~/styledComponents/shared";
import {Toast as RSToast, ToastBody, ToastHeader} from "reactstrap";
import {BsQuestionCircle} from 'react-icons/bs'

const Toast = ({title, content, position = 'left', minWidth = 250,
                   style = {},
                   bodyStyle = {},
                   children}) => {
    const [isOpen, setOpen] = useState(false)
    const toggle = () => setOpen(prev => !prev)

    if (position === 'left') {
        style.left = 0;
    }else{
        style.right = 0
    }

    return(
        <Div relative display={'inline-block'}>
            <Div onClick={toggle} cursor={1}>
                {children}
            </Div>
            <Div absolute minWidth={minWidth} zIndex={3} mt={5} {...style}>
                <RSToast isOpen={isOpen}>
                    <ToastHeader toggle={toggle}
                    >{title}</ToastHeader>
                    <ToastBody style={bodyStyle}>
                        {content}
                    </ToastBody>
                </RSToast>
            </Div>
        </Div>
    )
}
export default Toast