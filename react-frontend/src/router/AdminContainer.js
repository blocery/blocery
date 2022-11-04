import React, {createContext, useContext, useEffect, useState} from 'react';
import {Div, Flex, Link, Right, Space} from "~/styledComponents/shared";
import { AdminMenuList, AdminSubMenuList } from '~/components/Properties'
import {useRouteMatch, withRouter, NavLink, useHistory} from 'react-router-dom'
import styled from "styled-components";
import {color} from "~/styledComponents/Properties";
import Error from "~/components/Error";
import { Route, Switch, Redirect } from 'react-router-dom'
import loadable from "@loadable/component";
import {BsClockHistory} from 'react-icons/bs'
// import * as Admin from '../components/admin'
import {RiHeart2Line} from 'react-icons/ri'
import {doAdminLogout, getLoginAdminUser} from "~/lib/loginApi";
import {FaSitemap} from 'react-icons/fa'
import {useRecoilState} from "recoil";
import {adminFavoriteMenuState} from "~/recoilState";
import ComUtil from "~/util/ComUtil";
import useAdminMenu from "~/hooks/useAdminMenu";
import {IoIosStar, BsFillBookmarkStarFill, IoIosClose} from "react-icons/all";
import {getValue} from "~/styledComponents/Util";

const activeClassName = "nav-item-active";
const StyledHistoryLink = styled(NavLink).attrs({
    activeClassName,
})`
    
  &.${activeClassName} {    
    color: ${color.danger};
    // font-weight: 700;
  }
`;
const StyledNavLink = styled(NavLink).attrs({
    activeClassName,
})`
    display: flex;
    justify-content: space-between;
    padding: 8px 8px 8px 8px;
    text-decoration: none;
    &:focus, &:hover, &:visited, &:link, &:active {
        text-decoration: none;
    }            
    // &:hover {
    //     background-color: #dfdfdf;
    // }

  &.${activeClassName} {
    // background-color: #dfdfdf;
    color: ${color.danger};
    font-weight: 700;
  }
`;

const StyledSubMenuItem = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 8px;
    transition: 0.1s;
    cursor: pointer;
    &:hover {
        background-color: ${color.veryLight};
    }
