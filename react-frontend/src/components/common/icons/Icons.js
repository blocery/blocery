import React from 'react'

import ShoppingCart from '~/images/icons/shopping-cart.svg'
import Notification from '~/images/icons/notification.svg'
import Search from '~/images/icons/ic_search.svg'
import Tomato from '~/images/icons/tomato.svg'
import Next from '~/images/icons/ic_next.svg'
import Home from '~/images/icons/ic_navi_home.svg'      //홈

//탭바
import Menu from '~/images/icons/tabBar/ic_menu.svg'    //카테고리
import Plan from '~/images/icons/tabBar/ic_plan.svg'    //기획전
import HomeNav from '~/images/icons/tabBar/ic_navi_home.svg' //홈
import My from '~/images/icons/tabBar/ic_my.svg'        //마이페이지
import NewWin from '~/images/icons/tabBar/ic_image.svg'  //찜한상품

//탭바(선택된 아이콘)
import MenuP from '~/images/icons/tabBar/ic_menu_p.svg'  //카테고리
import PlanP from '~/images/icons/tabBar/ic_plan_p.svg'  //기획전
import HomeNavP from '~/images/icons/tabBar/ic_navi_home_p.svg'  //홈
import MyP from '~/images/icons/tabBar/ic_my_p.svg'      //마이페이지
import NewWinP from '~/images/icons/tabBar/ic_image_p.svg'//찜한상품


//white icon
import ShoppingCartWhite from '~/images/icons/ic_cart_w.svg'
import NotificationWhite from '~/images/icons/ic_alam_w.svg'
import SearchWhite from '~/images/icons/ic_search_w.svg'

/*
ic_cate_gift          선물세트
ic_cate_kimchisidedish 김치/반찬
ic_cate_gongsanpum 공산품 = 가공식품)
ic_cate_healthfood 건강식품
ic_cate_fruit 과일
ic_cate_veggies   채소
ic_cate_coffee_tea  커피/차
ic_cate_refriger_frozen 냉장/냉동
ic_cate_instantmealkit 즉석식품/밀키트
ic_cate_meat_eggs 정육/계란류
ic_cate_dairy_product 유제품
ic_cate_oil_seasoning_soysauce 오일/양념/장류
ic_cate_rice_miscell_nuts 쌀/잡곡/견과
ic_cate_seafood_dried 수산물/건해산
*/
// 선물세트
import CateGift from '~/images/icons/category/ic_cate_gift.svg'
// 김치/반찬
import CateKimchiSideDish from '~/images/icons/category/ic_cate_kimchisidedish.svg'
// 커피/차
import CateCoffeeTea from '~/images/icons/category/ic_cate_coffee_tea.svg'
// 냉장/냉동
import CateRefrigerFrozen from '~/images/icons/category/ic_cate_refriger_frozen.svg'
// 즉석식품/밀키트
import CateInstantMealkit from '~/images/icons/category/ic_cate_instantmealkit.svg'
// 유제품
import CateDairyProduct from '~/images/icons/category/ic_cate_dairy_product.svg'
// 오일/양념/장류
import CateOilSeasoningSoysauce from '~/images/icons/category/ic_cate_oil_seasoning_soysauce.svg'
// 건강식품
import CateHealthFood from '~/images/icons/category/ic_cate_healthfood.svg'
// 수산물/건해산
import CateSeaFood from '~/images/icons/category/ic_cate_seafood_dried.svg'
// 과일
import CateFruit from '~/images/icons/category/ic_cate_fruit.svg'
// 채소
import CateVeggies from '~/images/icons/category/ic_cate_veggies.svg'
// 정육/계란류
import CateMeat from '~/images/icons/category/ic_cate_meat_eggs.svg'
// 가공식품 = 공산품
import CateGongsanPum from '~/images/icons/category/ic_cate_gongsanpum.svg'
// 쌀/잡곡/견과
import CateRice from '~/images/icons/category/ic_cate_rice_miscell_nuts.svg'


