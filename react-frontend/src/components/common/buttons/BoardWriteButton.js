import React from 'react'
import {Flex} from "~/styledComponents/shared";
import {withRouter} from 'react-router-dom'
import {BiEditAlt} from "react-icons/bi";
import {color} from "~/styledComponents/Properties";
import {FixedTabBarLine} from "~/styledComponents/ShopBlyLayouts";
import {Webview} from "~/lib/webviewApi";
import useLogin from "~/hooks/useLogin";

const BoardWriteButton = (props) => {

    const {openLoginModal, isLoggedIn, isServerLoggedIn} = useLogin()

    const onClick = async () => {
        let loginUser = await isServerLoggedIn()
        if (!loginUser) { //백 || front
            //Webview.openPopup('/login')
        }else {
            if (props.onClick && typeof props.onClick === 'function') {
                props.onClick()
            }
        }
    }


    return(
        <FixedTabBarLine>
            <Flex absolute right={16} bottom={57 + 16 + 50 + 16} cursor width={50} height={50} rounded={'50%'} bg={'green'}
                  justifyContent={'center'} doActive
                  custom={`
                    box-shadow: 0px 2px 4px 0 rgba(0, 0, 0, 0.2);
                  `}
                  onClick={onClick}
            >
                <BiEditAlt color={color.white} size={20}/>
            </Flex>
        </FixedTabBarLine>
    )
}
export default withRouter(BoardWriteButton)