`

function getMainMenuList(type){
    return AdminMenuList.filter(menu => menu.type === type)
}
function getSubMenuList(type, parentId) {
    return AdminSubMenuList.filter(subMenu => subMenu.type === type && subMenu.parentId === parentId)
}
function getSubMenu(type, parentId, subId) {
    return AdminSubMenuList.filter(subMenu => subMenu.type === type && subMenu.parentId === parentId && subMenu.id === subId)
}
export function smUrl(subMenu) {
    return `/admin/${subMenu.type}/${subMenu.parentId}/${subMenu.id}`
}

//
function getSiteMapObj(type) {
    const _siteMapObj = {}

    AdminMenuList.filter(menu => menu.type === type)
        .map(mainMenu => {
            const subMenuList = AdminSubMenuList.filter(subMenu => mainMenu.id === subMenu.parentId)

            _siteMapObj[`/${mainMenu.route}/${mainMenu.type}/${mainMenu.id}`] = {
                mainMenu,
                subMenuList
            }


            // return {
            //     [`/${mainMenu.route}/${mainMenu.type}/${mainMenu.id}`]: {
            //         mainMenu: mainMenu,
            //         subMenuList
            //     }
            // }
        })
    console.log(_siteMapObj)

    return _siteMapObj
}

const HEADER_HEIGHT = 35

const AdminContext = createContext()

const AdminContainer = (props) => {

    const { type, id, subId } = props.match.params

    const [admin, setAdmin] = useState(false)

    //서브메뉴를 클릭 할 경우 히드토리 목록에 저장
    const [subMenuHistoryList, setSubMenuHistoryList] = useState([])

    const {initFavoriteMenu, addFavoriteMenu, adminFavoriteMenuList, clearAll} = useAdminMenu()


    useEffect(() => {

        async function fetchAll() {

            const loginInfo = await checkAuth()

            if (!loginInfo)
                return

            try{
                const adminSubMenuHistory = localStorage.getItem("adminSubMenuHistory")

                initFavoriteMenu()

                console.log("adminSubMenuHistory",adminSubMenuHistory)
                if (adminSubMenuHistory) {
                    setSubMenuHistoryList(JSON.parse(adminSubMenuHistory))
                }
            }catch (error) {
                alert('error')
                localStorage.setItem("adminSubMenuHistory", "")
            }
        }

        fetchAll()

    }, [])

    const checkAuth = async () => {
        let loginInfo = await getLoginAdminUser();

        if (!loginInfo) {
            props.history.replace('/admin/login')
        }

        setAdmin(loginInfo)

        return loginInfo

        // else {
        //     this.setState({
        //         loginedAdmin: loginedAdmin
        //     })
        // }
    }

    const onSubMenuClick = (subMenu) => {

        const isMatched = subMenuHistoryList.find(sm => sm.type === subMenu.type && sm.parentId === subMenu.parentId && sm.id === subMenu.id)

        if (!isMatched) {
            const newHistoryList = Object.assign([], subMenuHistoryList)
            newHistoryList.unshift(subMenu)

            //일단 5개까지만 보관하는 것으로..
            if (newHistoryList.length > 5) {
                newHistoryList.splice(newHistoryList.length -1, 1)
            }

            console.log(newHistoryList)
            setSubMenuHistoryList(newHistoryList)
            localStorage.setItem("adminSubMenuHistory", JSON.stringify(newHistoryList))
        }
    }


    const adminLogout = async () => {
        await doAdminLogout();
        props.history.replace('/admin/login')
    }


    const menuList = getMainMenuList(type)

    const Content = AdminSubMenuList.find(subMenu => subMenu.type === type && subMenu.parentId === id && subMenu.id === subId)

    return (
        <AdminContext.Provider value={{type, id, subId, onSubMenuClick}} >
            <Flex alignItems={'flex-start'} p={0} fontSize={13}>
                {/* left */}
                <Div flexShrink={0}>
                    <Div height={HEADER_HEIGHT} fw={900} fontSize={17} textAlign={'center'} lineHeight={HEADER_HEIGHT}>
                        ADMIN
                    </Div>
                    {
                        menuList.map((menu, index) =>
                            <Menu
                                key={`menu${menu.id}`}
                                menu={menu}
                            />
                        )
                    }
                </Div>
                {/* right */}
                <Div flexGrow={1}>
                    {/* header */}
                    <Flex height={HEADER_HEIGHT} fontSize={12}>

                        {/* header-left */}
                        <Space px={16} spaceGap={8}>
                            <BsClockHistory />
                            {
                                subMenuHistoryList.map(sm =>
                                    <StyledHistoryLink key={'history'+sm.id} to={smUrl(sm)} fg={'primary'}>{sm.name}</StyledHistoryLink>
                                )
                            }
                        </Space>
                        <Space px={16} spaceGap={8}>
                            <BsFillBookmarkStarFill color={color.warning}/>
                            {
                                adminFavoriteMenuList.length ? <Div cursor={1} onClick={clearAll}>전체삭제</Div> :
                                <Div>등록된 즐겨찾기가 없네요?</Div>
                            }

                            {
                                adminFavoriteMenuList.map(item =>
                                    <Flex cursor={1}>
                                        <StyledHistoryLink key={'favSubMenu'+item.url} to={item.url} fg={'primary'}>{item.name}</StyledHistoryLink>
                                        <IoIosClose size={20} onClick={addFavoriteMenu.bind(this, item.url)}/>
                                    </Flex>
                                )
                            }
                        </Space>

                        {/* header-right */}
                        <Space ml={'auto'} px={16} height={'100%'}>
                            <SiteMapWrapper>
                                <FaSitemap style={{marginRight: 4}}/>사이트맵
                                <SiteMap />
                            </SiteMapWrapper>
                            { (admin && admin.email === 'tempProducer@ezfarm.co.kr') &&
                            <Link to={'/producer/web'}> [생산자Web으로 이동] </Link>
                            }
                            <Div cursor={1} onClick={adminLogout}>로그아웃</Div>
                        </Space>

                    </Flex>
                    {/* content */}
                    <Div>

                        <Navigator type={type} id={id} subId={subId} />
                        {
                            Content ? <Content.page {...props} /> : <Error />
                        }
                    </Div>
                </Div>
            </Flex>
        </AdminContext.Provider>
    );
};

export default AdminContainer;

const SiteMapWrapper = styled(Flex)`    
    cursor: pointer;
    position: relative;
    height: 100%;
    & > div {
        display: none;
        position: fixed;
    }
    &:hover {
        & > div {
            display: block;            
        }
    }