import BackArrow from '~/images/icons/ic_back_arrow.svg'
import BackClose from '~/images/icons/ic_back_close.svg'

import Store from '~/images/icons/store.svg'
import Star from '~/images/icons/ic_star_on.svg'
import Reload from '~/images/icons/reload (1).svg'

//소비자 등급
import GradeVvip from '~/images/icons/grade/ic_rank_vv.svg'
import GradeVip from '~/images/icons/grade/ic_rank_v.svg'
import GradeGold from '~/images/icons/grade/ic_rank_g.svg'
import GradeSilver from '~/images/icons/grade/ic_rank_s.svg'

//베스트 1~3위
import MedalGold from '~/images/icons/ic_medal_g.svg'
import MedalSilver from '~/images/icons/ic_medal_s.svg'
import MedalBronze from '~/images/icons/ic_medal_b.svg'

//느낌표 동그라미
import NotiGreenCircle from '~/images/icons/ic_noti.svg'

import ShareOn from '~/images/icons/ic_share_on.svg'
import HeartOn from '~/images/icons/ic_heart_on.svg'
import StoreGray from '~/images/icons/ic_shop_big.svg'
import Blocery from '~/images/icons/ic_blocery.svg'

import ArrowRightGray from '~/images/icons/ic_more_arrow_n.svg'
import ArrowUpGray from '~/images/icons/ic_more_arrow_up_g.svg'
import ArrowDownGray from '~/images/icons/ic_arrow_down_g.svg'
import ArrowLeftGray from '~/images/icons/ic_arrow_left_g.svg'
import Handle from '~/images/icons/handle.png'
import CartPurchase from '~/images/icons/ic_purchase.svg'

import AgreeCheckOn from '~/images/icons/ic_reser_on.svg'
import AgreeCheckOff from '~/images/icons/ic_reser_off.svg'


import MdPick from '~/images/icons/ic_mdPick.svg'
import Medal from '~/images/icons/ic_medal.svg'
import New from '~/images/icons/ic_new.svg'

import ArrowUpDownGray from '~/images/icons/arrow.svg'


import ViewTypeList from '~/images/icons/ic_list.svg'
import ViewTypeHalfCard from '~/images/icons/ic_listbox.svg'





const Style = {width: '100%', height: '100%'}



const IconShoppingCart = ({...rest}) => <img src={ShoppingCart} {...rest} alt={'로고'}/>
const IconNotification = ({...rest}) => <img src={Notification} {...rest} alt={'알림'}/>
const IconSearch = ({...rest}) => <img src={Search} {...rest} alt={'검색'}/>
const IconNext = ({...rest}) => <img src={Next} {...rest} alt={'더보기'}/>
const IconHome = ({...rest}) => <img src={Home} {...rest} alt={'홈으로'}/>

//white
const IconShoppingCartWhite = ({...rest}) => <img src={ShoppingCartWhite} {...rest} alt={'로고'}/>
const IconNotificationWhite = ({...rest}) => <img src={NotificationWhite} {...rest} alt={'알림'}/>
const IconSearchWhite = ({...rest}) => <img src={SearchWhite} {...rest} alt={'검색'}/>

const IconTomato = ({...rest}) => <img src={Tomato} {...rest} alt={'토마토'}/>

