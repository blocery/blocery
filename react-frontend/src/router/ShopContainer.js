import React, { Component, Fragment, useState, useEffect } from 'react';
import { Route, Switch, Redirect } from 'react-router-dom'
import loadable from "@loadable/component";
// import Search from '~/components/shop/search'




import { Event, EventList, EventAppReview, Login,
    // Goods,
    // MultiGiftBuy,
    // DirectBuy, CartBuy, BuyFinish,
    // ConsumerJoin,
    // InputAddress, //미사용
    //JoinComplete,
    // FarmersDetailActivity, 미사용
    // CartList,
    // ZzimList
} from '../components/shop'


import Error from '../components/Error'
// import { Mypage, TokenHistory, Deposit, Withdraw, DonHistory, Point, PointInfo, PointToBly, PointToCoupon, Level, LevelInfo } from "~/components/shop/mypage";
// import KakaoCertCheck from '~/components/shop/mypage/kakaoCertCheck'

import {BlocerySpinner, ShopXButtonNav} from '~/components/common'
import {ShopTabBar} from '~/components/common/tabBars/ShopTabBar'

// import ComUtil from '../util/ComUtil'
// import {GoodsReview, GoodsReviewList, ProducersGoodsList, ProducersFarmDiaryList,
// ProducersFarmDiary, 미사용
// ProducerFollowerList} from '../components/shop'

// import {ProducerMypage, ProducerFeedList, ProducerReviewList, ProducerQnaList, ProducerGoodsList, ProducerCancelList, ProducerOrderList} from "~/components/producer/mobile/mypage"
// import ProducerFeed from "~/components/producer/mobile/feed"


// import { Order, OrderDetail, OrderList, UpdateAddress, OrderCancel } from "../components/shop/mypage/orderList";
// import { CompleteSecession } from "~/components/shop/login"
// import { InfoManagementMenu, CheckCurrentValword, ModifyConsumerInfo, ModifyValword, AddressManagement, AddressModify, HintPassPhrase, ApplySecession } from "../components/shop/mypage/infoManagement"
// import GoodsQnaList from "~/components/shop/mypage/myQA" //미사용
// import NotificationList from "~/components/shop/mypage/notificationList";
// import { NoticeList } from "~/components/common/noticeList";
// import RegularShopList from "~/components/shop/mypage/regularShops"
// import { PrivateContact, Faq } from "~/components/shop/mypage/consumerCenter"
// import UseGuide from '~/components/shop/mypage/useGuide'
// import { Setting, TermsOfUse, PrivacyPolicy } from "~/components/shop/mypage/setting"
// import { KycCertification, KycDocument, KycFinish } from '~/components/shop/mypage/certification'
// import { CouponList } from '~/components/shop/mypage/couponList'
// import InviteFriend from '~/components/shop/mypage/inviteFriend'
// import IosKakaoLink from '~/components/shop/mypage/inviteFriend/IosKakaoLink'
// import { ConsumerProfile, ProducerProfile, CommonProfile, ConsumerBoardList, ConsumerReviewList } from '~/components/shop/mypage/profile'
// import ConsumerBadgeList from '~/components/shop/mypage/badge'
// import CouponGoodsList from "~/components/shop/couponGoodsList";
// import BuyCouponGoods from "~/components/shop/buyCouponGoods";

// import MdPick from '~/components/shop/mdPick' //미사용
// import MdPickSub from '~/components/shop/mdPickSub'

// import { Category, GiftSet } from '~/components/shop/category'
// import GoodsListByItemKind from '~/components/shop/goodsListByItemKind'

import { PrivateRoute } from "./PrivateRoute";

// import Home from '~/components/shop/home'
// import Store from '~/components/shop/store/store'
// import BloceryHome from '~/components/BloceryHome' //미사용

import { getLoginUserType, getLoginUser } from '~/lib/loginApi'
import { Webview } from "~/lib/webviewApi";

// import {b2cQueInfo} from '~/components/common/winOpen'
// import B2cSidebar from '~/components/common/sideBars/B2cSidebar'
import {Transition} from 'react-spring/renderprops'
import B2cBottomBar from '~/components/common/sideBars/B2cBottombar'

import CommunitySidebar from "~/components/common/sideBars/CommunitySidebar";
import LoginModal from "~/components/common/modals/LoginModal";
import {responsive} from "~/styledComponents/Properties";
import {FixedScrollUpButton} from "~/components/common/buttons/ScrollUpButton";
import {getValue} from "~/styledComponents/Util";
import useLogin from "~/hooks/useLogin";
import useNotice from "~/hooks/useNotice";
import {useRecoilState, useSetRecoilState} from "recoil";
import {optionAlertState} from "~/recoilState";
import {OptionAlert, OptionAlertHook} from "~/components/common/optionAlert";
import {Fixed} from "~/styledComponents/shared";
import useCartCount from "~/hooks/useCartCount";
// import KakaoCertCheck from "~/components/shop/mypage/kakaoCertCheck";
// import Talk from "~/components/shop/talk";


const Search = loadable(() => import('~/components/shop/search'))

//[상품 상세] (즉시/쑥쑥) 공통
const Goods = loadable(() => import('~/components/shop/goods'))

//[쑥쑥 상품] 구매
const DealGoodsBuy = loadable(() => import('~/components/shop/goodsBuy/dealGoodsBuy'))
//[즉시 상품] 선물 구매
const MultiGiftBuy = loadable(() => import('~/components/shop/goodsBuy/directGoodsBuy/MultiGiftBuy'))
//[즉시 상품] 바로 구매 -> optionGoodsBuy 만 사용함
// const DirectBuy = loadable(() => import('~/components/shop/goodsBuy/directGoodsBuy/DirectBuy'))

const OptionGoodsBuy = loadable(() => import('~/components/shop/goodsBuy/optionGoodsBuy'))



//[즉시 상품] 장바구니 구매
const CartBuy = loadable(() => import('~/components/shop/goodsBuy/directGoodsBuy/CartBuy'))
const BuyFinish = loadable(() => import('~/components/shop/goodsBuy/directGoodsBuy/BuyFinish'))
const ConsumerJoin = loadable(() => import('~/components/shop/join/ConsumerJoin'))
const JoinComplete = loadable(() => import('~/components/shop/joinComplete/JoinComplete'))
const CartList = loadable(() => import('~/components/shop/cartList/CartList'))
const ZzimList = loadable(() => import('~/components/shop/zzimGoodsList'))



// 상품번호로 전체 이력추적 뷰어
const GoodsTraceListByGoodsNo = loadable(() => import('~/components/shop/goodsTraceListByGoodsNo'))
// 상품번호로 전체 리뷰 뷰어
const goodsReviewListByGoodsNo = loadable(() => import('~/components/shop/goodsReviewListByGoodsNo'))

const ReplyList = loadable(() => import('~/components/shop/mypage/activity/ReplyList'))
const MyBoardList = loadable(() => import('~/components/shop/mypage/activity/MyBoardList'))