`

const SiteMap = () => {
    const {type, id, subId, onSubMenuClick} = useContext(AdminContext)
    const siteMapObj = getSiteMapObj(type)

    return(
        <Div custom={`
            position: fixed;
            top: 35PX;
            left: 185.14px;
            right: 0;
            background: white;
            z-index: 99;
            padding: 16px;
            border-radius: 8px;
            overflow: hidden;                        
            box-shadow: rgb(0 0 0 / 16%) 0px 10px 36px 0px, rgb(0 0 0 / 6%) 0px 0px 0px 1px;
        `}>
            <Div custom={`                                                
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                grid-column-gap: 16px; 
                grid-row-gap: 20px;                
            `}>
                {
                    Object.values(siteMapObj).map(({mainMenu, subMenuList}) =>
                        <div>
                            <div>
                                <h6><b>{mainMenu.name}</b></h6>
                            </div>
                            <Div fontSize={14}>
                                {
                                    subMenuList.map(sm =>
                                        <Link onClick={onSubMenuClick.bind(this, sm)}
                                              to={smUrl(sm)}
                                              fg={sm.type === type && sm.parentId === id && sm.id === subId ? 'danger' : 'darkBlack'}
                                              custom={`
                                                display: block;
                                                margin: 4px 0;
                                              `}
                                        >
                                            {sm.name}
                                        </Link>
                                    )
                                }
                            </Div>
                        </div>
                    )
                }
            </Div>
        </Div>
    )
}

// function HoverSubMenuListContainer({type, parentId, position = 'top'}) {
//     const subMenuList = getSubMenuList(type, parentId)
//     return(
//         <Div absolute bg={'white'} rounded={20}
//              left={'100%'}
//              bg={'lightblue'}
//              fg={'white'}
//              custom={`
//                 ${p => p.position === 'top' ? `
//                     top: 0;
//                 ` : `
//                     bottom: 0;
//                 `}
//              `}
//         >
//             {
//                 subMenuList.map(subMenu =>
//                     <Div key={subMenu.id} px={16} py={8} fontSize={12} width={'max-content'}>{subMenu.name}</Div>
//                 )
//             }
//         </Div>
//     )
// }

function Menu({menu}) {
    const {type, id, subId} = useContext(AdminContext)

    const [isOpen, setOpen] = useState(menu.id === id)
    const onHandleClick = () => {
        setOpen(!isOpen)
        // onClick(menu.id)
    }

    useEffect(() => {
        if (menu.id === id) {
            setOpen(true)
        }

    }, [subId])

    const isMatched = menu.id === id

    return (
        <Div cursor={1} relative>
            <Div
                fg={isMatched ? color.danger : color.black}
                onClick={onHandleClick} px={16} py={10} custom={`
                background: #f1f1f1;
                border-bottom: 1px solid #dfdfdf;
                font-size: 15px;
                font-weight: bold;
                
                /* HOVER Content */
                
                & > div {
                    display: none;
                }                
                
                &:hover {
                    & > div {
                        display: block;
                    }
                }
                
            `}>
                {menu.name}
                {/*<HoverSubMenuListContainer type={type} parentId={menu.id} />*/}
            </Div>
            <Div display={isOpen ? 'block' : 'none'}
                 ml={8}
                 custom={`
                    background: white;
                    border-left: 1px solid #e3e3e3;
                `}
            >
                <SubMenues type={type} menu={menu} />
            </Div>
        </Div>
    )
}