const IconCateGift = ({...rest}) => <img src={CateGift}  {...rest} alt={'선물세트'}/>
const IconCateKimchiSideDish = ({...rest}) => <img src={CateKimchiSideDish} {...rest} alt={'김치/반찬'}/>
const IconCateCoffeeTea = ({...rest}) => <img src={CateCoffeeTea} {...rest} alt={'커피/차'}/>
const IconCateRefrigerFrozen = ({...rest}) => <img src={CateRefrigerFrozen} {...rest} alt={'냉장/냉동'}/>
const IconCateInstantMealkit = ({...rest}) => <img src={CateInstantMealkit} {...rest} alt={'즉석식품/밀키트'}/>
const IconCateDairyProduct = ({...rest}) => <img src={CateDairyProduct} {...rest} alt={'유제품'}/>
const IconCateOilSeasoningSoysauce = ({...rest}) => <img src={CateOilSeasoningSoysauce} {...rest} alt={'오일/양념/장류'}/>
const IconCateHealthFood = ({...rest}) => <img src={CateHealthFood} {...rest} alt={'건강식품'}/>
const IconCateSeaFood = ({...rest}) => <img src={CateSeaFood} {...rest} alt={'수산물'}/>
const IconCateFruit = ({...rest}) => <img src={CateFruit} {...rest} alt={'과일'}/>
const IconCateMeat = ({...rest}) => <img src={CateMeat} {...rest} alt={'정육/계란류'}/>
const IconCateGongsanPum = ({...rest}) => <img src={CateGongsanPum} {...rest} alt={'공산품'}/>
const IconCateRice = ({...rest}) => <img src={CateRice} {...rest} alt={'쌀/잡곡/견과'}/>
const IconCateVeggies = ({...rest}) => <img src={CateVeggies}  {...rest} alt={'채소'}/>

const IconBackArrow = ({...rest}) => <img src={BackArrow} {...rest} alt={'뒤로가기'}/>
const IconBackClose = ({...rest}) => <img src={BackClose} {...rest} alt={'닫기'}/>

const IconStore = ({...rest}) => <img src={Store} {...rest} alt={'store'}/>
const IconStar = ({...rest}) => <img src={Star} {...rest} alt={'star'}/>
const IconReload = ({...rest}) => <img src={Reload} {...rest} alt={'reload'}/>



const IconGradeVvip = ({...rest}) => <img src={GradeVvip} {...rest} alt={'vvip'}/>
const IconGradeVip = ({...rest}) => <img src={GradeVip} {...rest} alt={'vip'}/>
const IconGradeGold = ({...rest}) => <img src={GradeGold} {...rest} alt={'gold'}/>
const IconGradeSilver = ({...rest}) => <img src={GradeSilver} {...rest} alt={'silver'}/>

const IconMedalGold = ({...rest}) => <img src={MedalGold} {...rest} alt={'silver'}/>
const IconMedalSilver = ({...rest}) => <img src={MedalSilver} {...rest} alt={'silver'}/>
const IconMedalBronze = ({...rest}) => <img src={MedalBronze} {...rest} alt={'silver'}/>
const IconNotiGreenCircle = ({...rest}) => <img src={NotiGreenCircle} {...rest} alt={'noti'}/>


function Icon({name, ...rest}){
    let props = {}

    switch (name){
        case 'heartOn':
            props.src = HeartOn
            props.alt = '찜하기'

            break
        case 'shareOn':
            props.src = ShareOn
            props.alt = '공유하기'
            break
        case 'storeGray':
            props.src = StoreGray
            props.alt = '상점'
            break
        case 'blocery':
            props.src = Blocery
            props.alt = '블로서리'
            break
        case 'arrowUpGray':
            props.src = ArrowUpGray
            props.alt = '더보기'
            break
        case 'arrowRightGray':
            props.src = ArrowRightGray
            props.alt = '더보기'
            break
        case 'arrowDownGray':
            props.src = ArrowDownGray
            props.alt = '더보기'
            break
        case 'arrowLeftGray':
            props.src = ArrowLeftGray
            props.alt = '뒤로가기'
            break
        case 'handle':
            props.src = Handle
            props.alt = '뒤로가기'
            break

        case 'cartPurchase':
            props.src = CartPurchase
            props.alt = '구매하기'
            break

        //탭바
        case 'menu':
            props.src = Menu
            props.alt = '카테고리'
            break
        case 'plan':
            props.src = Plan
            props.alt = '기획전'
            break
        case 'homeNav':
            props.src = HomeNav
            props.alt = '홈'
            break
        case 'my':
            props.src = My
            props.alt = '마이페이지'
            break
        case 'newWin':
            props.src = NewWin
            props.alt = '찜한상품'
            break

        case 'menuP':
            props.src = MenuP
            props.alt = '카테고리'
            break
        case 'planP':
            props.src = PlanP
            props.alt = '기획전'
            break
        case 'homeNavP':
            props.src = HomeNavP
            props.alt = '홈'
            break
        case 'myP':
            props.src = MyP
            props.alt = '마이페이지'
            break
        case 'newWinP':
            props.src = NewWinP
            props.alt = '찜한상품'
            break


        case 'agreeCheckOn':
            props.src = AgreeCheckOn
            props.alt = '동의함'
            break
        case 'agreeCheckOff':
            props.src = AgreeCheckOff
            props.alt = '미동의'
            break

        case 'mdPick':
            props.src = MdPick
            props.alt = '기획전'
            break

        case 'medal':
            props.src = Medal
            props.alt = '베스트'
            break

        case 'new':
            props.src = New
            props.alt = '신상품'
            break
        case 'arrowUpDownGray':
            props.src = ArrowUpDownGray
            props.alt = '시간정렬'
            break
        case 'viewTypeList':
            props.src = ViewTypeList
            props.alt = '리스트보기'
            break
        case 'viewTypeHalfCard':
            props.src = ViewTypeHalfCard
            props.alt = '2개씩보기'
            break

        case 'store':
            props.src = Store
            props.alt = '상점'
            break

    }
    return <img {...rest} {...props}/>
}



