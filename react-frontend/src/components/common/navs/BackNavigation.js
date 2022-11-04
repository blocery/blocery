import React from 'react';
import BasicNavigation from "~/components/common/navs/BasicNavigation";
import ArrowBackButton from '~/components/common/buttons/ArrowBackButton'
import {withRouter} from'react-router-dom'
import { Server } from '~/components/Properties';
import {Div, Flex, GridColumns} from "~/styledComponents/shared";
import ComUtil from "~/util/ComUtil";
import {Webview} from "~/lib/webviewApi"
import ZzimLinkButton from "~/components/common/buttons/ZzimLinkButton";
import StarredProducerGoodsLinkButton from "~/components/common/buttons/StarredProducerGoodsLinkButton";
import {getValue} from "~/styledComponents/Util";
import HomeImage from '~/images/logo/SB_logo.svg'
import {FiHome} from "react-icons/fi";



const BasicRightIcons = () =>
    <GridColumns repeat={1} colGap={0} rowGap={0} pr={10} custom={`
            & > div {
                width: ${getValue(50)};
            }
       `}>
        {/* 찜하기 상품 링크 */}
        <ZzimLinkButton />
        {/* 단골상품 링크 */}
        {/*<StarredProducerGoodsLinkButton />*/}
    </GridColumns>

const BackNavigation = ({onBackClick, rightContent, hideHomeButton, showShopRightIcons, children, history}) => {

    const onClick = () => {

        // if(history.action === "POP"){
        let preChk = 0;
        if(localStorage.getItem("pageLen") == null){
            preChk = 1;
        }
        if(localStorage.getItem("pageLen") != null &&
            parseInt(localStorage.getItem("pageLen")||0) <= 0){
            preChk = 1;
        }


        //custom
        if (onBackClick && typeof onBackClick === 'function') {
            onBackClick()
        }else{


            // 카카오로그인이 popupScreen에서만 되는 ios 예외처리

            //샵블리 버전
            // if(history.location.pathname === '/login' && ComUtil.isMobileAppIos()) {
            //마켓블리 버전
            if(history.location.pathname === '/login' && ComUtil.isMobileApp()) {

                //마켓블리 버전 (private router 를 통해 강제로 로그인 페이지로 진입 하였을 경우)
                if (history.action === 'REPLACE') {
                    history.goBack()
                    return
                }

                Webview.closePopup();
                return
            }else{
                if(preChk === 1){
                    window.location = Server.getFrontURL();
                    return
                }
                history.goBack()
            }
        }
    }
    return (
        <BasicNavigation
            leftContent={
                <Flex onClick={onClick}
                      height={'100%'}
                      justifyContent={'flex-start'}
                      cursor={1}
                    // px={16}
                      pl={10}
                      pr={16}
                    //  custom={`
                    //     height: 52px;
                    //     display: flex;
                    //     align-items: center;
                    //     justify-content: center;
                    // `}
                >
                    <ArrowBackButton />
                </Flex>
            }
            rightContent={
                rightContent ? rightContent : showShopRightIcons ? <BasicRightIcons /> : null}
        >
            {/*<Flex>*/}
                {/*{*/}
                {/*    !hideHomeButton && <Div mr={15} onClick={() => history.push('/')}>*/}
                {/*        /!*<img src={HomeImage} style={{height: 23}} alt={'홈으로'} />*!/*/}
                {/*        <FiHome size={24}/>*/}
                {/*    </Div>*/}
                {/*}*/}
                <Div pt={2}>{children}</Div>
            {/*</Flex>*/}

        </BasicNavigation>
    );
};

export default withRouter(BackNavigation);
