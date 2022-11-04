import React, {Component, Fragment, useEffect, useState} from 'react';

import {
    getConsumer,
    countRegularShop,
    countGoodsReview,
    getOrderDetailCountForMypage,
    getUsableCouponList,
    getRecommenderInfo,
    getOutboundComplete,
    getAbuser, getProfileByConsumerNo, getCountUsableCouponList, getCountOutboundComplete
} from '~/lib/shopApi'
import { autoLoginCheckAndTryAsync } from '~/lib/loginApi'
import { scOntGetBalanceOfBlct } from "~/lib/smartcontractApi";
import {getDonTotal, isAbuser} from '~/lib/donAirDropApi'

import ComUtil from '~/util/ComUtil'
import {Bold, BottomDotTab} from "~/styledComponents/ShopBlyLayouts";

import classNames from 'classnames' //여러개의 css 를 bind 하여 사용할 수 있게함

import { toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import { Webview } from '~/lib/webviewApi'
import Css from './MyPage.module.scss'
import { LoginLinkCard, ModalPopup } from '~/components/common'
import { B2cHeader } from '~/components/common/headers'
import {BodyFullHeight} from '~/components/common/layouts'
import { getCart } from '~/lib/cartApi'
import { getLackNextLevelScore } from '~/lib/pointApi'

import {Redirect, withRouter} from 'react-router-dom'

//리뉴얼 아이콘
import { FaUserPlus } from 'react-icons/fa'
import icSetting from '~/images/icons/renewal/setting.png'
import icBackButton from '~/images/icons/renewal/back.png'
import imgNoProfile from '~/images/icons/renewal/mypage/no_profile.png'

import {BlocerySymbolGreen} from '~/components/common/logo'
import styled from 'styled-components'
import TG from '~/components/common/tg/TG'

import {
    Div,
    Span,
    Link as StyledLink,
    Flex,
    Button,
    Hr,
    Right,
    Img,
    GridColumns,
    Space, Divider
} from '~/styledComponents/shared'
import {ImProfile} from 'react-icons/im'
import SecureApi from "~/lib/secureApi";
import icPencil from "~/images/icons/renewal/mypage/pencil.png";
import BackNavigation from "~/components/common/navs/BackNavigation";

import {ConsumerMypage} from '../mypage'
import {getProducerMenuSummary, getProducerTodayOrderCount} from "~/lib/producerApi";
import ProfileBig from "~/components/common/cards/ProfileBig";
import NotificationButton from "~/components/common/buttons/NotificationLinkButton";
import CartLinkButton from "~/components/common/buttons/CartLinkButton";
import useLogin from "~/hooks/useLogin";
import ArrowList from "~/components/common/lists/ArrowList";
import {useRecoilState} from "recoil";
import {consumerState} from "~/recoilState";
import {Spinner} from "reactstrap";
import {AiOutlineDoubleRight} from "react-icons/ai";
import {getValue} from "~/styledComponents/Util";
import ZzimLinkButton from "~/components/common/buttons/ZzimLinkButton";
import StarredProducerGoodsLinkButton from "~/components/common/buttons/StarredProducerGoodsLinkButton";

//pivot브랜치 오픈시 don 소유자들(abuser제외 63명) +  31(땡순이),229(김용229)=stage test용도
const donOwners = [31,229,17,55,63,853,930,969,1031,2656,3788,5453,11272,13386,16184,17568,21930,32787,34219,34233,39922,39928,39931,39932,39933,39942,39943,39949,419,1044,3633,3661,13424,39858,39903,39975,718,40002,40008,40023,40024,2338,2907,33734,40047,40052,40056,40059,40061,40066,40067,40074,7396,39866,40073,40075,40135,40150,166,3720,3861,22205,40032,40115,39383];

const Link = styled(StyledLink)`
    display: block;
`;

const RightContent = ({history}) => {

    return(
        <GridColumns colGap={0} rowGap={0} repeat={2} pr={10}
                     height={'100%'}
                     custom={`
        & > div {
            width: ${getValue(50)};
            height: 100%;
        }
       `}>
            {/*<SearchButton />*/}
            <NotificationButton/>
            {/* 찜하기 상품 링크 */}
            <ZzimLinkButton />
            {/* 단골상품 링크 */}
            {/*<StarredProducerGoodsLinkButton />*/}
        </GridColumns>
    )
    // return(
    //     <NotificationButton width={50} height={'100%'} mr={10}/>
    //
    // )
}

const NoLoginUser = () => {
    const {isLoggedIn, isServerLoggedIn} = useLogin()

    const onLoginClick = async () => {
        let loginUser = await isServerLoggedIn()
        if (!loginUser ) { //|| !isLoggedIn() ) { //백 || front
            //Webview.openPopup('/login')
        }
    }

    return(
        <Fragment>
            <BackNavigation
                hideLine={true}
                rightContent={<RightContent/>}
            >마이페이지
            </BackNavigation>

            <Div bold p={16} fontSize={17} onClick={onLoginClick} cursor>
                <Span fg={'green'}>로그인</Span>을 해주세요
            </Div>

            <Divider />

            <ArrowList data={[
                {text: <>등급 및 혜택안내 </>, to: `/levelInfo`},
                {text: <>포인트안내 </>, to: `/pointInfo`},
                {text: <>공지사항 </>, to: `/noticeList`},
                {text: <>이용안내 </>, to: `/mypage/useGuide`},
                {text: <>FAQ </>, to: `/faq`},
                {text: <>서비스 이용약관 </>, to: `/mypage/termsOfUse`},
                {text: <>개인정보 보호 정책 </>, to: `/mypage/privacyPolicy`},
            ]} />

            <Divider />
        </Fragment>

        // <BodyFullHeight nav homeTabbar bottomTabbar>
        //     <LoginLinkCard regularList icon description={'로그인 하여 샵블리의 다양한 혜택을 경험해보세요!'} onClick={onLoginClick} />
        // </BodyFullHeight>
    )
}

class Mypage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tokenBalance: '',
            loginUser: undefined,  //로그인 판별여부가 결정날때까지 render방지 -> (로그인 된경우) 로그인 버튼 안그리기.
            profile: null,
            regularShopCount:'',
            goodsReviewCount:'',
            nextLevelScore: 0,

            //202003추가.
            cartLength: '',
            paymentDoneCount: '',
            inDeliveryCount: '',
            consumerOkCount: '',
            // newNotificationBadge: false,
            newNoticeRegBadge: false,
            newCouponBadge: false,
            modalOpen: false,
            loading: true,
            couponCount: 0,
            recommenderInfo: {},

            donnieBalance: '',
            // abuser: null,
            // abuserInfoModal: false,
            profileImages: [],

            //생산소비자 summary:2022.06 3개 미사용.
            // totalFeed: 0,
            // totalFollower: 0,
            // totalGoods: 0,
            producerTodayOrderCount:0, //2022.06 추가
        }
    }

    // 화면 로딩시 로그인한 consumer정보 호출
    async componentDidMount() {

        //////////// consumer push수신시 바로이동용으로 추가: history때문에 항상 mypage거쳐서 가야함.
        //USAGE:  mypage?moveTo=orderList

        console.log({props: this.props})

        const params = new URLSearchParams(this.props.location.search)
        let moveTo = params.get('moveTo');
        if (moveTo) {
            this.props.history.push('/mypage'); //back을 대비해서 mypage로 돌아오도록 넣어놔야 함...
            this.props.history.push('/mypage/' + moveTo);
        }
        const {loginUser} = await this.refreshCallback(); //로그인 정보 가져오기
        if(loginUser) {
            this.setState({ loginUser: loginUser })
            this.getConsumerLogin()
        }


        // if(loginUser && loginUser.producerFlag) {
        //     this.searchPConsumerSummary();
        // }
        //
        // const {data} = await getProfileByConsumerNo(loginUser.consumerNo)

        // //속도가 늦어서 이동 예정(?)
        // const {data: nextLevelScore}  = await getLackNextLevelScore();
        //
        // this.setState({
        //     loginUser: loginUser,
        //     profileImages: (loginUser) ? loginUser.profileImages : [],
        //     profile: data,
        //     nextLevelScore: nextLevelScore
        // }, () => {
        //
        //     if (loginUser && loginUser.account)
        //         this.searchAll({
        //             consumerNo: loginUser.consumerNo,
        //             account: loginUser.account
        //         })
        // })
    }

    getConsumerLogin = async () => {


        if(this.state.loginUser && this.state.loginUser.producerFlag) {
            this.searchPConsumerSummary();
        }

        const {data} = await getProfileByConsumerNo(this.state.loginUser.consumerNo)

        //속도가 늦어서 이동 예정(?)
        const {data: nextLevelScore}  = await getLackNextLevelScore();
        this.setState({
            //loginUser: loginUser,
            profileImages: (this.state.loginUser) ? this.state.loginUser.profileImages : [],
            profile: data,
            nextLevelScore: nextLevelScore
        }, () => {
            if (this.state.loginUser && this.state.loginUser.account)
                this.searchAll({
                    consumerNo: this.state.loginUser.consumerNo,
                    account: this.state.loginUser.account
                })
        })
    }

    searchPConsumerSummary = async () => {

        const {data} = await getProducerTodayOrderCount();
        this.setState({
            producerTodayOrderCount:data,
        })

        //미사용: 2022.06
        // const {data} = await getProducerMenuSummary();    //생산소비자 수치 조회
        //
        // this.setState({
        //     totalFeed: data.totalFeed,
        //     totalFollower: data.totalFollower,
        //     totalGoods: data.totalGoods
        // })
        console.log(data)
    }

    searchAll = async ({account}) => {
        const result = await Promise.all([
            countGoodsReview().then((res)=>res.data),
            scOntGetBalanceOfBlct(account).then((res)=>res.data),
            getCountUsableCouponList().then((res)=>res.data),
            getDonTotal().then((res)=>res.data),
            // countRegularShop().then((res)=>res.data),
            // getCart().then((res)=>res.data),
            // getOrderDetailCountForMypage().then((res)=>res.data),
            // getRecommenderInfo().then((res)=>res.data),
            // isAbuser().then((res)=>res.data),
            // getCountOutboundComplete().then((res)=>res.data),
        ]);


        let goodsReviewCount = result[0];
        let blyBalance = result[1];
        let couponCount = result[2];
        let donTotal = result[3];
        // let regularShopCount = result[0];
        // let cartData = result[3];
        // let detailCount = result[4];
        // let recommenderInfo = result[6];
        // let abuser = result[8];
        // let outboundComplete = result[9];

        //console.log('blyBalance : ', blyBalance);
        //console.log('getCart : ', cartData);
        //console.log('detailCount : ', detailCount);

        this.setState({
            tokenBalance: blyBalance,
            goodsReviewCount: goodsReviewCount,
            couponCount: couponCount,
            donnieBalance: donTotal,
            // regularShopCount: regularShopCount,
            // recommenderInfo: recommenderInfo,

            // abuser: abuser,
            // outboundComplete: outboundComplete,

            //202003추가.
            // cartLength : cartData.length,
            // paymentDoneCount: detailCount.paymentDoneCount,
            // inDeliveryCount: detailCount.inDeliveryCount,
            // consumerOkCount: detailCount.consumerOkCount,
            // newNoticeRegBadge: detailCount.newNoticeRegBadge,
            // newNotificationBadge: detailCount.newNotificationBadge,
            // newCouponBadge: detailCount.newCouponBadge,

            loading: false
        });
    }


    //react-toastify usage: this.notify('메세지', toast.success/warn/error);
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }

    refreshCallback = async () => {
        try{
            await autoLoginCheckAndTryAsync(); //push수신시 자동로그인 test : 20200825
            const {data} = await getConsumer();

            return {
                loginUser: (data) ? data : null,
            }
        }catch (err) {
            console.error(err.message)

            return {
                loginUser: undefined
            }
        }
    }

    clickInfoModify = () => {
        const loginUser = Object.assign({}, this.state.loginUser)
        this.props.history.push('/mypage/infoManagementMenu');
    }

    //BLY 시세 모달
    onHelpClick = async () => {
        this.setState({
            modalOpen: true
        })
    }

    onClose = () => {
        this.setState({
            modalOpen: false
        })
    }

    // onAbuserModalToggle = () => {
    //     this.setState({
    //         abuserInfoModal: !this.state.abuserInfoModal
    //     })
    // }

    // onBackClick = () => {
    //     if(this.props.history.action === 'PUSH') this.props.history.goBack(); //팝업 안에서 이동.
    //     else window.location = '/'    //페이지가 window.location 을 통해 들어왔을 경우 history의 goBack() 할 수가 없어 메인 페이지로 이동하게 함
    // }

    onMoveToPage = (pathname) => {
        this.props.history.push(pathname);
    }

    render() {
        if (!this.state.loginUser)
            return null

        return(
            <Fragment>
                <BackNavigation
                    hideLine={true}
                    rightContent={<RightContent/>}
                    hideHomeButton={true}
                >마이페이지
                </BackNavigation>

                {/*{*/}
                {/*    !this.state.loginUser ?*/}
                {/*        <NoLoginUser />*/}
                {/*        :*/}
                <Div>
                    {/*{*/}
                    {/*    this.state.loginUser &&*/}
                    {/*    <Flex justifyContent={'center'} alignItems={'center'}>*/}
                    {/*        <BottomDotTab active={true} px={10}>쇼핑정보</BottomDotTab>*/}
                    {/*        <BottomDotTab px={10}*/}
                    {/*                      onClick={this.onMoveToPage.bind(this, `/consumersDetailActivity?consumerNo=${this.state.loginUser.consumerNo}`)}>프로필</BottomDotTab>*/}
                    {/*        {*/}
                    {/*            ComUtil.isProducer(this.state.loginUser.consumerNo) &&*/}
                    {/*            <BottomDotTab px={10} onClick={this.onMoveToPage.bind(this, `/mypage/producer`)}>생산자메뉴</BottomDotTab>*/}
                    {/*        }*/}
                    {/*    </Flex>*/}
                    {/*}*/}

                    {
                        this.state.loginUser && (
                            <Flex justifyContent={'center'}  bg={'veryLight'} p={16} mb={10}>
                                <Space spaceGap={17} fg={'secondary'} lineHeight={'1'}>
                                    <Div cursor={1} bold fg={'black'}>쇼핑정보</Div>
                                    <span>|</span>
                                    <Div cursor={1} bold onClick={this.onMoveToPage.bind(this, `/consumersDetailActivity?consumerNo=${this.state.loginUser.consumerNo}`)}>프로필</Div>
                                    {
                                        ComUtil.isProducer(this.state.loginUser.consumerNo) && (
                                            <>
                                                <span>|</span>
                                                <Div cursor={1} bold onClick={this.onMoveToPage.bind(this, `/mypage/producer`)}>생산자메뉴</Div>
                                            </>
                                        )

                                    }


                                </Space>
                            </Flex>
                        )
                    }
                    {(this.state.loginUser && this.state.loginUser.producerFlag) && (
                            (this.state.loginUser.consumerNo) === 900000157?  //157하드코딩(로컬푸드 생산자)
                                <Link to={'/mypage/producer/newOrderlist/1'} ml={16} mt={20} textDecoration={'underline'}>
                                <b>생산자 주문목록NEW (오늘주문: {this.state.producerTodayOrderCount}건)</b>
                                </Link>
                                :
                                <Link to={'/mypage/producer/orderList'} ml={16} mt={20} textDecoration={'underline'}>
                                <b>생산자 주문목록 (오늘주문: {this.state.producerTodayOrderCount}건)</b>
                                </Link>
                    )}

                    {
                        this.state.profile &&
                        <Div px={10} pt={10} mb={10}>
                            <ProfileBig showArrowForward {...this.state.profile}
                                        hideGrade={ComUtil.isProducer(this.state.loginUser.consumerNo)}
                                        onClick={this.onMoveToPage.bind(this, '/mypage/infoManagementMenu')}/>
                        </Div>
                    }

                    <Div px={15}>
                        <Flex cursor justifyContent={'center'} alingItems={'center'}>
                            <Div bg={'background'} rounded={14.8} py={5} px={15} textAlign={'center'} bold>
                                {this.state.nextLevelScore <= -1 ? (
                                        this.state.nextLevelScore === -1 ?
                                            '샵블리 최고등급! 축하합니다!' : '월요일 등급 UP.'
                                    ) :
                                    <>다음 등급 <Span fg={'green'}>{ComUtil.addCommas(this.state.nextLevelScore)}</Span>점 남음.</>
                                }
                            </Div>
                            <Right py={5} px={10} rounded={14.8} fontSize={12} fg={'green'} bc={'green'} textAlign={'center'}
                                   alignItems={'center'} onClick={this.onMoveToPage.bind(this, '/level')}>등급/혜택</Right>
                        </Flex>
                        <Flex mt={15} mb={20} py={17} textAlign={'center'} justifyContent={'space-evenly'} rounded={5} doActive
                              bc={'green'}>
                            <Div textAlign={'center'}>
                                <Link to={`/point`}>
                                    <Div bold fontSize={14}>포인트</Div>
                                    <Bold bold fontSize={10} fg={'secondary'}>
                                        <Span fg={'green'} bold fontSize={13}>{ComUtil.addCommas(this.state.loginUser.point)}</Span>
                                    </Bold>
                                </Link>
                            </Div>
                            {this.state.loginUser && !this.state.loginUser.noBlockchain &&
                            <Div textAlign={'center'}>
                                <Link to={`/tokenHistory`}>
                                    <Div bold fontSize={14}>적립금(BLY)</Div>
                                    <Bold bold fontSize={13} fg={'secondary'}>
                                        {(this.state.loading || !this.state.loginUser) ? '-' :
                                            <Span fg={'green'} bold
                                                  fontSize={13}>{ComUtil.addCommas(ComUtil.roundDown(this.state.tokenBalance, 2))}</Span>}
                                    </Bold>
                                </Link>
                            </Div>
                            }
                            {this.state.loginUser && donOwners.includes(this.state.loginUser.consumerNo) && //this.state.donnieBalance > 0 && //마지막 donnieBalance조건은 코멘트 해도되고 풀어도 됨. (코멘트 풀면 변환 후 이력조회 가능)
                            <Div textAlign={'center'}>
                                <Link to={`/donHistory`}>
                                    <Div bold fontSize={14}>DON</Div>
                                    <Bold bold fontSize={13} fg={'secondary'}>
                                        <Span fg={'green'} bold
                                              fontSize={13}>{ComUtil.addCommas(ComUtil.roundDown(this.state.donnieBalance, 2))}</Span>
                                    </Bold>
                                </Link>
                            </Div>
                            }
                            <Div textAlign={'center'}>
                                <Link to={'/mypage/couponList'}>
                                    <Div bold fontSize={13}>쿠폰</Div>
                                    <Bold bold fontSize={10} fg={'secondary'}>
                                        <Span fg={'green'} bold fontSize={13}>{ComUtil.addCommas(this.state.couponCount)}</Span>
                                    </Bold>
                                </Link>
                            </Div>
                            <Div textAlign={'center'}>
                                <Link to={'/goodsReviewList/1'}>
                                    <Div bold fontSize={13}>리뷰작성</Div>
                                    <Bold bold fontSize={10} fg={'secondary'}>
                                        <Span fg={'green'} bold fontSize={13}>{ComUtil.addCommas(this.state.goodsReviewCount)}</Span>
                                    </Bold>
                                </Link>
                            </Div>
                        </Flex>
                    </Div>

                    <Divider/>

                    <ConsumerMypage loginUser={this.state.loginUser}/>
                </Div>
                {/*}*/}


                {/*{*/}
                {/*    this.state.loginUser &&*/}
                {/*        <Flex justifyContent={'center'} alignItems={'center'}>*/}
                {/*            <BottomDotTab active={true} px={10}>쇼핑정보</BottomDotTab>*/}
                {/*            <BottomDotTab px={10}*/}
                {/*                          onClick={this.onMoveToPage.bind(this, `/consumersDetailActivity?consumerNo=${this.state.loginUser.consumerNo}`)}>프로필</BottomDotTab>*/}
                {/*            {*/}
                {/*                ComUtil.isProducer(this.state.loginUser.consumerNo) && <BottomDotTab px={10}*/}
                {/*                                                                                     onClick={this.onMoveToPage.bind(this, `/producer/mypage`)}>생산자메뉴</BottomDotTab>*/}
                {/*            }*/}
                {/*        </Flex>*/}
                {/*}*/}

                {/*<Hr/>*/}

                {/*{*/}
                {/*    this.state.loginUser &&*/}
                {/*    <Div px={10} pt={10} mb={10}>*/}
                {/*        <ProfileBig showArrowForward {...this.state.profile}*/}
                {/*                    hideGrade={ComUtil.isProducer(this.state.loginUser.consumerNo)}*/}
                {/*                    onClick={this.state.loginUser ? this.onMoveToPage.bind(this, '/mypage/infoManagementMenu') : this.onMoveToPage.bind(this, '/login')}/>*/}
                {/*    </Div>*/}
                {/*}*/}

                {/*<Div px={15}>*/}
                {/*    <Flex cursor justifyContent={'center'} alingItems={'center'}>*/}
                {/*        {*/}
                {/*            !this.state.loginUser ?*/}
                {/*                <Div textAlign={'center'}>로그인하면 회원등급 혜택을 받으실 수 있어요!</Div>*/}
                {/*                :*/}
                {/*                <Div bg={'background'} rounded={14.8} py={5} px={20} textAlign={'center'} bold>*/}
                {/*                    {this.state.nextLevelScore < 0 ? (*/}
                {/*                            '월요일에 등급이 업그레이드 됩니다.'*/}
                {/*                        ) :*/}
                {/*                        <>다음 등급까지 <Span fg={'green'}>{ComUtil.addCommas(this.state.nextLevelScore)}</Span>점*/}
                {/*                            남았습니다</>*/}
                {/*                    }*/}
                {/*                </Div>*/}
                {/*        }*/}
                {/*        <Right py={5} px={10} rounded={14.8} fontSize={12} fg={'green'} bc={'green'} textAlign={'center'}*/}
                {/*               alignItems={'center'} onClick={this.onMoveToPage.bind(this, '/level')}>등급/혜택</Right>*/}
                {/*    </Flex>*/}
                {/*    <Flex mt={15} mb={20} py={17} textAlign={'center'} justifyContent={'space-evenly'} rounded={5} doActive*/}
                {/*          bc={'green'}>*/}
                {/*        <Div textAlign={'center'}>*/}
                {/*            <Link to={`/point`}>*/}
                {/*                <Div bold fontSize={14}>포인트</Div>*/}
                {/*                <Bold bold fontSize={10} fg={'secondary'}>*/}
                {/*                    {!this.state.loginUser ? '-' : <Span fg={'green'} bold*/}
                {/*                                                         fontSize={13}>{ComUtil.addCommas(this.state.loginUser.point)}</Span>}*/}
                {/*                </Bold>*/}
                {/*            </Link>*/}
                {/*        </Div>*/}
                {/*        {this.state.loginUser && !this.state.loginUser.noBlockchain &&*/}
                {/*        <Div textAlign={'center'}>*/}
                {/*            <Link to={`/tokenHistory`}>*/}
                {/*                <Div bold fontSize={14}>적립금(BLY)</Div>*/}
                {/*                <Bold bold fontSize={13} fg={'secondary'}>*/}
                {/*                    {(this.state.loading || !this.state.loginUser) ? '-' :*/}
                {/*                        <Span fg={'green'} bold*/}
                {/*                              fontSize={13}>{ComUtil.addCommas(ComUtil.roundDown(this.state.tokenBalance, 2))}</Span>}*/}
                {/*                </Bold>*/}
                {/*            </Link>*/}
                {/*        </Div>*/}
                {/*        }*/}
                {/*        {this.state.loginUser && donOwners.includes(this.state.loginUser.consumerNo) && //this.state.donnieBalance > 0 && //마지막 donnieBalance조건은 코멘트 해도되고 풀어도 됨. (코멘트 풀면 변환 후 이력조회 가능)*/}
                {/*        <Div textAlign={'center'}>*/}
                {/*            <Link to={`/donHistory`}>*/}
                {/*                <Div bold fontSize={14}>DON</Div>*/}
                {/*                <Bold bold fontSize={13} fg={'secondary'}>*/}
                {/*                    <Span fg={'green'} bold*/}
                {/*                          fontSize={13}>{ComUtil.addCommas(ComUtil.roundDown(this.state.donnieBalance, 2))}</Span>*/}
                {/*                </Bold>*/}
                {/*            </Link>*/}
                {/*        </Div>*/}
                {/*        }*/}
                {/*        <Div textAlign={'center'}>*/}
                {/*            <Link to={'/mypage/couponList'}>*/}
                {/*                <Div bold fontSize={13}>쿠폰</Div>*/}
                {/*                <Div fontSize={10} fg={'secondary'}>*/}
                {/*                    {!this.state.loginUser ? '-' : <Span fg={'green'} bold*/}
                {/*                                                         fontSize={13}>{ComUtil.addCommas(this.state.couponCount)}</Span>}*/}
                {/*                </Div>*/}
                {/*            </Link>*/}
                {/*        </Div>*/}
                {/*        <Div textAlign={'center'}>*/}
                {/*            <Link to={'/goodsReviewList/1'}>*/}
                {/*                <Div bold fontSize={13}>리뷰작성</Div>*/}
                {/*                <Bold bold fontSize={10} fg={'secondary'}>*/}
                {/*                    {!this.state.loginUser ? '-' : <Span fg={'green'} bold*/}
                {/*                                                         fontSize={13}>{ComUtil.addCommas(this.state.goodsReviewCount)}</Span>}*/}
                {/*                </Bold>*/}
                {/*            </Link>*/}
                {/*        </Div>*/}
                {/*    </Flex>*/}
                {/*</Div>*/}

                {/*<Divider/>*/}

                {/*<ConsumerMypage loginUser={this.state.loginUser}/>*/}

                {/*{*/}
                {/*    this.state.loginUser && this.state.loginUser.producerFlag ?*/}
                {/*        <PConsumer />*/}
                {/*        :*/}
                {/*        <ConsumerMypage />*/}
                {/*}*/}


            </Fragment>
        )
    }
}

