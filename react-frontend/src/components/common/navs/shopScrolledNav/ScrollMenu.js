import React, {useEffect, useRef, useContext, useState} from 'react';
import {Div, Flex, Span} from '~/styledComponents/shared'
import Swiper from 'react-id-swiper'
import styled from 'styled-components'
import {getValue} from "~/styledComponents/Util";
import {withRouter} from 'react-router-dom'
import {activeColor, color} from "~/styledComponents/Properties";
import {IoIosArrowDown, IoIosArrowUp} from 'react-icons/io'
import {MenuContext} from './index'
import {BottomDotTab} from "~/styledComponents/ShopBlyLayouts";
import ComUtil from "~/util/ComUtil";
import useNotice from "~/hooks/useNotice";

const Wrapper = styled.div`
    position: relative;
    border-bottom: 1px solid ${color.light};
    background-color: ${color.white};    
    height: ${getValue(44)};
    
    &::before {
        content: "";        
        position: absolute;
        z-index: 2;
        top: 0;
        left: 0;
        bottom: 0;
        width: 16px;
        background-image: linear-gradient(to right,rgba(255,255,255,1),rgba(255,255,255,10%),transparent);
    }
    
    &::after {
        content: "";        
        position: absolute;
        z-index: 2;
        top: 0;
        right: 0;
        bottom: 0;
        width: 16px;        
        background-image: linear-gradient(to left,rgba(255,255,255,1),rgba(255,255,255,10%),transparent);
    }
`

const Li = styled.li`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 44px;
    box-sizing: border-box;
    width: max-content;
    ${props => props.first && `
        padding-left: 6px;        
    `}
    
    ${props => props.last && `
        padding-right: 44px;
    `}
    
    // position: relative;
    // ${props => props.active && `
    //     &::after {
    //         position: absolute;
    //         content: "";
    //         width: 5px;
    //         height: 5px;
    //         border-radius: 50%;
    //         background-color: ${color.danger};
    //         left: 50%;
    //         bottom: 0;
    //         transform: translateX(-50%);
    //     }        
    // `}
    
`

const StyledLink = styled(Div)`
    display: inline-block;
    flex-shrink: 0;
    font-size: ${getValue(16)};
    font-weight: 700;
    padding: 0 10px;    
    // ${p => p.active ? `        
    //     color: ${color.black}!important;
    // ` : `
    //     color: ${color.secondary}!important;    
    // `}
    
    
    position: relative;
    ${props => props.active && `
        &::after {
            position: absolute;
            content: "";
            width: 100%;
            height: 3px;            
            background-color: ${color.green};
            left: 50%;
            bottom: -8.5px;
            transform: translateX(-50%);
        }        
    `}
`

const option = {
    slidesPerView: 'auto',
    spaceBetween: 0,
    freeMode: true,
    // centeredSlides: true,   //중앙정렬
}


const Button = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    z-index: 3;
    top: ${getValue(6)};
    right: ${getValue(6)};
    width: ${getValue(32)};
    height: ${getValue(32)};
    border: 1px solid ${color.light};
    background-color: rgba(255, 255, 255, .8);
    border-radius: ${getValue(2)};
    cursor: pointer;
    
    &:active {
        background-color: ${activeColor.light};
    }
`
const ShowButton = () => {
    const {modalOpen, toggle} = useContext(MenuContext)
    return(
        <Button onClick={toggle}>
            {
                modalOpen ? <IoIosArrowUp size={20}/> : <IoIosArrowDown size={20}/>
            }
        </Button>
    )
    return(
        <Flex absolute
              cursor={1}
              zIndex={1}
              top={6}
              right={6}
              width={32}
              height={32}
              bc={'light'}
              bg={'rgba(255, 255, 255, .8)'}
              rounded={2}
              doActive
              justifyContent={'center'}
              onClick={toggle}>
            {
                modalOpen ? <IoIosArrowUp size={20}/> : <IoIosArrowDown size={20}/>
            }
        </Flex>
    )
}


const ScrollMenu = ({menuList, children, history}) => {
    const {noticeInfo, setPublicNotices} =  useNotice()
    const {setModalState} = useContext(MenuContext)
    const swiperRef = useRef(null);

    useEffect(() => {
        //모든 사용자가 볼 수 있는 noti(페이지 didMount 시 한번 조회)
        setPublicNotices()
        // swiperRef.current.swiper.updateSize()
    }, [])

    //메뉴 url이 바뀌면 스와이프 선택
    useEffect(() => {
        const menuIndex = menuList.findIndex(menu => menu.values.includes(history.location.pathname))
        swiperRef.current.swiper.slideTo(menuIndex)
    }, [history.location.pathname])

    const onClick = (url) => {
        //모달 닫기
        setModalState(false)
        // history.push(url)
        history.replace(url)
    }

    /*
    * 아래 두개 옵션을 주게되면 슬라이드가 바뀌었을때 무조건 왼쪽이 아닌 적당한 값으로 중앙에 위치 하도록 함
    * centeredSlides={true}
    * centeredSlidesBounds={true}
    * */

    const getIsNoti = (id) => {
        if (id) {
            return noticeInfo[id] || false
        }
        return false
    }

    return (
        <Wrapper>
            <Swiper {...option}
                    centeredSlides={true}
                    centeredSlidesBounds={true}
                    ref={swiperRef}>
                {
                    menuList.map((menu, index) =>
                        <Li
                            key={index}
                            first={index === 0}
                            last={(menuList.length -1) === index}
                            active={menu.values.includes(history.location.pathname)}
                        >
                            <div>
                                <StyledLink key={'link'+index}
                                            // noti={menu.isNew}
                                            cursor={1}
                                            onClick={onClick.bind(this, menu.values[0])}
                                            active={menu.values.includes(history.location.pathname)}
                                >
                                    {menu.label}
                                </StyledLink>
                                <Span style={{position: 'absolute'}} display={'inline-block'}
                                      noti={menu.isNew}
                                      noti={getIsNoti(menu.id)}
                                ></Span>
                            </div>

                        </Li>
                    )
                }
            </Swiper>
            <ShowButton/>
        </Wrapper>
    )
}
export default withRouter(ScrollMenu)