import React, {Component, useState, useEffect} from 'react';
import {Div, Flex, Button, Hr, GridColumns, Link, Span, Divider, Img} from '~/styledComponents/shared'
import {
    getConsumer,
    countRegularShop,
    countGoodsReview,
    getOrderDetailCountForMypage,
    getCountUsableCouponList,
    getRecommenderInfo,
    getCountOutboundComplete,
    getWaitingGoodsReviewCount, getGoodsReviewCount
} from '~/lib/shopApi'

import {autoLoginCheckAndTryAsync} from "~/lib/loginApi";
import {getCart} from "~/lib/cartApi";
import {getDonTotal, isAbuser} from "~/lib/donAirDropApi";
import useLogin from "~/hooks/useLogin";
import {HrHeavyX2} from "~/styledComponents/mixedIn";
import {color} from "~/styledComponents/Properties";
import {Bold} from "~/styledComponents/ShopBlyLayouts";
import ArrowList from "~/components/common/lists/ArrowList";
import {IoIosArrowForward, IoMdHeartEmpty} from 'react-icons/io'
import {AiOutlineNotification, AiOutlineFileText} from 'react-icons/ai'
import {FiTruck, FiBookmark, FiCornerDownRight, FiAward, FiUserPlus, FiZap, FiTarget, FiFlag, FiSettings} from 'react-icons/fi'
import {FaRegComments, FaRegQuestionCircle} from 'react-icons/fa'
import {BiStoreAlt} from 'react-icons/bi'
import {RiCoupon3Line} from 'react-icons/ri'
import {HiOutlinePencilAlt} from 'react-icons/hi'

import BlyIcon from '~/images/icons/renewal/bly_1.5px.svg'
import PointIcon from '~/images/icons/renewal/point_1.5px.svg'
import DonIcon from '~/images/icons/renewal/donnie_1.5px.svg'

const donOwners = [31,229,17,55,63,853,930,969,1031,2656,3788,5453,11272,13386,16184,17568,21930,32787,34219,34233,39922,39928,39931,39932,39933,39942,39943,39949,419,1044,3633,3661,13424,39858,39903,39975,718,40002,40008,40023,40024,2338,2907,33734,40047,40052,40056,40059,40061,40066,40067,40074,7396,39866,40073,40075,40135,40150,166,3720,3861,22205,40032,40115,39383];