//커뮤니티
const Community = loadable(() => import('~/components/shop/community'))

// const CmGoodsReviewMain = loadable(() => import('~/components/shop/community/cmGoodsReviewMain'))
const RealtimeGoodsReviewList = loadable(() => import('~/components/shop/realtimeGoodsReviewList'))
// const CmGoodsReviewDetail = loadable(() => import('~/components/shop/community/cmGoodsReviewDetail'))
const GoodsReviewDetail = loadable(() => import('~/components/shop/goodsReviewDetail'))
const CmTermsOfPrivacy = loadable(() => import('~/components/shop/community/termsOfPrivacy'))


const BoardVoteMain = loadable(() => import('~/components/shop/community/boardVoteMain'))
const BoardVoteDetail = loadable(() => import('~/components/shop/community/boardVoteDetail'))

const Board = loadable(() => import('~/components/shop/community/boardMain'))
const BoardWriting = loadable(() => import('~/components/shop/community/boardWriting'))
const BoardViewer = loadable(() => import('~/components/shop/community/boardViewer'))
const Roulette = loadable(() => import('~/components/shop/roulette'))
const HashTagGroupTemplate = loadable(() => import('~/components/shop/hashTagGroupTemplate'))

const AboutSsugSsug = loadable(() => import('~/components/shop/about/AboutSsugSsug'))

//마이페이지
const Mypage = loadable(() => import('~/components/shop/mypage/Mypage'))
const TokenHistory = loadable(() => import('~/components/shop/mypage/tokenHistory'))
const Deposit = loadable(() => import('~/components/shop/mypage/deposit'))
const Withdraw = loadable(() => import('~/components/shop/mypage/withdraw'))
const DonHistory = loadable(() => import('~/components/shop/mypage/donHistory'))
const Point = loadable(() => import('~/components/shop/mypage/point'))
const PointInfo = loadable(() => import('~/components/shop/mypage/point/PointInfo'))
const PointToCoupon = loadable(() => import('~/components/shop/mypage/point/PointToCoupon'))
const PointToBly = loadable(() => import('~/components/shop/mypage/point/PointToBly'))
const Level = loadable(() => import('~/components/shop/mypage/level'))
const LevelInfo = loadable(() => import('~/components/shop/mypage/levelInfo'))
const MyQA = loadable(() => import('~/components/shop/mypage/myQA'))
const MyQAReg = loadable(() => import('~/components/shop/mypage/myQA/MyQAReg'))
const ScrapList = loadable(() => import('~/components/shop/mypage/activity/ScrapList'))
const Order = loadable(() => import('~/components/shop/mypage/orderList/Order'))
const OrderDetail = loadable(() => import('~/components/shop/mypage/orderList/OrderDetail'))
const OrderList = loadable(() => import('~/components/shop/mypage/orderList/OrderList'))
const UpdateAddress = loadable(() => import('~/components/shop/mypage/orderList/UpdateAddress'))
const OrderCancel = loadable(() => import('~/components/shop/mypage/orderList/OrderCancel'))
const KakaoCertCheck = loadable(() => import('~/components/shop/mypage/kakaoCertCheck'))

const GoodsReview = loadable(() => import('~/components/shop/goodsReview'))
const GoodsReviewList = loadable(() => import('~/components/shop/goodsReviewList'))
const ProducersGoodsList = loadable(() => import('~/components/shop/producersGoodsList'))
const ProducersFarmDiaryList = loadable(() => import('~/components/shop/producersFarmDiaryList'))
const ProducerFollowerList = loadable(() => import('~/components/shop/producerFollowerList'))


const ProducerMypage = loadable(() => import('~/components/producer/mobile/mypage/Mypage'))
const ProducerFeedList = loadable(() => import('~/components/producer/mobile/mypage/FeedList'))
const ProducerReviewList = loadable(() => import('~/components/producer/mobile/mypage/GoodsReviewList'))
const ProducerQnaList = loadable(() => import('~/components/producer/mobile/mypage/QnaList'))
const ProducerGoodsList = loadable(() => import('~/components/producer/mobile/mypage/GoodsList'))
const ProducerCancelList = loadable(() => import('~/components/producer/mobile/mypage/CancelList'))
const ProducerNewOrderList = loadable(() => import('~/components/producer/mobile/mypage/newOrderList'))
const ProducerOrderList = loadable(() => import('~/components/producer/mobile/mypage/OrderList'))
const ProducerFeed = loadable(() => import('~/components/producer/mobile/feed'))

//삽블리 이용 종료 안내
const CompleteSecession = loadable(() => import('~/components/shop/login/CompleteSecession'))


const InfoManagementMenu = loadable(() => import('~/components/shop/mypage/infoManagement/InfoManagementMenu'))
const CheckCurrentValword = loadable(() => import('~/components/shop/mypage/infoManagement/CheckCurrentValword'))
const ModifyConsumerInfo = loadable(() => import('~/components/shop/mypage/infoManagement/ModifyConsumerInfo'))
const ModifyValword = loadable(() => import('~/components/shop/mypage/infoManagement/ModifyValword'))
const AddressManagement = loadable(() => import('~/components/shop/mypage/infoManagement/AddressManagement'))
const AddressModify = loadable(() => import('~/components/shop/mypage/infoManagement/AddressModify'))
const HintPassPhrase = loadable(() => import('~/components/shop/mypage/infoManagement/HintPassPhrase'))
const ApplySecession = loadable(() => import('~/components/shop/mypage/infoManagement/ApplySecession'))

const NotificationList = loadable(() => import('~/components/shop/mypage/notificationList'))
const NoticeList = loadable(() => import('~/components/common/noticeList'))
const RegularShopList = loadable(() => import('~/components/shop/mypage/regularShops'))

const PrivateContact = loadable(() => import('~/components/shop/mypage/consumerCenter/PrivateContact'))
const Faq = loadable(() => import('~/components/shop/mypage/consumerCenter/Faq'))
const UseGuide = loadable(() => import('~/components/shop/mypage/useGuide'))

const Setting = loadable(() => import('~/components/shop/mypage/setting/Setting'))
const TermsOfUse = loadable(() => import('~/components/shop/mypage/setting/TermsOfUse'))
const PrivacyPolicy = loadable(() => import('~/components/shop/mypage/setting/PrivacyPolicy'))

const KycCertification = loadable(() => import('~/components/shop/mypage/certification/KycCertification'))
const KycDocument = loadable(() => import('~/components/shop/mypage/certification/KycDocument'))
const KycFinish = loadable(() => import('~/components/shop/mypage/certification/KycFinish'))
const CouponList = loadable(() => import('~/components/shop/mypage/couponList/CouponList'))
const CouponDownload = loadable(() => import('~/components/shop/couponDownload'))
const InviteFriend = loadable(() => import('~/components/shop/mypage/inviteFriend'))
const IosKakaoLink = loadable(() => import('~/components/shop/mypage/inviteFriend/IosKakaoLink'))

