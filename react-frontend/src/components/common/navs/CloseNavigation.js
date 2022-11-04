import React from 'react';
import BasicNavigation from "~/components/common/navs/BasicNavigation";
import {MdClose} from 'react-icons/md'
import {withRouter} from 'react-router-dom'

const CloseButton = ({onClick}) => <MdClose size={29} onClick={onClick} style={{marginRight:16}}/>

const CloseNavigation = ({onCloseClick, children, history}) => {
    const onClick = () => {
        if (onCloseClick && typeof onCloseClick === 'function') {
            onCloseClick()
        }else{
            history.goBack();
        }
    }
    return (
        <BasicNavigation rightContent={<CloseButton onClick={onClick}/>}>
            {children}
        </BasicNavigation>
    );
};

export default withRouter(CloseNavigation);