const MypageRouter = ({history}) => {
    const [consumer, setConsumer] = useRecoilState(consumerState)
    const [loading, setLoading] = useState(true)
    const [loginInfoData, setLoginInfoData] = useState(null);

    // const {consumer, isLoggedIn, isServerLoggedIn, reFetch} = useLogin()

    // useEffect(() => {
    //     console.log({consumer})
    // }, [consumer])

    useEffect(() => {

        async function fetch() {

            //백엔드 & 프론트 세션 싱크 항상 맞추기 위해(흰 화면 수정 코드)
            try {
                const loginInfo = await autoLoginCheckAndTryAsync()
                setLoginInfoData(loginInfo)
                setConsumer(ComUtil.getConsumerByLoginUser(loginInfo))


                // //로그아웃시 체크로직 한곳. setCosumer(null)
                // if (sessionStorage.getItem('logined')==0) {
                //
                //     setConsumer(null)
                // }
                // else if (!consumer) {
                //     const loginInfo = await autoLoginCheckAndTryAsync()
                //     console.log("mypage:loginInfo", loginInfo)
                //     setLoginInfoData(loginInfo)
                //     setConsumer(ComUtil.getConsumerByLoginUser(loginInfo))
                // }

                setTimeout(() => {
                    setLoading(false)
                }, 200)

            }catch(err) {
                console.error(err.message)
                setLoading(false)
            }
        }

        fetch()

    }, [])

    if (loading) return <Flex justifyContent={'center'} height={'calc(100vh - 56px - 52px)'} ><Spinner color={'success'} /></Flex>

    if(consumer) return <Mypage location={history.location} history={history} />
    else return <NoLoginUser />

    {/*{WIDERPLANET SCRIPT START 2022.06.07}*/}
    if(loginInfoData) return <TG ty={"Login"} />
    {/*{WIDERPLANET SCRIPT END 2022.06.07}*/}
}
export default withRouter(MypageRouter)