const FavoriteButton = styled.div`
    font-size: 18px;
    
    ${props => props.active ? `
        color: ${color.warning};
    ` : `
        color: ${color.light};
    `}
    
    transition: 0.1s; 
    
    &:hover {
        transform: scale(1.2);
    }
`

function SubMenues({type, menu}) {

    const history = useHistory()
    const {onSubMenuClick} = useContext(AdminContext)
    const subMenues = getSubMenuList(type, menu.id)

    const {adminFavoriteMenuList, addFavoriteMenu, isFavoriteMenu} = useAdminMenu()

    const onFavoriteClick = (subMenu, e) => {
        e.stopPropagation()
        addFavoriteMenu(smUrl(subMenu), subMenu.name)
    }
    const push = (subMenu) => {
        onSubMenuClick(subMenu)
        history.push(smUrl(subMenu))
    }

    console.log({history})


    return subMenues.map(subMenu => {
        const url = smUrl(subMenu)

        const isMatched = history.location.pathname === url

        // console.log({url: url, pathname: history})


        return (
            <StyledSubMenuItem key={subMenu.id}>
                <Div flexGrow={1} bold={isMatched} fg={isMatched && 'danger'} onClick={push.bind(this, subMenu)}>{subMenu.name}</Div>
                <FavoriteButton fg={isMatched ? 'primary' : 'light'} active={isFavoriteMenu(subMenu)} onClick={onFavoriteClick.bind(this, subMenu)}>
                    <BsFillBookmarkStarFill />
                </FavoriteButton>
                {/*<StyledNavLink key={subMenu.id} onClick={onSubMenuClick.bind(this, subMenu)} to={`/admin/${subMenu.type}/${subMenu.parentId}/${subMenu.id}`}>{subMenu.name}</StyledNavLink>*/}
            </StyledSubMenuItem>
        )

        // return(
        //     <StyledNavLink key={subMenu.id} to={`/admin/${subMenu.type}/${subMenu.parentId}/${subMenu.id}`}>
        //         <div>{subMenu.name}</div>
        //         <FavoriteButton active={isFavoriteMenu(subMenu)} onClick={onFavoriteClick.bind(this, subMenu)}>
        //             <IoIosStar size={20}/>
        //         </FavoriteButton>
        //     </StyledNavLink>
        // )
    })
}

function Navigator() {

    const {type, id, subId, onSubMenuClick} = useContext(AdminContext)
    const {isFavoriteMenu, addFavoriteMenu} = useAdminMenu()

    const menu = AdminMenuList.find(m => m.type === type && m.id === id)
    const subMenuList = getSubMenuList(type, id)
    const subMenu = subMenuList.find(sm => sm.id === subId)
    return(
        <Flex justifyContent={'space-between'} custom={`border-bottom: 1px solid ${color.light};`}>
            <Space px={16} py={8} flexGrow={1}>
                <BsFillBookmarkStarFill style={{cursor:'pointer'}} size={20} color={isFavoriteMenu(subMenu) ? color.warning : color.light} onClick={addFavoriteMenu.bind(this, smUrl(subMenu), subMenu.name)}/>
                <Div fontSize={12}>
                    {menu.name} >
                </Div>
                <Space spaceGap={8} flexWrap={'wrap'} mb={8}>
                    {
                        subMenuList.map(sm =>
                            <Link key={sm.id} onClick={onSubMenuClick.bind(this, sm)} to={`/admin/${sm.type}/${sm.parentId}/${sm.id}`}>
                                <Div fontSize={12}
                                     bc={'light'}
                                     fg={sm.id === subId ? 'white' : 'black'}
                                     bg={sm.id === subId ? 'danger' : 'white'}
                                     rounded={3} px={8} py={4}>
                                    {sm.name}
                                </Div>
                            </Link>
                        )
                    }
                </Space>
            </Space>
        </Flex>
    )
}

