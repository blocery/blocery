import React,{Suspense} from 'react'
import {Server} from "~/components/Properties";
import {Webview} from '~/lib/webviewApi'
import styled from "styled-components";
import {Button, Div, Flex, Link} from "~/styledComponents/shared";
import ComUtil from '~/util/ComUtil'
import {color} from "~/styledComponents/Properties";

const ArView = (props) => {
    const {isTest,arSrc,arIosSrc,arName} = props;
    const arGlbFileImageUrl = isTest ? arSrc:Server.getArImageURL()+arSrc;
    const arUsdzFileImageUrl =  arIosSrc ? (isTest ? arIosSrc:Server.getArImageURL()+arIosSrc):null;
    const isProduction = Server._serverMode() === 'production' ? true:false;
    const moveTo = () => {
        let MOVE_URL;
        isProduction ?
            MOVE_URL=Server.getShareURL()+'/arPopup?arSrc=' + arSrc + '&arIosSrc=' + (arIosSrc ? arIosSrc:"")
            :
            MOVE_URL=Server.getShareURL()+'/arPopup?arSrc=' + arSrc + '&arIosSrc=' + (arIosSrc ? arIosSrc:"")

        Webview.openBrowser(MOVE_URL);
    }

    return ( //for A-FRAME
        //(goods && goods.arGlbFile && goods.arGlbFile.imageUrl) &&
        //TEST  onclick={Webview.openPopup('/store/arPopup?arSrc='+arSrc+'&arName='+arName+'&arIosSrc='+arIosSrc )}
        <>
            <Suspense fallback={null}>
                <Div relative width={'100%'} height={'100%'}>
                    <model-viewer
                        style={{height:'100%',width:'100%', background: color.background}}
                        src={arGlbFileImageUrl}
                        ios-src={arUsdzFileImageUrl}
                        ar ar-scale="fixed"
                        ar-modes="webxr scene-viewer quick-look"
                        camera-controls alt={arName ? arName:"3D AR"}
                        environment-image="neutral"
                        xr-environment
                        quick-look-browsers="safari chrome"
                    >
                        <Button style={{display:'none'}} slot="ar-button">
                        </Button>
                    </model-viewer>
                    {
                        (!ComUtil.isPcWeb()) &&   //ios배포후
                        // (!ComUtil.isPcWeb() && !ComUtil.isMobileAppIos()) &&//샵블리 버전:android배포 후
                        // (!ComUtil.isPcWeb() && !ComUtil.isMobileApp()) && //마켓블리 버전
                        <Button
                            fontSize={13} px={10} py={4} bc={'white'}
                            custom={`
                                position: absolute;
                                top: 16px;
                                right: 16px;
                                font-weight: bold;                                
                                box-shadow: rgb(0 0 0 / 25%) 0px 54px 55px, rgb(0 0 0 / 12%) 0px -12px 30px, rgb(0 0 0 / 12%) 0px 4px 6px, rgb(0 0 0 / 17%) 0px 12px 13px, rgb(0 0 0 / 9%) 0px -3px 5px;"
                            `}
                            onClick={moveTo}>AR 보기</Button>
                    }
                </Div>
            </Suspense>




            { //a link 방식
                // !ComUtil.isPcWeb() &&
                //   (isProduction ?
                //       <a href={'https://shopbly.shop/store/arPopup?arSrc=' + arSrc + '&arIosSrc=' + arIosSrc}> Activate VR</a>
                //       :
                //       <a href={'http://210.92.91.225:8080/store/arPopup?arSrc=' + arSrc + '&arIosSrc=' + arIosSrc}> Activate VR</a>
                //   )
            }
            <br/>


            {/*<a href={'intent://arvr.google.com/scene-viewer/1.0?file=https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF/Avocado.gltf#Intent;scheme=https;package=com.google.android.googlequicksearchbox;action=android.intent.action.VIEW;S.browser_fallback_url=https://developers.google.com/ar;end;'}>*/}
            {/*    Intent TEST</a>*/}

        </>

    )
};
export default ArView;