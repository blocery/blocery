import React, {useEffect} from "react";
import {NavLink} from 'react-router-dom'
import {FiHome, FiMessageSquare, FiSearch, FiUser, FiMapPin, FiMenu, FiShoppingCart} from 'react-icons/fi'
import {BiStoreAlt} from 'react-icons/bi'
import {activeColor, color, hoverColor} from "~/styledComponents/Properties";
import {Div, Flex, Fixed} from '~/styledComponents/shared/Layouts'
import styled from 'styled-components'
import {getValue} from "~/styledComponents/Util";
import {ScrollUpButton} from "~/components/common/buttons/ScrollUpButton";
import useScrollPos from "~/hooks/useScrollPos";
import ComUtil from "~/util/ComUtil";
import useNotice from "~/hooks/useNotice";
import useLogin from "~/hooks/useLogin";
import {useRecoilState, useRecoilValue} from "recoil";
import {cartCountState, optionAlertState} from "~/recoilState";
import {OptionAlert} from "~/components/common/optionAlert";

const activeClassName = "nav-item-active";

export const StyledNavLink = styled(NavLink)`
    background-color: ${color.white};
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;

    // text-align: center;
    text-decoration: none;
    
    position: relative;
    
    &:focus, &:hover, &:visited, &:link{
        text-decoration: none;
    }
    
    &:active {
        background-color: ${activeColor.white}; 
    }
    
    height: 100%;
    // color: ${color.secondary};    
    // &:hover {
    //     color: ${color.secondary};
    // }
    color: ${color.black};

    &.nav-item-active {
        color: ${color.green};
    }
`

// export const StyledNavLink = styled(NavLink).attrs({
//     activeClassName,
// })`
//     text-align: center;
//     text-decoration: none;
//     &:focus, &:hover, &:visited, &:link, &:active {
//         text-decoration: none;
//     }
//     // color: ${color.secondary};
//     // &:hover {
//     //     color: ${color.secondary};
//     // }
//     color: ${color.black};
//
//   &.${activeClassName} {
//     color: ${color.green};
//   }
// `;

const TabBarWrapper = styled(Fixed)`
    bottom:0;
    width: 100%;
    z-index: 3;
    transition: 0.2s;
    transform: ${p => p.isHidden ? 'translateY(57px)' : 'translateY(0px)'};
`

const TabBar = styled.div`
    
    // display: flex;
    // align-items: center;
    // justify-content: space-evenly;
    height: 57px;
    box-shadow: -1px -3px 6px 0 rgba(0, 0, 0, 0.06);
   
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    
`;

const Item = styled(Flex)`
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-decoration: none;
    min-width: 56px;    //정중앙에 맞추기 위해서 가장 긴 글자인 마이페이지 텍스트의 width 기준을 넣어줌
    height: 100%;
`;
const Text = (props) => <Div pt={3.6} fontSize={12} lineHeight={12}>{props.children}</Div>


//bottom은 토크의 글쓰기 버튼 위치를 생각해야함
const Absolute = styled.div`
    position: absolute;
    top: ${getValue(-50-16)};
    right: ${getValue(16)};
    // width: ${getValue(50)};
    // height: ${getValue(50)};    
    // background-color: rgba(255, 255, 255, .5);
    // border: 1px solid ${color.light};
    // border-radius: 50%;
    //
    // display: flex;
    // align-items: center;
    // justify-content: center;    
    // transition: 0.1s;
    // cursor: pointer;
    //
    // &:active {
    //     background-color: ${color.white};
    // }
`
const CartTabHook = () => {
    // const {noticeInfo} = useNotice()
    const cartCount = useRecoilValue(cartCountState)
    return(
        <StyledNavLink to={'/cartList'} activeClassName={'nav-item-active'} >
            <Div noti={cartCount > 0} notiTop={-2} notiRight={-7}>
                <FiShoppingCart size={24} />
            </Div>
            <Text>장바구니</Text>
        </StyledNavLink>
    )
}