// import React, { Component, Fragment } from 'react'
// import { AdminNav } from '../components/common'
// import { AdminSubMenuList, Server} from '../components/Properties'
// import { TabBar, RadioButtons } from '../components/common'
// import { getLoginAdminUser, doAdminLogout } from '~/lib/loginApi'
// import {Link} from 'react-router-dom'
//
// import Error from '../components/Error'
//
// import {Button, Input, Badge} from 'reactstrap'
// import RecoilBizGoodsViewerModal from "~/components/common/modals/RecoilBizGoodsViewerModal";
//
// import AdminTemplate from "~/router/AdminTemplate";
//
// const bindData = [
//     { value: 'shop', label:'샵블리'},
//     // { value: 'fintech', label:'나이스푸드'}
// ];
//
// class AdminContainer extends Component {
//     constructor(props) {
//         super(props)
//
//         this.state = {
//             loginedAdmin: null
//         }
//     }
//
//
//     async componentDidMount(){
//         let loginedAdmin = await getLoginAdminUser();
//
//         if (!loginedAdmin) {
//             this.props.history.push('/admin/login')
//         }
//         else {
//             this.setState({
//                 loginedAdmin: loginedAdmin
//             })
//         }
//     }
//
//     adminLogout = async () => {
//         await doAdminLogout();
//         this.props.history.push('/admin/login')
//     }
//
//     render() {
//         const { type, id, subId } = this.props.match.params
//         const ContentMenu = AdminSubMenuList.find(subMenu => subMenu.type === type && subMenu.parentId === id && subMenu.id === subId)
//
//         return(
//
//             <Fragment>
//
//                 <div className='p-2 bg-light'>
//
//
//                     { /* Search Bar */ }
//                     <div className='d-flex p-2'>
//                         <div className='d-flex align-content-center font-weight-bold text-info f1'>
//                             Blocery Admin
//                         </div>
//
//                         <div className='d-flex flex-grow-1 justify-content-end align-content-center'>
//                             {/*<div className='m-1'>*/}
//                                 {/*<Badge color='warning' pill>+99</Badge>*/}
//                             {/*</div>*/}
//                             {/*<div className='m-1'>*/}
//                                 {/*<Input style={{width:300}} size={'sm'} placeholder='메뉴 조회'/>*/}
//                             {/*</div>*/}
//                             <div className='m-1'>
//                                 { (this.state.loginedAdmin && this.state.loginedAdmin.email === 'tempProducer@ezfarm.co.kr') &&
//                                     <Link to={'/producer/web'}> [생산자Web으로 이동] </Link>
//                                 }
//                             </div>
//                             {/*<div className='m-1'>*/}
//                             {/*    <RadioButtons size={'sm'}*/}
//                             {/*                  value={bindData.find(item => item.value === type)}*/}
//                             {/*                  options={bindData} onClick={ ({value}) =>{*/}
//
//                             {/*        if(value === 'shop'){*/}
//                             {/*            // window.location = `/admin/shop/order/orderList`*/}
//                             {/*            this.props.history.push(Server.getAdminShopMainUrl())*/}
//                             {/*        }else{*/}
//                             {/*            // window.location = `/admin/fintech/code/classItemList`*/}
//                             {/*            this.props.history.push(Server.getAdminFintechMainUrl())*/}
//                             {/*        }*/}
//
//                             {/*    }} />*/}
//                             {/*</div>*/}
//                             <div className='m-1'>
//                                 <Button size={'sm'} outline onClick={this.adminLogout}>로그아웃</Button>
//                             </div>
//                         </div>
//                     </div>
//
//                     { /* Nav */ }
//                     <AdminNav type={type} id={id} subId={subId} />
//
//                 </div>
//
//                 {
//                     /* Content */
//                     ContentMenu ? <ContentMenu.page /> : <Error />
//                 }
//
//                 {/* 상품 상세 뷰어 (해시태그 수정기능 포함) */}
//                 <RecoilBizGoodsViewerModal />
//
//             </Fragment>
//         )
//     }
// }
//
// export default AdminContainer