const ConsumerProfile = loadable(() => import('~/components/shop/mypage/profile/ConsumerProfile'))
const ProducerProfile = loadable(() => import('~/components/shop/mypage/profile/ProducerProfile'))
const CommonProfile = loadable(() => import('~/components/shop/mypage/profile/CommonProfile'))
// const ConsumerBoardList = loadable(() => import('~/components/shop/mypage/profile/ConsumerBoardList'))
const ConsumerReviewList = loadable(() => import('~/components/shop/mypage/profile/ConsumerReviewList'))
const ConsumerBadgeList = loadable(() => import('~/components/shop/mypage/badge'))
const CouponGoodsList = loadable(() => import('~/components/shop/couponGoodsList'))
const BuyCouponGoods = loadable(() => import('~/components/shop/buyCouponGoods'))

// const MdPickSub = loadable(() => import('~/components/shop/mdPickSub'))
const MdPickSub = loadable(() => import('~/components/shop/store/mdPickSub'))

const Category = loadable(() => import('~/components/shop/category/Category'))
const GiftSet = loadable(() => import('~/components/shop/category/GiftSet'))
const GoodsListByItemKind = loadable(() => import('~/components/shop/goodsListByItemKind'))

const Menu = loadable(() => import('~/components/shop/menu'))
// const Home = loadable(() => import('~/components/shop/home'))
const Home = loadable(() => import('~/components/shop/home'))
const Store = loadable(() => import('~/components/shop/store'))
const My = loadable(() => import('~/components/shop/my'))
const B2cSidebar = loadable(() => import('~/components/common/sideBars/B2cSidebar'))

const Main = loadable(() => import('~/components/shop/main'))
const Local = loadable(() => import('~/components/shop/local/home'))
const LocalFaq = loadable(() => import('~/components/shop/local/home/LocalFaq'))
//배송완료처리 화면
const Delivery = loadable(() => import('~/components/shop/local/delivery/Delivery'))
//로컬 농가 통계확인 화면
const SearchFarmer = loadable(() => import('~/components/shop/local/farmerSum/SearchFarmer'))
const FarmerSum = loadable(() => import('~/components/shop/local/farmerSum/FarmerSum'))


const LocalAddressList = loadable(() => import('~/components/shop/local/components/LocalAddressList'))

// const LocalGoods = loadable(() => import('~/components/shop/local/localGoods'))
const LocalStore = loadable(() => import('~/components/shop/local/localStore'))

const FarmerGoodsList = loadable(() => import('~/components/shop/local/farmerGoodsList'))

const GoodsList = loadable(() => import('~/components/shop/goodsList'))

const People = loadable(() => import('~/components/shop/people'))
const PbFarmDiary = loadable(()=> import('~/components/shop/goods/pbGoodsDetail/PbFarmDiary'))

const Wrapper = {
    display: 'flex',
    justifyContent: 'center'
}
const Content = {
    width: 640
}

//사이드바 애니 적용
class SidebarWrapper extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sideBarWidth: '90%'
        }
    }

    render(){
        return(
            <Transition
                items={this.props.menuOpen}
                from={{opacity: 0, left: this.state.sideBarWidth}}   //B2cSidebar.module.scss 의  .modal 의 width 와 동일함
                enter={{ opacity: 1, left: '0%'}}
                leave={{ opacity: 0, left: this.state.sideBarWidth}}
                config={{duration: 200, mass: 5, tension: 500, friction: 80
                    //, ...config.stiff
                }}
            >
                {
                    toggle =>
                        toggle && (
                            props =>
                                <div
                                    className={'dom_b2c_sidebar'}
                                    style={{position: 'fixed', opacity: 1, zIndex: 99999, top: 0, bottom: 0, width: '100%'}}
                                    onClick={this.props.onClose}
                                >
                                    <B2cSidebar width={this.state.sideBarWidth} left={props.left} onClose={this.props.onClose} history={this.props.history}/>
                                </div>
                        )
                }
            </Transition>
        )
    }
}

//탭이 포함 되어있는 라우터
function TabContainer({children}) {
    return(
        <>
            <Switch>
                {children}
            </Switch>
            <ShopTabBar />
        </>
    )
}