export const BasicShopTabBar = ({isHidden = false, children}) => {
    // const {consumer} = useLogin()
    // const {noticeInfo} = useNotice()
    // const [alerts, setAlerts] = useRecoilState(optionAlertState)
    // useEffect(() => {
    //     setPrivateCartCount()
    // }, [consumer])
    return(
        <TabBarWrapper isHidden={isHidden}>
            <Absolute>
                {
                    children
                }
            </Absolute>
            <TabBar>
                {/*<Item>*/}
                {/*    <StyledNavLink to={'/menu'} activeClassName={'nav-item-active'}>*/}
                {/*        <FiMenu size={24}/>*/}
                {/*        <Text>메뉴</Text>*/}
                {/*    </StyledNavLink>*/}
                {/*</Item>*/}
                {/*<Item>*/}
                    <StyledNavLink
                        to={'/search'} activeClassName={'nav-item-active'} >
                        <FiSearch size={24} />
                        <Text>검색</Text>
                    </StyledNavLink>
                {/*</Item>*/}
                {/*<Item>*/}
                    <StyledNavLink exact to={'/'} activeClassName={'nav-item-active'} >
                        <FiHome size={24}/>
                        <Text>홈</Text>
                    </StyledNavLink>
                {/*</Item>*/}
                {/*<Item>*/}
                    <StyledNavLink to={'/mypage'} activeClassName={'nav-item-active'} >
                        <FiUser size={24} />
                        <Text>마이페이지</Text>
                    </StyledNavLink>
                {/*</Item>*/}
                {/*<Item>*/}
                <CartTabHook />

                {/*    <StyledNavLink to={'/cartList'} activeClassName={'nav-item-active'} >*/}

                {/*        /!*{*!/*/}
                {/*        /!*    alerts.map(time => <OptionAlert key={time} >장바구니에 담았어요!</OptionAlert>)*!/*/}
                {/*        /!*}*!/*/}

                {/*        <Div noti={noticeInfo.cartCount > 0} notiTop={-2} notiRight={-7}>*/}
                {/*            <FiShoppingCart size={24} />*/}
                {/*        </Div>*/}
                {/*        <Text>장바구니</Text>*/}
                {/*    </StyledNavLink>*/}
                {/*</Item>*/}

                {/*<Item>*/}
                {/*    <Div textAlign={'center'} cursor={1} onClick={this.onSidebarClick}>*/}
                {/*        {*/}
                {/*            isNewWin ? <Icon style={iconStyle} name='newWinP' /> : <Icon style={iconStyle} name='newWin' />*/}
                {/*        }*/}
                {/*        <Text selected={isNewWin}>최근본</Text>*/}
                {/*    </Div>*/}
                {/*</Item>*/}
            </TabBar>
        </TabBarWrapper>
    )
}

export const ShopTabBar = () =>
    <BasicShopTabBar>
        <ScrollUpButton />
    </BasicShopTabBar>


export const HookShopTabBar = (props) => {

    //숨김 처리할지 여부
    const [isHidden, setIsHidden] = React.useState(false);
    //최상단 인지
    // const [isTop, setIsTop] = React.useState(false);

    useScrollPos((scrollObj) => {
        const { previous, current } = scrollObj;
        // console.log("useScrollTop effect", scrollObj);
        setTimeout(() => {
            //숨김 처리할지 여부
            setIsHidden(ComUtil.isDownScrolling(scrollObj));
            //최상단 인지
            // setIsTop(ComUtil.isTopScrolling(current));
        });
    })

    return(
        <BasicShopTabBar isHidden={isHidden}>
            <ScrollUpButton />
        </BasicShopTabBar>
    )
}

export default {
    ShopTabBar,
    HookShopTabBar
}

// const ShopTabBar = (props) => {
//
//     //탭바를 표시 할 지 여부
//     // const matche = useRouteMatch('/home', '/store')
//
//     const matche = useRouteMatch({
//         path: ['/home', '/store']
//     })
//
//     const exactMatche = useRouteMatch({
//         path: ['/',  '/local', '/community', '/mypage'],
//         //path: ['/', '/community', '/search', '/mypage'],
//         exact: true
//     })
//
//     if (!matche && !exactMatche) return null
//     return <ShopTabBarContainer />
// }
// const ShopTabBar = (props) => {
//
//     //탭바 무조건 노출하게 변경
//     return <ShopTabBarContainer />
// }
// export default withRouter(ShopTabBar)







// const ShopTabBar = () => {
//     const [scrollPos, setScrollPos] = useState({x: 0,y: 0})
//     const [scrollDir, setScrollDir] = useState(true); //true : down, false: up
//
//     useEffect(() => {
//         const threshold = 0;
//         let lastScrollY = window.pageYOffset;
//         let ticking = false;
//
//         const updateScrollDir = () => {
//             const scrollY = window.pageYOffset;
//
//             if (Math.abs(scrollY - lastScrollY) < threshold) {
//                 ticking = false;
//                 return;
//             }
//
//             setScrollPos({x: window.scrollX, y: window.scrollY})
//             setScrollDir(scrollY > lastScrollY ? true : false);
//
//             lastScrollY = scrollY > 0 ? scrollY : 0;
//             ticking = false;
//         };
//
//         const onScroll = () => {
//             if (!ticking) {
//                 window.requestAnimationFrame(updateScrollDir);
//                 ticking = true;
//             }
//         };
//
//         window.addEventListener("scroll", onScroll);
//
//         console.log(scrollDir);
//
//         return () => window.removeEventListener("scroll", onScroll);
//     }, [scrollDir]);
//
//     return {
//         x: scrollPos.x, y: scrollPos.y, scrollDir
//     }
// }
// export default ShopTabBar