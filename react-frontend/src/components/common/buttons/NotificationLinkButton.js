import React, {useEffect, useState} from 'react';
import {isNewNotifiation} from "~/lib/shopApi";
import {Div, Flex, Link} from "~/styledComponents/shared";
import {RiNotificationLine} from 'react-icons/ri'
import {IoMdNotificationsOutline} from 'react-icons/io'
import {withRouter} from 'react-router-dom'
import useLogin from "~/hooks/useLogin";
import {Webview} from "~/lib/webviewApi";
import useNotice from "~/hooks/useNotice";

const NotificationLinkButton = ({history, ...rest}) => {

    const {isLoggedIn, isServerLoggedIn} = useLogin()
    const [isNewNotification, setIsNewNotification] = useState()

    const {noticeInfo, setPrivateNotificationNew} = useNotice()

    useEffect(() => {
        setPrivateNotificationNew()
    }, [])

    // const search = async() => {
    //     const {data} = await isNewNotifiation();
    //     setIsNewNotification(data);
    // }

    const onClick = async () => {
        let loginUser = await isServerLoggedIn()
        if (!loginUser ) { //|| !isLoggedIn()) { //백 || front
            //Webview.openPopup('/login')
        }else {
            history.push('/mypage/notificationList')
        }
    }

    return (
        <Flex
            relative
            // noti={isNewNotification ? 1 : 0} notiRight={5}
            noti={noticeInfo.notification}
            notiTop={10}
            notiRight={10}
            bg={'white'}
            justifyContent={'center'}
            cursor
            onClick={onClick}
            {...rest}
        >
            {/*<RiNotificationLine size={26}/>*/}
            <IoMdNotificationsOutline size={30}/>
        </Flex>
    );
};


export default withRouter(NotificationLinkButton);
