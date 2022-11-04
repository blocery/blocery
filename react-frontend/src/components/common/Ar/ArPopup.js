import React, {Suspense, useEffect} from 'react'
import {Server} from "~/components/Properties";
import styled from "styled-components";
import {Button, Div} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import {MdOutlineViewInAr} from 'react-icons/md'
import Logo from '~/images/logo/MarketBly_Main_Logo.svg'

export const ActivateButton = styled(Button)`
    bottom: 20vmin;
    right: 7vmin;
    width: 13vmin;
    height: 13vmin;
    position: absolute;
    font-size: 7vmin;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    box-shadow: rgb(0 0 0 / 25%) 0px 54px 55px, rgb(0 0 0 / 12%) 0px -12px 30px, rgb(0 0 0 / 12%) 0px 4px 6px, rgb(0 0 0 / 17%) 0px 12px 13px, rgb(0 0 0 / 9%) 0px -3px 5px;"
`;


const ArPopup = (props) => {
    const params = new URLSearchParams(props.location.search)
    const arSrc = params.get('arSrc');
    const arIosSrc = params.get('arIosSrc')||null;

    const arGlbFileImageUrl = Server.getArImageURL()+arSrc;
    const arUsdzFileImageUrl =  (arIosSrc && arIosSrc != null && arIosSrc != "null") ? (Server.getArImageURL()+arIosSrc):null;

    return (
        <Suspense fallback={null}>
            <Div height={'100vh'} relative>
                <Div absolute top={'3vmin'} left={'5vmin'} zIndex={1}>
                    <img src={Logo} alt={'로고'} style={{width: 100}} />
                </Div>
                {
                    (arGlbFileImageUrl && arUsdzFileImageUrl) ?
                        <model-viewer
                            style={{width:'100%',height:'100vh',background:color.background}}
                            src={arGlbFileImageUrl}
                            ios-src={arUsdzFileImageUrl}
                            ar ar-scale="fixed"
                            ar-modes="webxr scene-viewer quick-look"
                            camera-controls alt={"3D AR"}
                            environment-image="neutral"
                            xr-environment
                            quick-look-browsers="safari chrome"
                        >
                            <ActivateButton slot="ar-button">
                                <MdOutlineViewInAr/>
                            </ActivateButton>
                        </model-viewer>
                        :
                        <model-viewer
                            style={{width:'100%',height:'100vh',background:color.background}}
                            src={arGlbFileImageUrl}
                            ar ar-scale="fixed"
                            ar-modes="webxr scene-viewer quick-look"
                            camera-controls alt={"3D AR"}
                            environment-image="neutral"
                            xr-environment
                            quick-look-browsers="safari chrome"
                        >
                            <ActivateButton slot="ar-button">
                                <MdOutlineViewInAr/>
                            </ActivateButton>
                        </model-viewer>
                }

            </Div>
        </Suspense>
    )
};
export default ArPopup;