import React, {useEffect} from "react";
import {Button, Div, Flex, Right, Sticky} from "~/styledComponents/shared";
import styled, {keyframes} from 'styled-components'
import {MdClose} from 'react-icons/md'
import {color} from "~/styledComponents/Properties";
import ComUtil from "~/util/ComUtil";
import {Offcanvas} from 'reactstrap'
const SideBarLayer = styled(Div)`
    height: 100%;
    width: ${props => props.width};
    max-width: 300px;
    position: absolute;
    top: 0;
    left: 100%;    
    // transition: 0.2s;
    // transform: translateX(${props => props.menuOpen ? '-100%' : '0'});
    transform: translateX(-100%);
    background-color: white;
    
    // // position: fixed;
    // background-color: white;
    // // width: ${props => props.width};
    // height: 100%;
    // z-index: -999;
    // top: 0;
    // transition: 0.2s;
    // // box-shadow: 12px 0px 16px 2px rgb(0 0 0 / 93%);
    // left: ${props => props.menuOpen ? props.left : '100%'};            
    // // overflow: auto;
`;

const BackgroundLayer = styled.div`
    display: ${props => props.menuOpen ? 'block' : 'none'};
    position: fixed;    
    width: 100%;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 998;
    background: rgba(0,0,0, 70%);
    // transition: 0.2s;
    // position: fixed;    
    // top: 0;
    // width: 100%;
    // height: 100%;
    // // right: 0;
    // // bottom: 0;
    // z-index: 998;
    //
    // // left: ${props => props.menuOpen ? '0%': '100%'};
    //
    // max-width: 768px;
    // padding-left: 20%;
    //
    // // transition: 0.2s;
    // // background-color: rgba(0,0,0, 0.2);
    
     
`

const Sidebar = ({title, menuOpen, width = 80, onClose, children}) => {

    const left = 100 - width

    useEffect(() => {
        if (menuOpen) {
            ComUtil.noScrollBody()
        }else{
            ComUtil.scrollBody()
        }
    }, [menuOpen])


    return(
        <BackgroundLayer
            menuOpen={menuOpen} onClick={onClose} >
            <SideBarLayer
                width={`${width}%`}
                left={`${left}%`}
                menuOpen={menuOpen}
                onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    return
                }}
                // pt={56}
            >
                {/* 헤더 */}
                <div>
                    <Flex height={56} px={16} bg={'white'}
                          // style={{borderBottom: `1px solid ${color.light}`}}
                    >
                        <Div fontSize={20}>{title}</Div>
                        <Right cursor={1}>
                            <MdClose onClick={onClose} size={25}/>
                        </Right>
                    </Flex>
                </div>
                {/* 컨텐츠 */}

                <Div height={'calc(100vh -56px)'} relative>
                    {children}
                </Div>


            </SideBarLayer>
        </BackgroundLayer>

    )
}
export default Sidebar