const ConsumerMypage = (props) => {
    const [state, setState] = useState({
        regularShopCount: '',
        goodsReviewCount: '',

        cartLength: '',
        paymentDoneCount: '',
        inDeliveryCount: '',
        consumerOkCount: '',
        newReviewBadge: false,
        // newNotificationBadge: false,
        newNoticeRegBadge: false,
        newCouponBadge: false,
        newQnaBadge: false,
        modalOpen: false,
        loading: true,
        couponCount: 0,
        recommenderInfo: {},

        abuser: null,
        abuserInfoModal: false,
        profileImages: []
    })

    const loginUser = props.loginUser; //consumer객체임.
    //console.log(loginUser)

    useEffect(() => {
        if(loginUser)
            searchAll();

    }, [loginUser])

    const searchAll = async () => {
        const {data:res} = await getWaitingGoodsReviewCount();

        const result = await Promise.all([
            countGoodsReview().then((res) => res.data),
            getOrderDetailCountForMypage().then((res) => res.data),
            getCountOutboundComplete().then((res) => res.data)
            // countRegularShop().then((res) => res.data),
            // getCart().then((res) => res.data),
            // getCountUsableCouponList().then((res) => res.data),
            // getRecommenderInfo().then((res) => res.data),
            // isAbuser().then((res) => res.data),
        ]);

        let goodsReviewCount = result[0];
        let detailCount = result[1];
        let outboundComplete = result[2];
        let newReview = res > 0;
        // let regularShopCount = result[0];
        // let cartData = result[2];
        // let couponCount = result[4];
        // let recommenderInfo = result[5];
        // let abuser = result[6];

        setState({
            goodsReviewCount: goodsReviewCount,
            outboundComplete: outboundComplete,
            // recommenderInfo: recommenderInfo,
            // regularShopCount: regularShopCount,
            // couponCount: couponCount,
            // abuser: abuser,


            //202003추가.
            // cartLength: cartData.length,
            paymentReservedCount: detailCount.paymentReservedCount,
            paymentDoneCount: detailCount.paymentDoneCount,
            inDeliveryCount: detailCount.inDeliveryCount,
            consumerOkCount: detailCount.consumerOkCount,
            newNoticeRegBadge: detailCount.newNoticeRegBadge,
            // newNotificationBadge: detailCount.newNotificationBadge,
            // newCouponBadge: detailCount.newCouponBadge,
            newQnaBadge: detailCount.newQnaBadge,
            newReviewBadge: newReview,

            loading: false
        });
    }

    console.log({state})

    return (
        <Div>
            <Div p={15} pt={30}>
                <Div bold fontSize={17}>진행중인 주문</Div>
                <Link to={`/mypage/orderList`} display={'block'}>
                    <Flex mt={20} mb={20} fontSize={14} textAlign={'center'} alignItems={'flex-start'} justifyContent={'space-evenly'}>
                        <Div>
                            <Bold bold fontSize={33} fg={(state.paymentDoneCount + state.paymentReservedCount) ? 'black' : 'secondary'}>
                                {(!loginUser || state.paymentDoneCount === undefined || state.paymentReservedCount === undefined)
                                    ? '-' : (state.paymentDoneCount + state.paymentReservedCount)}
                            </Bold>
                            {
                                state.paymentReservedCount > 0 ?
                                    <Div>예약&완료</Div>
                                    :
                                    <Div>완료</Div>
                            }
                        </Div>
                        <Div m={'48px 0 0 0'}>
                            <IoIosArrowForward size={16} color={color.green}/>
                        </Div>
                        <Div>
                            <Bold bold fontSize={33}
                                 fg={state.outboundComplete ? 'black' : 'secondary'}>{!loginUser ? '-' : state.outboundComplete}</Bold>
                            <Div>출고준비</Div>
                        </Div>
                        <Div m={'48px 0 0 0'}>
                            <IoIosArrowForward size={16} color={color.green}/>
                        </Div>
                        <Div>
                            <Bold bold fontSize={33}
                                 fg={state.inDeliveryCount ? 'black' : 'secondary'}>{!loginUser ? '-' : state.inDeliveryCount}</Bold>
                            <Div>배송중</Div>
                        </Div>
                        <Div m={'48px 0 0 0'}>
                            <IoIosArrowForward size={16} color={color.green}/>
                        </Div>
                        <Div>
                            <Bold bold fontSize={33}
                                 fg={state.consumerOkCount ? 'black' : 'secondary'}>{!loginUser ? '-' : state.consumerOkCount}</Bold>
                            <Div>구매확정</Div>
                        </Div>
                    </Flex>
                </Link>
            </Div>
            <Divider />

            <ArrowList data={[
                {text: <><FiTruck size={22} style={{marginRight:'15px'}} />주문목록 </>, to: `/mypage/orderList`},
                {text: <><HiOutlinePencilAlt size={22} style={{marginRight:'15px'}} /> <Span pr={8} noti={state.newReviewBadge ? 1 : 0}>상품리뷰</Span> </>, to: `/goodsReviewList/1`},
                {text: <><FaRegComments size={22} style={{marginRight:'15px'}} /> <Span pr={8} noti={state.newQnaBadge ? 1 : 0}>1:1문의</Span> </>, to: `/mypage/myQA/1`},
                {text: <><IoMdHeartEmpty size={22} style={{marginRight:'15px'}} />찜한상품 </>, to: `/myZzimList`},
                {text: <><BiStoreAlt size={22} style={{marginRight:'15px'}} />단골상점 </>, to: `/myRegularShopList?consumerNo=${!loginUser ? '-' : loginUser.consumerNo}`},
            ]} />
            <Divider />

            {
                !loginUser.noBlockchain && (donOwners.includes(loginUser.consumerNo) ?
                    <ArrowList data={[
                        {text: <><Img src={PointIcon} width={22} height={22} mr={15} />포인트 </>, to: `/point`},
                        {text: <><Img src={BlyIcon} width={22} height={22} mr={15} />적립금(BLY) </>, to: `/tokenHistory`},
                        {text: <><Img src={DonIcon} width={22} height={22} mr={15} />적립금(DON) </>, to: `/donHistory`},
                        {text: <><RiCoupon3Line size={22} style={{marginRight:'15px'}} />쿠폰 </>, to: `/mypage/couponList`},
                    ]} />
                    :
                    <ArrowList data={[
                        {text: <><Img src={PointIcon} width={22} height={22} mr={15} />포인트 </>, to: `/point`},
                        {text: <><Img src={BlyIcon} width={22} height={22} mr={15} />적립금(BLY) </>, to: `/tokenHistory`},
                        {text: <><RiCoupon3Line size={22} style={{marginRight:'15px'}} />쿠폰 </>, to: `/mypage/couponList`},
                    ]} />)
            }
            {
                loginUser.noBlockchain &&
                    <ArrowList data={[
                        {text: <><Img src={PointIcon} width={22} height={22} mr={15} />포인트 </>, to: `/point`},
                        {text: <><RiCoupon3Line size={22} style={{marginRight:'15px'}} />쿠폰 </>, to: `/mypage/couponList`},
                    ]} />
            }
            <Divider />

            <ArrowList data={[
                {text: <><AiOutlineFileText size={22} style={{marginRight:'15px'}} />내 게시글 </>, to: `/mypage/boardList`},
                {text: <><FiBookmark size={22} style={{marginRight:'15px'}} />내 스크랩 </>, to: `/mypage/scrapList`},
                {text: <><FiCornerDownRight size={22} style={{marginRight:'15px'}} />내 댓글 </>, to: `/mypage/replyList`},
                {text: <><FiAward size={22} style={{marginRight:'15px'}} />활동배지 </>, to: `/consumerBadgeList?consumerNo=${loginUser.consumerNo}`},
                {text: <><FiUserPlus size={22} style={{marginRight:'15px'}} />친구초대 </>, to: `/mypage/inviteFriend`},
            ]} />
            <Divider />

            <ArrowList data={[
                {text: <><FiZap size={22} style={{marginRight:'15px'}} />등급 및 혜택안내 </>, to: `/levelInfo`},
                {text: <><FiTarget size={22} style={{marginRight:'15px'}} />포인트안내 </>, to: `/pointInfo`},
                {text: <><AiOutlineNotification size={22} style={{marginRight:'15px'}} /> <Span pr={8} noti={state.newNoticeRegBadge ? 1 : 0}>공지사항</Span> </>, to: `/noticeList`},
                {text: <><FiFlag size={22} style={{marginRight:'15px'}} />이용안내 </>, to: `/mypage/useGuide`},
                {text: <><FaRegQuestionCircle size={22} style={{marginRight:'15px'}} />FAQ </>, to: `/faq`},
            ]} />
            <Divider />

            <ArrowList data={[
                {text: <><FiSettings size={22} style={{marginRight:'15px'}} />설정 </>, to: `/mypage/setting`},
            ]} />
            <Divider/>

            {/*<Div p={15}>*/}
            {/*    <Div bold fontSize={17} mb={35}>나의 쇼핑정보</Div>*/}
            {/*    <GridColumns repeat={2} colGap={0} rowGap={20} ml={12} mb={20} fontSize={13}>*/}
            {/*        <Link to={`/mypage/orderList`}>주문배송조회</Link>*/}
            {/*        /!*<Link to={`/mypage/orderList`}>취소/교환/반품내역</Link>*!/*/}
            {/*        /!*<Link to={'/mypage/myQA/1'}>상품문의</Link>*!/*/}
            {/*        <Link to={'/goodsReviewList/1'}>상품리뷰</Link>*/}
            {/*        <Link to={'/myZzimList'}>찜한상품</Link>*/}
            {/*        /!*<Div>최근본상품</Div>*!/*/}
            {/*        <Link to={`/myRegularShopList?consumerNo=${!loginUser ? '-' : loginUser.consumerNo}`}>단골상점</Link>*/}
            {/*    </GridColumns>*/}
            {/*</Div>*/}
            {/*<Hr/>*/}

            {/*<Div p={15}>*/}
            {/*    <Div bold fontSize={17} mb={35}>내 활동</Div>*/}
            {/*    <GridColumns repeat={2} colGap={0} rowGap={20} ml={12} mb={20} fontSize={13}>*/}
            {/*        <Link to={'/mypage/boardList'}>내 게시글</Link>*/}
            {/*        <Link to={'/mypage/scrapList'}>내 스크랩</Link>*/}
            {/*        <Link to={'/mypage/replyList'}>내 댓글</Link>*/}
            {/*        {(loginUser && !loginUser.noBlockchain) &&*/}
            {/*            <Link to={'/mypage/inviteFriend'}>친구초대</Link>*/}
            {/*        }*/}
            {/*    </GridColumns>*/}
            {/*</Div>*/}
            {/*<Hr/>*/}

            {/*<Div p={15}>*/}
            {/*    <Div bold fontSize={17} mb={35}>고객센터</Div>*/}
            {/*    <GridColumns repeat={2} colGap={0} rowGap={20} ml={12} mb={20} fontSize={13}>*/}
            {/*        <Link to={'/noticeList'} noti={state.newNoticeRegBadge ? 1 : 0}>공지사항</Link>*/}
            {/*        <Link to={'/mypage/myQA/1'}>상품문의</Link>*/}
            {/*        <Link to={'/faq'}>FAQ</Link>*/}
            {/*        <Link to={'/mypage/useGuide'}>이용안내</Link>*/}
            {/*    </GridColumns>*/}
            {/*</Div>*/}
            {/*<Hr/>*/}

            {/*<Div p={15}>*/}
            {/*    <Div bold fontSize={17} mb={35}>설정</Div>*/}
            {/*    <GridColumns repeat={2} colGap={0} rowGap={20} ml={12} mb={20} fontSize={13}>*/}
            {/*        <Link to={'/mypage/setting'}>환경설정</Link>*/}
            {/*    </GridColumns>*/}
            {/*</Div>*/}
        </Div>
    )
}

export default ConsumerMypage