import React from 'react';
import {useRecoilState} from "recoil";
import {communitySidebarState, consumerState} from "~/recoilState";
import {Button, Div, Flex} from "~/styledComponents/shared";
import {BsList} from "react-icons/bs";
import {withRouter} from 'react-router-dom'
import {getLoginUserType} from "~/lib/loginApi";
import {Webview} from "~/lib/webviewApi";
import useLogin from "~/hooks/useLogin";
import ComUtil from "~/util/ComUtil";
import styled from 'styled-components'
import {activeColor} from "~/styledComponents/Properties";
const HamburgerButton = styled.div`
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: 0.2s;
    &:active {
        background-color: ${activeColor.white};
    }
`

const CommunitySidebarButton = ({history, ...rest}) => {
    const [sidebarOpen, setSidebarOpen] = useRecoilState(communitySidebarState)


    // const login = useLogin()

    const sidebarToggle = () => {
        const isOpen = !sidebarOpen
        setSidebarOpen(isOpen)
    }

    const onClick = e => {
        e.stopPropagation()
        // if (login.isLoggedIn()) {
        sidebarToggle()
        // }
    }

    return (
        <Flex cursor={1} justifyContent={'center'} bg={'white'} custom={`
            &:active {
                background-color: ${activeColor.white};
            }    
        `} onClick={onClick} {...rest}>
            <BsList size={29} />
        </Flex>
    );
};

export default withRouter(CommunitySidebarButton);