const ShopContainer = () => {

    const [state, setState] = useState({
        mounted: false,
    })

    // const [alerts, setAlerts] = useRecoilState(optionAlertState)
    const {consumer} = useLogin()
    const { setPublicNotices, setPrivateNotificationNew} = useNotice()
    const {setPrivateCartCount} = useCartCount()

    useEffect(() => {
        //프라이빗 noti(로그인한 사용자 noti 정보)
        setPrivateNotificationNew()
        setPrivateCartCount()
    }, [consumer])

    // constructor(props) {
    //     super(props);
    //
    //     this.state = {
    //         mounted: false,
    //     }
    // }

    useEffect(() => {

        //퍼블릭 noti
        // setPublicNotices()

        async function fetch(){
            const { data: userType } = await getLoginUserType()
            if(userType){
                const user = await getLoginUser()

                //쿠키 세션 동기화
                localStorage.setItem('userType', userType);
                localStorage.setItem('account', user.account); //geth Account
                localStorage.setItem('email', user.email);

                Webview.appLog('ShopContainer Router: setValword TEST');
                //valword는 비어있음. localStorage.setItem('valword', ComUtil.encrypt(user.valword));
                sessionStorage.setItem('logined', 1);

            }else{ //login안된 경우.
                //Webview.appLog('ShopContainer Router:' + localStorage.getItem('autoLogin'));
                if (localStorage.getItem('autoLogin') != 1) { //로그아웃을 한경우만 지워주면 됨: 로그아웃하면 autoLogin이 지워짐
                    localStorage.removeItem('userType');
                    localStorage.removeItem('account'); //geth Account
                    localStorage.removeItem('email');

                    //Webview.appLog('ShopContainer Router: + RemoveValword');

                    //localStorage.removeItem('valword');
                    sessionStorage.removeItem('logined');
                }
            }

            setState({mounted: true})

        }

        fetch()

    }, []);

    if (!state.mounted) return <BlocerySpinner/>

    return (
        <div
            // className={'shopMediaWrapper'}
        >
            {/* RENEW 탭바 fixed 공간만큼 아래 강제 57 이상 여유 있게*/}
            <div style={{maxWidth: responsive.maxWidth, position: 'relative', margin: '0 auto', paddingBottom: getValue(80)}}
                // className='shopMediaContainer'
            >
                <div >

                    <Switch>

                        {/*<Route exact path='/' render={({location}) => <Redirect to={'/home'+ ((location.search)?location.search : '')}/>}/>*/}


                        {/** 탭바가 없는 컨텐츠 START **/}
                        <Route exact path={'/goods'} component={Goods}/>
                        <Route path='/login' component={Login}/>
                        <Route path='/join' component={ConsumerJoin}/>
                        <Route path='/joinComplete' component={JoinComplete}/>
                        {/* 공동구매 상품구매 */}
                        <PrivateRoute exact path={'/dealGoods/buy'} component={DealGoodsBuy} />
                        {/* 일   반 상품구매 */}
                        <PrivateRoute exact path={'/optionGoods/buy'} component={OptionGoodsBuy} />
                        <PrivateRoute exact path={'/multiGiftBuy'} component={MultiGiftBuy} />
                        <PrivateRoute exact path={'/cartBuy'} component={CartBuy} />
                        <PrivateRoute exact path={'/buyFinish'} component={BuyFinish} />
                        {/*<PrivateRoute exact path={'/cartList'} component={CartList}/>*/}
                        {/* public 으로 변경(탭으로 들어와서) */}
                        <Route exact path={'/cartList'} component={CartList}/>

                        <Route path={'/kakaoCertCheck'} component={KakaoCertCheck}/>
                        {/*<Route path={'/withdraw'} component={Withdraw}/>*/}
                        <Route path={'/kycCertification'} component={KycCertification}/>
                        <Route path={'/kycDocument'} component={KycDocument}/>
                        <Route path={'/kycFinish'} component={KycFinish}/>

                        {/* 커뮤니티 > 게시판 글쓰기 */}
                        <PrivateRoute exact path={'/community/board/writing/:boardType'} component={BoardWriting} />
                        <PrivateRoute exact path={'/goodsReview'} component={GoodsReview} />
                        {/* QA 등록 */}
                        <PrivateRoute exact path={'/mypage/myQAReg'} component={MyQAReg} />


                        {/** 탭바가 없는 컨텐츠 END **/}




                        {/** 탭바가 있는 컨텐츠 START **/}
                        <TabContainer>

                            {/*<Route exact path={['/home', '/home/1']} render={() => <Redirect to={'/'} />}/>*/}

                            {/* root, local 은 탭을 상단에서 추가해 줌 */}
                            <Route exact path={['/', '/local', '/home', '/home/1']} component={Main}/>
                            {/*<Route exact path={'/local'} component={Main}/>*/}

                            <Route exact path='/store/:id' component={Store}/>
                            <Route exact path='/store' render={()=><Redirect to={'/store/best'}/>}/>
                            <Route exact path='/my/:id' component={My}/>


                            {/* public */}

                            <Route exact path='/people/:tabId' component={People}/>
                            <Route path='/event' component={Event}/>
                            <Route path='/eventAppReview' component={EventAppReview}/>
                            <Route path='/eventList' component={EventList}/>
                            {/* 기존 생산자 입점문의 => 위의 입점상담으로 변경 */}
                            {/*<Route path='/mypage/queInfo' component={b2cQueInfo}/>*/}
                            <Route path='/mypage/privateContact' component={PrivateContact}/>
                            <Route path='/faq' component={Faq}/>
                            <Route path='/mypage/useGuide' component={UseGuide}/>
                            <Route path='/mypage/termsOfUse' component={TermsOfUse}/>
                            <Route path='/mypage/privacyPolicy' component={PrivacyPolicy}/>

                            <Route path='/about/ssugssug' component={AboutSsugSsug}/>
                            <Route path={'/jeil/:farmerCode/:itemCode'} component={PbFarmDiary} />

                            {/*<Route exact path='/' render={() => <Redirect to={'/home'}/>} />*/}


                            <Route exact path={'/menu'} component={Menu}/>
                            {/*<Route exact path={'/home'} component={Home}/>*/}
                            {/*<Route path={'/home/:id'} component={Home}/>*/}
                            {/*<Route exact path={'/store'} component={Store}/>*/}
                            {/*<Route path={'/store/:id'} component={Store}/>*/}
                            {/*<Route exact path={'/home'} component={Store}/>*/}

                            {/* 전체상품 */}
                            <Route path={'/goodsList'} component={GoodsList}/>
                            {/* 로컬푸드 배송처리 */}
                            <Route exact path={'/local/delivery/:orderSubGroupNo'} component={Delivery} />

                            {/*<Route exact path={'/ok/:localFarmerNo'} component={FarmerSum} />*/}
                            <Route exact path={'/localhistory/:producerNo'} component={SearchFarmer} />
                            <Route exact path={'/localhistory/localFarmer/:localFarmerNo'} component={FarmerSum} />

                            {/* 로컬푸드 */}

                            <Route exact path={'/localFaq'} component={LocalFaq}/>
                            {/* 로컬푸드 - 배송지 목록 */}
                            <Route path={'/local/addressList'} component={LocalAddressList}/>

                            {/* 로컬푸드 농가 */}
                            <Route path={'/local/farmerGoodsList/:localfoodFarmerNo'} component={FarmerGoodsList}/>


                            {/* 로컬푸드 - 판매상품 */}
                            {/*<Route exact path={'/localGoods'} component={LocalGoods}/>*/}
                            {/* 로컬푸드 - 상점정보 */}
                            {/*<Route exact path={'/localStore'} component={LocalStore}/>*/}
                            <Route path={'/localStore/:producerNo/:tabId'} component={LocalStore}/>



                            {/* 기획전 */}
                            {/*<Route exact path='/store/mdPick' component={MdPick} />*/}
                            {/* 기획전 상세 */}
                            <Route exact path='/mdPick/sub' component={MdPickSub} />



                            <Route path={'/category/:itemNo/:itemKindCode'} component={GoodsListByItemKind}/>
                            {/* 미사용 */}
                            <Route path={'/category'} component={Category}/>
                            <Route path={'/giftSet'} component={GiftSet}/>

                            {/*<Route path={'/finTech/home/:id'} component={FinTechHome}/>*/}


                            {/*<Route path={'/farmersDetailActivity'} component={FarmersDetailActivity}/>*/}
                            {/* 이력추적(상품번호로 이력추적 전체 조회) */}
                            <Route path={'/goods/goodsTraceList/:goodsNo'} component={GoodsTraceListByGoodsNo}/>
                            {/* 상품리뷰(상품번호로 리뷰 전체 조회) */}
                            <Route path={'/goods/goodsReviewList/:goodsNo'} component={goodsReviewListByGoodsNo}/>


                            {/*<Route path="/ConsumersDetailActivity" component={ConsumersDetailActivity} />*/}
                            <Route path="/consumersDetailActivity" component={CommonProfile} />
                            <Route path="/consumerBadgeList" component={ConsumerBadgeList} />

                            <Route path={'/producersGoodsList'} component={ProducersGoodsList}/>
                            <Route path={'/producersFarmDiaryList'} component={ProducersFarmDiaryList}/>
                            <Route path={'/producerFollowerList'} component={ProducerFollowerList}/>
                            <Route path={'/tokenHistory'} component={TokenHistory}/>
                            <Route path={'/donHistory'} component={DonHistory}/>
                            <Route path={'/deposit'} component={Deposit}/>
                            <Route path={'/point'} component={Point}/>
                            <Route path={'/pointInfo'} component={PointInfo}/>
                            {/*<Route path={'/pointToBly'} component={PointToBly}/>*/}
                            <Route path={'/pointToCoupon'} component={PointToCoupon}/>
                            <Route path={'/level'} component={Level}/>
                            <Route path={'/levelInfo'} component={LevelInfo}/>



                            {/*<Route path={'/zzimList'} component={ZzimList}/>*/}
                            <PrivateRoute path={'/myZzimList'} component={ZzimList}/>

                            {/* mypage 같은 경우 로그인창을 바로 띄우게 되면 로그인창을 닫아도 다시 뜨기 때문에 public 으로 처리함 */}
                            {/*<PrivateRoute exact path={'/mypage'} component={Mypage}/>*/}
                            <Route exact path={'/mypage'} component={Mypage}/>
                            <Route exact path={'/search'} component={Search} />
                            <PrivateRoute exact path={'/mypage/notificationList'} component={NotificationList}/>

                            <Route exact path={'/noticeList'} component={NoticeList} />

                            {/* :::::::::::::::::::::::::: 커뮤니티 :::::::::::::::::::::::::: */}

                            {/*<Route path={'/community'} component={Talk} />*/}

                            {/* 커뮤니티 홈 */}
                            {/*<Route exact path={'/community'} component={Community} />*/}

                            {/* 커뮤니티 이용약관 */}
                            <Route exact path={'/community/termsOfPrivacy'} component={CmTermsOfPrivacy} />

                            {/* 커뮤니티 > 상품리뷰 상세 */}
                            {/*<Route exact path={'/community/goodsReview/:orderSeq'} component={CmGoodsReviewDetail} />*/}
                            <Route exact path={'/goodsReviewDetail/:orderSeq'} component={GoodsReviewDetail} />
                            {/* 커뮤니티 > 상품리뷰 리스트 */}
                            {/*<Route exact path={'/community/goodsReviewMain'} component={CmGoodsReviewMain} />*/}
                            <Route exact path={'/realtimeGoodsReviewList'} component={RealtimeGoodsReviewList} />
                            {/* 커뮤니티 > 투표게시판 리스트 */}
                            <Route exact path={'/community/boardVoteMain'} component={BoardVoteMain} />
                            {/* 커뮤니티 > 투표게시판 상세 */}
                            <Route exact path={'/community/boardVote/:writingId'} component={BoardVoteDetail} />

                            {/* 커뮤니티 > 게시판 리스트 */}
                            <Route exact path={'/community/boardMain/:boardType'} component={Community} />

                            {/* 커뮤니티 > 게시판 글수정 */}
                            <PrivateRoute exact path={'/community/board/modify/:writingId'} component={BoardWriting} />
                            {/* 커뮤니티 > 게시판 글보기 */}
                            <Route exact path={'/community/board/:writingId'} component={BoardViewer} />



                            {/* 룰렛 */}
                            <Route exact path={'/roulette'} component={Roulette} />
                            {/* 해시태그 그룹  */}
                            <Route exact path={'/hashTagGroup'} component={HashTagGroupTemplate} />
                            {/* 쿠폰 다운로드  */}
                            <Route exact path={'/couponDownload'} component={CouponDownload} />


                            {/* :::::::::::::::::::::::::: 공동구매(계약재배) :::::::::::::::::::::::::: */}
                            {/* 공동구매 홈 */}
                            {/*<Route exact path={'/dealGoods'} component={DealGoodsHome} />*/}

                            {/*<PrivateRoute exact path={'/inputAddress'} component={InputAddress} />*/}

                            {/* :::::::::::::::::::::::::: 마이페이지 :::::::::::::::::::::::::: */}
                            <PrivateRoute exact path={'/mypage/orderList'} component={OrderList} />
                            <PrivateRoute exact path={'/mypage/orderDetail'} component={Order} />
                            <PrivateRoute exact path={'/mypage/orderCancel'} component={OrderCancel} />
                            <PrivateRoute exact path={'/mypage/infoManagementMenu'} component={InfoManagementMenu} />

                            {/* QA 리스트, 문의하기 탭이있는 페이지 */}
                            <PrivateRoute exact path={'/mypage/myQA/:tabId'} component={MyQA} />

                            <PrivateRoute exact path={'/mypage/checkCurrentValword'} component={CheckCurrentValword} />
                            <PrivateRoute exact path={'/mypage/addressManagement'} component={AddressManagement} />
                            <PrivateRoute exact path={'/mypage/addressModify'} component={AddressModify} />
                            <PrivateRoute exact path={'/mypage/hintPassPhrase'} component={HintPassPhrase} />
                            <PrivateRoute exact path={'/mypage/noticeList'} component={NoticeList} />
                            <PrivateRoute exact path={'/myRegularShopList'} component={RegularShopList} />
                            <Route exact path={'/regularShopList'} component={RegularShopList} />
                            <PrivateRoute exact path={'/mypage/couponList'} component={CouponList} userType={'consumer'} />
                            <PrivateRoute exact path={'/mypage/inviteFriend'} component={InviteFriend} userType={'consumer'} />
                            <PrivateRoute exact path={'/mypage/iosKakaoLink'} component={IosKakaoLink}/>
                            {/*<PrivateRoute exact path={'/mypage/setting'} component={Setting} />*/}
                            <Route exact path={'/mypage/setting'} component={Setting} />
                            <PrivateRoute exact path={'/mypage/boardList'} component={MyBoardList} />
                            <PrivateRoute exact path={'/mypage/replyList'} component={ReplyList} />
                            <PrivateRoute exact path={'/mypage/scrapList'} component={ScrapList} />
                            <PrivateRoute exact path={'/mypage/consumerProfile'} component={ConsumerProfile} />
                            {/** ConsumerBoardList => MyBoardList 로 교체함 (스크롤 버그 픽스된 버전으로) 이제 ConsumerBoardList 는 사용 안함 **/}
                            <Route exact path={'/consumerBoardList'} component={MyBoardList} />
                            {/*<Route exact path={'/consumerBoardList'} component={ConsumerBoardList} />*/}
                            <Route exact path={'/consumerReviewList'} component={ConsumerReviewList} />
                            <PrivateRoute exact path={'/mypage/producerProfile'} component={ProducerProfile} />
                            <PrivateRoute exact path={'/mypage/profile'} component={CommonProfile} />
                            <PrivateRoute exact path={'/modifyConsumerInfo'} component={ModifyConsumerInfo} />
                            <PrivateRoute exact path={'/modifyValword'} component={ModifyValword} />
                            <PrivateRoute exact path={'/applySecession'} component={ApplySecession} />
                            <Route exact path={'/completeSecession'} component={CompleteSecession} />
                            <PrivateRoute exact path={'/orderDetail'} component={OrderDetail} />
                            <PrivateRoute exact path={'/orderList'} component={OrderList} />
                            <PrivateRoute exact path={'/updateAddress'} component={UpdateAddress} />

                            <PrivateRoute exact path={'/goodsReviewList/:tabId'} component={GoodsReviewList} />
                            <PrivateRoute exact path={'/couponGoodsList'} component={CouponGoodsList} />
                            <PrivateRoute exact path={'/buyCouponGoods'} component={BuyCouponGoods} />

                            {/* :::::::::::::::::::::::::: producer :::::::::::::::::::::::::: */}
                            <PrivateRoute exact path={'/mypage/producer'} component={ProducerMypage} />
                            <PrivateRoute exact path={'/mypage/producer/feedlist'} component={ProducerFeedList} />
                            <PrivateRoute exact path={'/mypage/producer/reviewlist'} component={ProducerReviewList} />
                            <PrivateRoute exact path={'/mypage/producer/qnalist'} component={ProducerQnaList} />
                            <PrivateRoute exact path={'/mypage/producer/goodslist'} component={ProducerGoodsList} />
                            <PrivateRoute exact path={'/mypage/producer/cancellist'} component={ProducerCancelList} />
                            <PrivateRoute exact path={'/mypage/producer/newOrderlist/:tabId'} component={ProducerNewOrderList} />
                            <PrivateRoute exact path={'/mypage/producer/orderlist'} component={ProducerOrderList} />

                            <PrivateRoute exact path={'/mypage/producer/feed'} component={ProducerFeed} />
                            <PrivateRoute exact path={'/mypage/producer/feed/:writingId'} component={ProducerFeed} />

                            {/** 탭바가 있는 컨텐츠 END **/}
                        </TabContainer>


                        <Route component={Error}/>
                    </Switch>

                    {/*<ShopTabBar />*/}

                    <B2cBottomBar />

                    {/*/!* 로그인 모달 *!/*/}
                    {/*<LoginModal />*/}

                    {/* 커뮤니티 오른쪽 사이드바 */}
                    <CommunitySidebar />

                    {/*<FixedScrollUpButton />*/}


                    <Fixed bottom={0} width={'100%'} height={1} zIndex={99}>
                        <OptionAlertHook />
                    </Fixed>
                </div>
            </div>
        </div>
    )
}
export default ShopContainer