// IconShoppingCart.defaultProps = {style: {width: '100%', height: '100%'}}
// IconNotification.defaultProps = {style: {width: '100%', height: '100%'}}
// IconSearch.defaultProps = {style: {width: '100%', height: '100%'}}
IconTomato.defaultProps = {style: Style}

IconCateSeaFood.defaultProps = {style: Style}
IconCateKimchiSideDish.defaultProps = {style: Style}
IconCateFruit.defaultProps = {style: Style}
IconCateMeat.defaultProps = {style: Style}
IconCateGongsanPum.defaultProps = {style: Style}
IconCateRice.defaultProps = {style: Style}
IconCateVeggies.defaultProps = {style: Style}
IconCateGift.defaultProps = {styele: Style}
IconCateCoffeeTea.defaultProps = {styele: Style}
IconCateRefrigerFrozen.defaultProps = {styele: Style}
IconCateInstantMealkit.defaultProps = {styele: Style}
IconCateDairyProduct.defaultProps = {styele: Style}
IconCateOilSeasoningSoysauce.defaultProps = {styele: Style}
IconCateHealthFood.defaultProps = {styele: Style}

IconBackArrow.defaultProps = {}
IconBackClose.defaultProps = {}


IconStore.defaultProps = {}

IconGradeVvip.defaultProps = {}
IconGradeVip.defaultProps = {}
IconGradeGold.defaultProps = {}
IconGradeSilver.defaultProps = {}

IconMedalGold.defaultProps = {}
IconMedalSilver.defaultProps = {}
IconMedalBronze.defaultProps = {}
IconNotiGreenCircle.defaultProps = {}

IconStar.defaultProps = {}

export {
    IconShoppingCart,
    IconNotification,
    IconSearch,
    IconNext,
    IconHome,
    IconTomato,
    IconShoppingCartWhite,
    IconNotificationWhite,
    IconSearchWhite,

    IconCateSeaFood,
    IconCateKimchiSideDish,
    IconCateFruit,
    IconCateMeat,
    IconCateGongsanPum,
    IconCateRice,
    IconCateVeggies,
    IconCateGift,
    IconCateCoffeeTea,
    IconCateRefrigerFrozen,
    IconCateInstantMealkit,
    IconCateDairyProduct,
    IconCateOilSeasoningSoysauce,
    IconCateHealthFood,

    IconBackArrow,
    IconBackClose,

    IconStore,
    IconGradeVvip,
    IconGradeVip,
    IconGradeGold,
    IconGradeSilver,

    IconMedalGold,
    IconMedalSilver,
    IconMedalBronze,

    IconNotiGreenCircle,

    Icon,
    IconStar,
    IconReload
}