//
// class ShopContainer extends Component {
//     constructor(props) {
//         super(props);
//
//         this.state = {
//             mounted: false,
//         }
//     }
//
//     async componentDidMount(){
//         const { data: userType } = await getLoginUserType()
//         if(userType){
//             const user = await getLoginUser()
//
//             //쿠키 세션 동기화
//             localStorage.setItem('userType', userType);
//             localStorage.setItem('account', user.account); //geth Account
//             localStorage.setItem('email', user.email);
//
//             Webview.appLog('ShopContainer Router: setValword TEST');
//             //valword는 비어있음. localStorage.setItem('valword', ComUtil.encrypt(user.valword));
//             sessionStorage.setItem('logined', 1);
//
//         }else{ //login안된 경우.
//             //Webview.appLog('ShopContainer Router:' + localStorage.getItem('autoLogin'));
//             if (localStorage.getItem('autoLogin') != 1) { //로그아웃을 한경우만 지워주면 됨: 로그아웃하면 autoLogin이 지워짐
//                 localStorage.removeItem('userType');
//                 localStorage.removeItem('account'); //geth Account
//                 localStorage.removeItem('email');
//
//                 //Webview.appLog('ShopContainer Router: + RemoveValword');
//
//                 //localStorage.removeItem('valword');
//                 sessionStorage.removeItem('logined');
//             }
//         }
//
//         this.setState({
//             mounted: true
//         })
//     }
//
//
//     render() {
//
//         if(!this.state.mounted) return <BlocerySpinner/>
//
//         return(
//
//             <div
//                 // className={'shopMediaWrapper'}
//             >
//                 {/* RENEW 탭바 fixed 공간만큼 아래 강제 57 이상 여유 있게*/}
//                 <div style={{maxWidth: responsive.maxWidth, margin: '0 auto', paddingBottom: getValue(80)}}
//                     // className='shopMediaContainer'
//                 >
//                     <div >
//
//                         <Switch>
//
//                             {/*<Route exact path='/' render={({location}) => <Redirect to={'/home'+ ((location.search)?location.search : '')}/>}/>*/}
//
//
//                             {/** 탭바가 없는 컨텐츠 START **/}
//                             <Route exact path={'/goods'} component={Goods}/>
//                             <Route path='/login' component={Login}/>
//                             <Route path='/join' component={ConsumerJoin}/>
//                             <Route path='/joinComplete' component={JoinComplete}/>
//                             {/* 공동구매 상품구매 */}
//                             <PrivateRoute exact path={'/dealGoods/buy'} component={DealGoodsBuy} />
//                             {/* 일   반 상품구매 */}
//                             <PrivateRoute exact path={'/optionGoods/buy'} component={OptionGoodsBuy} />
//                             <PrivateRoute exact path={'/multiGiftBuy'} component={MultiGiftBuy} />
//                             <PrivateRoute exact path={'/cartBuy'} component={CartBuy} />
//                             <PrivateRoute exact path={'/buyFinish'} component={BuyFinish} />
//                             {/*<PrivateRoute exact path={'/cartList'} component={CartList}/>*/}
//                             {/* public 으로 변경(탭으로 들어와서) */}
//                             <Route exact path={'/cartList'} component={CartList}/>
//
//                             <Route path={'/kakaoCertCheck'} component={KakaoCertCheck}/>
//                             {/*<Route path={'/withdraw'} component={Withdraw}/>*/}
//                             <Route path={'/kycCertification'} component={KycCertification}/>
//                             <Route path={'/kycDocument'} component={KycDocument}/>
//                             <Route path={'/kycFinish'} component={KycFinish}/>
//
//                             {/* 커뮤니티 > 게시판 글쓰기 */}
//                             <PrivateRoute exact path={'/community/board/writing/:boardType'} component={BoardWriting} />
//                             <PrivateRoute exact path={'/goodsReview'} component={GoodsReview} />
//                             {/** 탭바가 없는 컨텐츠 END **/}
//
//
//
//
//                             {/** 탭바가 있는 컨텐츠 START **/}
//                             <TabContainer>
//
//                                 {/*<Route exact path={['/home', '/home/1']} render={() => <Redirect to={'/'} />}/>*/}
//
//                                 {/* root, local 은 탭을 상단에서 추가해 줌 */}
//                                 <Route exact path={['/', '/local', '/home', '/home/1']} component={Main}/>
//                                 {/*<Route exact path={'/local'} component={Main}/>*/}
//
//                                 <Route exact path='/store/:id' component={Store}/>
//                                 <Route exact path='/my/:id' component={My}/>
//
//
//                                 {/* public */}
//
//                                 <Route exact path='/people/:tabId' component={People}/>
//                                 <Route path='/event' component={Event}/>
//                                 <Route path='/eventAppReview' component={EventAppReview}/>
//                                 <Route path='/eventList' component={EventList}/>
//                                 {/* 기존 생산자 입점문의 => 위의 입점상담으로 변경 */}
//                                 {/*<Route path='/mypage/queInfo' component={b2cQueInfo}/>*/}
//                                 <Route path='/mypage/privateContact' component={PrivateContact}/>
//                                 <Route path='/faq' component={Faq}/>
//                                 <Route path='/mypage/useGuide' component={UseGuide}/>
//                                 <Route path='/mypage/termsOfUse' component={TermsOfUse}/>
//                                 <Route path='/mypage/privacyPolicy' component={PrivacyPolicy}/>
//
//                                 <Route path='/about/ssugssug' component={AboutSsugSsug}/>
//
//
//                                 {/*<Route exact path='/' render={() => <Redirect to={'/home'}/>} />*/}
//
//
//                                 <Route exact path={'/menu'} component={Menu}/>
//                                 {/*<Route exact path={'/home'} component={Home}/>*/}
//                                 {/*<Route path={'/home/:id'} component={Home}/>*/}
//                                 {/*<Route exact path={'/store'} component={Store}/>*/}
//                                 {/*<Route path={'/store/:id'} component={Store}/>*/}
//                                 {/*<Route exact path={'/home'} component={Store}/>*/}
//
//                                 {/* 전체상품 */}
//                                 <Route path={'/goodsList'} component={GoodsList}/>
//                                 {/* 로컬푸드 배송처리 */}
//                                 <Route exact path={'/local/delivery/:orderSubGroupNo'} component={Delivery} />
//
//                                 <Route exact path={'/ok/:localFarmerNo'} component={FarmerSum} />
//
//                                 {/* 로컬푸드 */}
//
//                                 <Route exact path={'/localFaq'} component={LocalFaq}/>
//                                 {/* 로컬푸드 - 배송지 목록 */}
//                                 <Route path={'/local/addressList'} component={LocalAddressList}/>
//
//                                 {/* 로컬푸드 농가 */}
//                                 <Route path={'/local/farmerGoodsList/:localfoodFarmerNo'} component={FarmerGoodsList}/>
//
//
//                                 {/* 로컬푸드 - 판매상품 */}
//                                 {/*<Route exact path={'/localGoods'} component={LocalGoods}/>*/}
//                                 {/* 로컬푸드 - 상점정보 */}
//                                 {/*<Route exact path={'/localStore'} component={LocalStore}/>*/}
//                                 <Route path={'/localStore/:producerNo/:tabId'} component={LocalStore}/>
//
//
//
//                                 {/* 기획전 */}
//                                 {/*<Route exact path='/store/mdPick' component={MdPick} />*/}
//                                 {/* 기획전 상세 */}
//                                 <Route exact path='/mdPick/sub' component={MdPickSub} />
//
//
//
//                                 <Route path={'/category/:itemNo/:itemKindCode'} component={GoodsListByItemKind}/>
//                                 {/* 미사용 */}
//                                 <Route path={'/category'} component={Category}/>
//                                 <Route path={'/giftSet'} component={GiftSet}/>
//
//                                 {/*<Route path={'/finTech/home/:id'} component={FinTechHome}/>*/}
//
//
//                                 {/*<Route path={'/farmersDetailActivity'} component={FarmersDetailActivity}/>*/}
//                                 {/* 이력추적(상품번호로 이력추적 전체 조회) */}
//                                 <Route path={'/goods/goodsTraceList/:goodsNo'} component={GoodsTraceListByGoodsNo}/>
//                                 {/* 상품리뷰(상품번호로 리뷰 전체 조회) */}
//                                 <Route path={'/goods/goodsReviewList/:goodsNo'} component={goodsReviewListByGoodsNo}/>
//
//
//                                 {/*<Route path="/ConsumersDetailActivity" component={ConsumersDetailActivity} />*/}
//                                 <Route path="/consumersDetailActivity" component={CommonProfile} />
//                                 <Route path="/consumerBadgeList" component={ConsumerBadgeList} />
//
//                                 <Route path={'/producersGoodsList'} component={ProducersGoodsList}/>
//                                 <Route path={'/producersFarmDiaryList'} component={ProducersFarmDiaryList}/>
//                                 <Route path={'/producerFollowerList'} component={ProducerFollowerList}/>
//                                 <Route path={'/tokenHistory'} component={TokenHistory}/>
//                                 <Route path={'/donHistory'} component={DonHistory}/>
//                                 <Route path={'/deposit'} component={Deposit}/>
//                                 <Route path={'/point'} component={Point}/>
//                                 <Route path={'/pointInfo'} component={PointInfo}/>
//                                 {/*<Route path={'/pointToBly'} component={PointToBly}/>*/}
//                                 <Route path={'/pointToCoupon'} component={PointToCoupon}/>
//                                 <Route path={'/level'} component={Level}/>
//                                 <Route path={'/levelInfo'} component={LevelInfo}/>
//
//
//
//                                 {/*<Route path={'/zzimList'} component={ZzimList}/>*/}
//                                 <PrivateRoute path={'/myZzimList'} component={ZzimList}/>
//
//                                 {/* mypage 같은 경우 로그인창을 바로 띄우게 되면 로그인창을 닫아도 다시 뜨기 때문에 public 으로 처리함 */}
//                                 {/*<PrivateRoute exact path={'/mypage'} component={Mypage}/>*/}
//                                 <Route exact path={'/mypage'} component={Mypage}/>
//                                 <Route exact path={'/search'} component={Search} />
//                                 <PrivateRoute exact path={'/mypage/notificationList'} component={NotificationList}/>
//
//                                 <Route exact path={'/noticeList'} component={NoticeList} />
//
//                                 {/* :::::::::::::::::::::::::: 커뮤니티 :::::::::::::::::::::::::: */}
//
//                                 {/*<Route path={'/community'} component={Talk} />*/}
//
//                                 {/* 커뮤니티 홈 */}
//                                 {/*<Route exact path={'/community'} component={Community} />*/}
//
//                                 {/* 커뮤니티 이용약관 */}
//                                 <Route exact path={'/community/termsOfPrivacy'} component={CmTermsOfPrivacy} />
//
//                                 {/* 커뮤니티 > 상품리뷰 상세 */}
//                                 {/*<Route exact path={'/community/goodsReview/:orderSeq'} component={CmGoodsReviewDetail} />*/}
//                                 <Route exact path={'/goodsReviewDetail/:orderSeq'} component={GoodsReviewDetail} />
//                                 {/* 커뮤니티 > 상품리뷰 리스트 */}
//                                 {/*<Route exact path={'/community/goodsReviewMain'} component={CmGoodsReviewMain} />*/}
//                                 <Route exact path={'/realtimeGoodsReviewList'} component={RealtimeGoodsReviewList} />
//                                 {/* 커뮤니티 > 투표게시판 리스트 */}
//                                 <Route exact path={'/community/boardVoteMain'} component={BoardVoteMain} />
//                                 {/* 커뮤니티 > 투표게시판 상세 */}
//                                 <Route exact path={'/community/boardVote/:writingId'} component={BoardVoteDetail} />
//
//                                 {/* 커뮤니티 > 게시판 리스트 */}
//                                 <Route exact path={'/community/boardMain/:boardType'} component={Community} />
//
//                                 {/* 커뮤니티 > 게시판 글수정 */}
//                                 <PrivateRoute exact path={'/community/board/modify/:writingId'} component={BoardWriting} />
//                                 {/* 커뮤니티 > 게시판 글보기 */}
//                                 <Route exact path={'/community/board/:writingId'} component={BoardViewer} />
//
//
//
//                                 {/* 룰렛 */}
//                                 <Route exact path={'/roulette'} component={Roulette} />
//                                 {/* 해시태그 그룹  */}
//                                 <Route exact path={'/hashTagGroup'} component={HashTagGroupTemplate} />
//                                 {/* 쿠폰 다운로드  */}
//                                 <Route exact path={'/couponDownload'} component={CouponDownload} />
//
//
//                                 {/* :::::::::::::::::::::::::: 공동구매(계약재배) :::::::::::::::::::::::::: */}
//                                 {/* 공동구매 홈 */}
//                                 {/*<Route exact path={'/dealGoods'} component={DealGoodsHome} />*/}
//
//                                 {/*<PrivateRoute exact path={'/inputAddress'} component={InputAddress} />*/}
//
//                                 {/* :::::::::::::::::::::::::: 마이페이지 :::::::::::::::::::::::::: */}
//                                 <PrivateRoute exact path={'/mypage/orderList'} component={OrderList} />
//                                 <PrivateRoute exact path={'/mypage/orderDetail'} component={Order} />
//                                 <PrivateRoute exact path={'/mypage/orderCancel'} component={OrderCancel} />
//                                 <PrivateRoute exact path={'/mypage/infoManagementMenu'} component={InfoManagementMenu} />
//
//                                 {/* QA 리스트, 문의하기 탭이있는 페이지 */}
//                                 <PrivateRoute exact path={'/mypage/myQA/:tabId'} component={MyQA} />
//                                 {/* QA 등록 */}
//                                 <PrivateRoute exact path={'/mypage/myQAReg'} component={MyQAReg} />
//
//                                 <PrivateRoute exact path={'/mypage/checkCurrentValword'} component={CheckCurrentValword} />
//                                 <PrivateRoute exact path={'/mypage/addressManagement'} component={AddressManagement} />
//                                 <PrivateRoute exact path={'/mypage/addressModify'} component={AddressModify} />
//                                 <PrivateRoute exact path={'/mypage/hintPassPhrase'} component={HintPassPhrase} />
//                                 <PrivateRoute exact path={'/mypage/noticeList'} component={NoticeList} />
//                                 <PrivateRoute exact path={'/myRegularShopList'} component={RegularShopList} />
//                                 <Route exact path={'/regularShopList'} component={RegularShopList} />
//                                 <PrivateRoute exact path={'/mypage/couponList'} component={CouponList} userType={'consumer'} />
//                                 <PrivateRoute exact path={'/mypage/inviteFriend'} component={InviteFriend} userType={'consumer'} />
//                                 <PrivateRoute exact path={'/mypage/iosKakaoLink'} component={IosKakaoLink}/>
//                                 {/*<PrivateRoute exact path={'/mypage/setting'} component={Setting} />*/}
//                                 <Route exact path={'/mypage/setting'} component={Setting} />
//                                 <PrivateRoute exact path={'/mypage/boardList'} component={MyBoardList} />
//                                 <PrivateRoute exact path={'/mypage/replyList'} component={ReplyList} />
//                                 <PrivateRoute exact path={'/mypage/scrapList'} component={ScrapList} />
//                                 <PrivateRoute exact path={'/mypage/consumerProfile'} component={ConsumerProfile} />
//                                 {/** ConsumerBoardList => MyBoardList 로 교체함 (스크롤 버그 픽스된 버전으로) 이제 ConsumerBoardList 는 사용 안함 **/}
//                                 <Route exact path={'/consumerBoardList'} component={MyBoardList} />
//                                 {/*<Route exact path={'/consumerBoardList'} component={ConsumerBoardList} />*/}
//                                 <Route exact path={'/consumerReviewList'} component={ConsumerReviewList} />
//                                 <PrivateRoute exact path={'/mypage/producerProfile'} component={ProducerProfile} />
//                                 <PrivateRoute exact path={'/mypage/profile'} component={CommonProfile} />
//                                 <PrivateRoute exact path={'/modifyConsumerInfo'} component={ModifyConsumerInfo} />
//                                 <PrivateRoute exact path={'/modifyValword'} component={ModifyValword} />
//                                 <PrivateRoute exact path={'/applySecession'} component={ApplySecession} />
//                                 <Route exact path={'/completeSecession'} component={CompleteSecession} />
//                                 <PrivateRoute exact path={'/orderDetail'} component={OrderDetail} />
//                                 <PrivateRoute exact path={'/orderList'} component={OrderList} />
//                                 <PrivateRoute exact path={'/updateAddress'} component={UpdateAddress} />
//
//                                 <PrivateRoute exact path={'/goodsReviewList/:tabId'} component={GoodsReviewList} />
//                                 <PrivateRoute exact path={'/couponGoodsList'} component={CouponGoodsList} />
//                                 <PrivateRoute exact path={'/buyCouponGoods'} component={BuyCouponGoods} />
//
//                                 {/* :::::::::::::::::::::::::: producer :::::::::::::::::::::::::: */}
//                                 <PrivateRoute exact path={'/mypage/producer'} component={ProducerMypage} />
//                                 <PrivateRoute exact path={'/mypage/producer/feedlist'} component={ProducerFeedList} />
//                                 <PrivateRoute exact path={'/mypage/producer/reviewlist'} component={ProducerReviewList} />
//                                 <PrivateRoute exact path={'/mypage/producer/qnalist'} component={ProducerQnaList} />
//                                 <PrivateRoute exact path={'/mypage/producer/goodslist'} component={ProducerGoodsList} />
//                                 <PrivateRoute exact path={'/mypage/producer/cancellist'} component={ProducerCancelList} />
//                                 <PrivateRoute exact path={'/mypage/producer/orderlist'} component={ProducerOrderList} />
//
//                                 <PrivateRoute exact path={'/mypage/producer/feed'} component={ProducerFeed} />
//                                 <PrivateRoute exact path={'/mypage/producer/feed/:writingId'} component={ProducerFeed} />
//
//                                 {/** 탭바가 있는 컨텐츠 END **/}
//                             </TabContainer>
//
//
//                             <Route component={Error}/>
//                         </Switch>
//
//                         {/*<ShopTabBar />*/}
//
//                         <B2cBottomBar />
//
//                         {/*/!* 로그인 모달 *!/*/}
//                         {/*<LoginModal />*/}
//
//                         {/* 커뮤니티 오른쪽 사이드바 */}
//                         <CommunitySidebar />
//
//                         {/*<FixedScrollUpButton />*/}
//
//
//                     </div>
//                 </div>
//             </div>
//
//         )
//     }
// }
// export default ShopContainer
