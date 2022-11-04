import React, {Component, Fragment, useState} from 'react'
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap'
import { Server } from '~/components/Properties'
import ComUtil from '~/util/ComUtil'
import {FaGift} from 'react-icons/fa'
import { BlockChainSpinner, ShopXButtonNav, ModalConfirm } from '~/components/common/index'
import { getOrderDetailPagingByOrderGroup, getOrderDetailByOrderSeq, updateConsumerOkDate, updateConsumerOkDateForSubGroup } from '~/lib/shopApi'
import { getLoginUser } from '~/lib/loginApi'
import { toast } from 'react-toastify'     //토스트
import { Button as Btn } from '~/styledComponents/shared/Buttons'
import { Link } from '~/styledComponents/shared/Links'
import {Div, Span, Img, Flex, Right, Hr, Sticky, Fixed, Space} from '~/styledComponents/shared/Layouts'
import {BadgeSharp, EmptyBox} from "~/styledComponents/ShopBlyLayouts";
import { Badge } from '~/styledComponents/mixedIn'
import { Icon } from '~/components/common/icons'
import styled from 'styled-components'
import { color } from '~/styledComponents/Properties'
import Skeleton from '~/components/common/cards/Skeleton'
import BackNavigation from "~/components/common/navs/BackNavigation";
import InfiniteScroll from "react-infinite-scroll-component";
import {getPayMethodPgNm} from "~/util/bzLogic";
import MathUtil from "~/util/MathUtil";


const SubGroup = styled(Div)`
`;

const SubGroupDetail = styled(Div)`
    border: 1px solid ${color.light};
    margin: 16px;
    margin-top: 0;
    
    // & > div {
    //     border-bottom: 1px solid ${color.light};
    // }
    
    & > div:last-child {
        border: 0;
    }
    
`;

const Order = ({
                   orderSeq, orderCnt, goodsNo, goodsNm, goodsOptionNm, orderPrice, cardPrice, mypageOrderPrice, mypageCardPrice, mypageBlctToken, orderBlctExchangeRate, blctToken, orderDate, orderImg, itemName, trackingNumber, farmName, goodsKind,
                   trackingNumberTimestamp, consumerOkDate, payMethod, payStatus, expectShippingStart, expectShippingEnd, onConfirmed, gift, partialRefundCount,
                   hopeDeliveryFlag, hopeDeliveryDate,
                   blyTimeGoods,       //블리타임 상품여부
                   blyTimeReward,      //블리타임 리워드 %
                   superRewardGoods,   //슈퍼리워드 상품 여부
                   superRewardReward,  //슈퍼리워드 %
                   orderConfirm,       //판매자 주문확인 여부
                   onePlusSubFlag,     // 사은품여부
                   pgProvider,         //kakaopay, naverpay, payco
                   scheduleAtTime,     //예약결제시간
                   subGroupListSize,  //여러건 주문(옵션주문 혹은 묶음주문)인지 판단용도.
                   dpCancelReason,     //소비자에게 노출되는 취소 사유

               }) => (
    goodsKind === 2 ?   // dealGoods용 UI /////////////////////////////////////////////
        <Div p={16}>
            <Link to={`/mypage/orderDetail?orderSeq=${orderSeq}`} display={'block'}>
                <Flex alignItems={'flex-start'}>
                    <Div width={63} height={63} mr={9} flexShrink={0}>
                        <Img cover src={Server.getThumbnailURL()+orderImg} alt={'상품사진'}/>
                    </Div>

                    <Div flexGrow={1}>

                        <Flex justifyContent={'flex-start'}>
                            {
                                gift && <Div fg={'danger'} mr={5}><FaGift /></Div>
                            }
                            {

                                (payStatus === 'cancelled' || payStatus === 'revoked') ?
                                    <BadgeSharp size={'sm'} bg={'danger'}>
                                        {
                                            payStatus === 'cancelled' && '취소완료'
                                        }
                                        {
                                            payStatus === 'revoked' && '예약취소완료'
                                        }
                                    </BadgeSharp>
                                    :
                                    consumerOkDate ? <BadgeSharp size={'sm'} bg={'green'}>구매확정</BadgeSharp> :
                                        trackingNumber ? <BadgeSharp size={'sm'} bg={'green'}>배송중</BadgeSharp> :
                                            orderConfirm === 'confirmed' ?
                                                <BadgeSharp size={'sm'} bg={'green'}>출고대기</BadgeSharp>
                                                :
                                                (payStatus === 'scheduled') ?
                                                    <>
                                                        <BadgeSharp size={'sm'} bg={'dark'}>예약주문</BadgeSharp>
                                                        <Span fontSize={9} fg={'dark'} ml={5}>
                                                            {scheduleAtTime > 0 ? '(결제예정:'+ComUtil.longToDateMoment(scheduleAtTime).format("MM[월]DD[일]HH[시]")+')':''}
                                                        </Span>
                                                    </>
                                                    :
                                                    <BadgeSharp size={'sm'} bg={'dark'}>발송예정</BadgeSharp>
                            }
                        </Flex>
                        <Div mt={5}>
                            {goodsOptionNm}
                        </Div>
                        {
                            onePlusSubFlag &&
                            <Div>
                                <Div mb={4} fontSize={14} bold>증정품</Div>
                                <Right fontSize={12} fg={'dark'}>수량 : {orderCnt} | 증정품</Right>
                            </Div>
                        }
                        {
                            !onePlusSubFlag &&
                            <>
                                {
                                    (payMethod === 'card') &&
                                    <Div>
                                        <Div mb={4} fontSize={14} bold>{ComUtil.addCommas(mypageOrderPrice)}원</Div>
                                        <Right fontSize={12} fg={'dark'}>
                                            수량 : {orderCnt} {partialRefundCount ? '(+부분환불 ' + partialRefundCount + '건) ' : ''} | {getPayMethodPgNm(payMethod, pgProvider)}
                                            <Span fg={'danger'}>
                                                {(superRewardGoods) ? '(슈퍼리워드 적용)' : ''} {(blyTimeGoods) ? '(블리타임 적용)' : ''}
                                            </Span>
                                        </Right>
                                    </Div>
                                }
                                {
                                    (payMethod === 'blct') &&
                                    <Div alignItems={'center'}>
                                        <Div mb={4} fontSize={14} bold>
                                            <Icon name={'blocery'}/>&nbsp;{ComUtil.addCommas(mypageBlctToken.toFixed(2))}({ComUtil.addCommas(mypageOrderPrice)}원)
                                        </Div>
                                        <Right fontSize={12} fg={'dark'}>
                                            수량 : {orderCnt} {partialRefundCount ? '(+부분환불 ' + partialRefundCount + '건) ' : ''}| {getPayMethodPgNm(payMethod, pgProvider)}
                                        </Right>
                                    </Div>
                                }
                                {
                                    (payMethod === 'cardBlct') &&
                                    <Div alignItems={'center'}>
                                        <Div mb={4} fontSize={14}>
                                            <b>{ComUtil.addCommas(mypageOrderPrice)}원</b> <Span fontSize={11}>({ComUtil.addCommas(mypageCardPrice)}원 +<Icon name={'blocery'}/>&nbsp;{ComUtil.addCommas(mypageBlctToken.toFixed(2))}({ComUtil.addCommas(MathUtil.roundHalf(MathUtil.multipliedBy(mypageBlctToken,orderBlctExchangeRate)))}원))</Span>
                                        </Div>
                                        <Right fontSize={12} fg={'dark'}>
                                            수량 : {orderCnt} {partialRefundCount ? '(+부분환불 ' + partialRefundCount + '건) ' : ''} | {getPayMethodPgNm(payMethod, pgProvider)}
                                            <Span fg={'danger'}>
                                                {(superRewardGoods) ? '(슈퍼리워드 적용)' : ''} {(blyTimeGoods) ? '(블리타임 적용)' : ''}
                                            </Span>
                                        </Right>
                                    </Div>
                                }
                            </>
                        }

                        {
                            hopeDeliveryFlag && (
                                <Div fontSize={12} fg={'dark'}>희망 수령일 : {ComUtil.utcToString(hopeDeliveryDate)}</Div>
                            )
                        }

                    </Div>
                </Flex>

            </Link>
            {
                onePlusSubFlag ? null :
                    (payStatus === 'cancelled') ? null :
                        consumerOkDate ? null :
                            (subGroupListSize <= 1 && trackingNumber) && //쑥쑥 단건 구매확정.
                            <Div mt={16}>
                                <ModalConfirm title={'구매확정'} content={<div>구매확정 하시겠습니까?<br/>구매확정 후 교환 및 반품이 불가합니다.</div>} onClick={onConfirmed.bind(this, orderSeq)}>
                                    <Btn block bg={'green'} fg={'white'} rounded={5}>
                                        구매확정
                                        {/* 쑥쑥 구매확정: 리워드 불필요.*/}
                                        {/*<Div fontSize={13} fg={'light'}>*/}
                                        {/*    {*/}
                                        {/*        (cardPrice > 0 && (blyTimeGoods || superRewardGoods)) && (*/}
                                        {/*            `(지급 예정 리워드 ${ComUtil.addCommas(Math.round(cardPrice * ((blyTimeGoods ? blyTimeReward : superRewardReward) / 100)))}원)`*/}
                                        {/*        )*/}
                                        {/*    }*/}
                                        {/*</Div>*/}
                                    </Btn>
                                </ModalConfirm>
                            </Div>
            }
        </Div> :  // directGoods용 UI /////////////////////////////////////////////
        <Div p={16}>
            <Link to={`/mypage/orderDetail?orderSeq=${orderSeq}`} display={'block'}>
                <Flex alignItems={'flex-start'}>
                    <Div width={63} height={63} mr={9} flexShrink={0}>
                        <Img cover src={Server.getThumbnailURL()+orderImg} alt={'상품사진'}/>
                    </Div>

                    <Div flexGrow={1}>

                        <Flex justifyContent={'flex-start'}>
                            {
                                gift && <Div fg={'danger'} mr={5}><FaGift /></Div>
                            }
                            {
                                (payStatus === 'cancelled' || payStatus === 'revoked') ?
                                    <Space spaceGap={10}>
                                        <BadgeSharp size={'sm'} bg={'danger'}>
                                            {
                                                payStatus === 'cancelled' && '취소완료'
                                            }
                                            {
                                                payStatus === 'revoked' && '예약취소완료'
                                            }
                                        </BadgeSharp>
                                        {
                                            dpCancelReason && (<Div fontSize={12}>사유 : {dpCancelReason}</Div>)
                                        }
                                    </Space>
                                    :
                                    consumerOkDate ? <BadgeSharp size={'sm'} bg={'green'}>구매확정</BadgeSharp> :
                                        trackingNumber ? <BadgeSharp size={'sm'} bg={'green'}>배송중</BadgeSharp> :
                                            orderConfirm === 'confirmed' ?
                                                <BadgeSharp size={'sm'} bg={'green'}>출고대기</BadgeSharp>
                                                :
                                                (payStatus === 'scheduled') ?
                                                    <BadgeSharp size={'sm'} bg={'dark'}>예약주문</BadgeSharp>
                                                    :
                                                    <BadgeSharp size={'sm'} bg={'dark'}>발송예정</BadgeSharp>
                            }
                        </Flex>
                        <Div mt={5}>
                            {goodsOptionNm}
                        </Div>
                        {
                            onePlusSubFlag &&
                            <Div>
                                <Div mb={4} fontSize={14} bold>증정품</Div>
                                <Right fontSize={12} fg={'dark'}>수량 : {orderCnt} | 증정품</Right>
                            </Div>
                        }
                        {
                            !onePlusSubFlag &&
                            <>
                                {
                                    (payMethod === 'card') &&
                                    <Div>
                                        <Div mb={4} fontSize={14} bold>{ComUtil.addCommas(mypageOrderPrice)}원</Div>
                                        <Right fontSize={12} fg={'dark'}>
                                            수량 : {orderCnt} {partialRefundCount ? '(+부분환불 ' + partialRefundCount + '건) ' : ''} | {getPayMethodPgNm(payMethod, pgProvider)}
                                            <Span fg={'danger'}>
                                                {(superRewardGoods) ? '(슈퍼리워드 적용)' : ''} {(blyTimeGoods) ? '(블리타임 적용)' : ''}
                                            </Span>
                                        </Right>
                                    </Div>
                                }
                                {
                                    (payMethod === 'blct') &&
                                    <Div alignItems={'center'}>
                                        <Div mb={4} fontSize={14} bold>
                                            <Icon name={'blocery'}/>&nbsp;{ComUtil.addCommas(mypageBlctToken.toFixed(2))}({ComUtil.addCommas(mypageOrderPrice)}원)
                                        </Div>
                                        <Right fontSize={12} fg={'dark'}>
                                            수량 : {orderCnt} {partialRefundCount ? '(+부분환불 ' + partialRefundCount + '건) ' : ''}| {getPayMethodPgNm(payMethod, pgProvider)}</Right>
                                    </Div>
                                }
                                {
                                    (payMethod === 'cardBlct') &&
                                    <Div alignItems={'center'}>
                                        <Div mb={4} fontSize={14}>
                                            <b>{ComUtil.addCommas(mypageOrderPrice)}원</b> <Span fontSize={11}>({ComUtil.addCommas(mypageCardPrice)}원 +<Icon name={'blocery'}/>&nbsp;{ComUtil.addCommas(mypageBlctToken.toFixed(2))}({ComUtil.addCommas(MathUtil.roundHalf(MathUtil.multipliedBy(mypageBlctToken,orderBlctExchangeRate)))}원))</Span>
                                        </Div>
                                        <Right fontSize={12} fg={'dark'}>
                                            수량 : {orderCnt} {partialRefundCount ? '(+부분환불 ' + partialRefundCount + '건) ' : ''} | {getPayMethodPgNm(payMethod, pgProvider)}
                                            <Span fg={'danger'}>
                                                {(superRewardGoods) ? '(슈퍼리워드 적용)' : ''} {(blyTimeGoods) ? '(블리타임 적용)' : ''}
                                            </Span>
                                        </Right>
                                    </Div>
                                }
                            </>
                        }

                        {
                            hopeDeliveryFlag && (
                                <Div fontSize={12} fg={'dark'}>희망 수령일 : {ComUtil.utcToString(hopeDeliveryDate)}</Div>
                            )
                        }

                    </Div>
                </Flex>

            </Link>
            {
                onePlusSubFlag ? null :
                    (payStatus === 'cancelled') ? null :
                        consumerOkDate ? null :
                            (subGroupListSize <= 1 && trackingNumber) && //단건 구매확정.
                            <Div mt={16}>
                                <ModalConfirm title={'구매확정'} content={<div>구매확정 하시겠습니까?<br/>구매확정 후 교환 및 반품이 불가합니다.</div>} onClick={onConfirmed.bind(this, orderSeq)}>
                                    <Btn block bg={'green'} fg={'white'} rounded={5}>
                                        구매확정
                                        <Div fontSize={13} fg={'light'}>
                                            {
                                                (cardPrice > 0 && (blyTimeGoods || superRewardGoods)) && (
                                                    `(지급 예정 리워드 ${ComUtil.addCommas(Math.round(cardPrice * ((blyTimeGoods ? blyTimeReward : superRewardReward) / 100)))}원)`
                                                )
                                            }
                                        </Div>
                                    </Btn>
                                </ModalConfirm>
                            </Div>
            }
        </Div>
)
export default class OrderList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            //consumerNo : 0,
            orderList: undefined,
            isOpen: false,
            confirmModalOpen: false,
            reviewModalOpen: false,
            chainLoading: false,
            orderGroupNoList: [],
            orderGroupKeyList: [],
            loading: true,
            tabId:'1', //즉시상품, 쑥쑥상품 탭 추가.
            page: 0,
            hasMore: true,
            orderSubGroupList: undefined,
        }
    }

    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    };

    async componentDidMount() {
        // const params = new URLSearchParams(this.props.location.search)
        // let consumerNo = params.get('consumerNo')
        const loginUser = await getLoginUser(); // consumerNo 없으면 로그인정보에서 가져오도록 수정..refresh편의상..
        if(!loginUser){
            this.props.history.replace('/mypage');
            return;
        }
        const consumerNo = loginUser.uniqueNo;
        this.fetchMoreData(true, '1'); //consumerNo
    }

    fetchMoreData = async (isNewSearch, tabId) => {
        let params = { isPaging: true, limit: 10, dealGoods:((tabId === '1')? false:true) }

        if (isNewSearch) {
            params.page = 1
        }else{
            params.page = this.state.page + 1
        }
        const {data} = await getOrderDetailPagingByOrderGroup(params);
        const tempList = isNewSearch ? [] : this.state.orderList
        let newList = tempList;
        if(data.orderDetailList){
            newList = tempList.concat(data.orderDetailList)
        }
        //console.log({newList});
        const {orderList, orderGroupNoList, subGroupKeyList} = this.getAllData(newList);

        const tempSubGroupList = isNewSearch ? [] : this.state.orderSubGroupList;
        let newSubGroupList = tempSubGroupList;
        if(data.orderSubGroupList){
            newSubGroupList = tempSubGroupList.concat(data.orderSubGroupList);
        }
        console.log({data});

        //더이상 로딩 되지 않도록
        let hasMore = true;
        if (newList.length >= data.totalCount) {
            hasMore = false;
        }

        if(data.orderDetailList.length == 0){
            hasMore = false;
        }

        this.setState({
            page: params.page,
            hasMore,
            tabId,
            orderList,
            orderGroupNoList,
            subGroupKeyList,
            orderSubGroupList: newSubGroupList,
            loading:false
        })
    }

    //tab만들면서 분리.
    getAllData = (data) => {
        const orderGroupNoList = []
        const subGroupKeyList = []


        let orderGroupNo
        let subGroupKey = ''

        data && data//.filter(item => (tabId === '2')? item.dealGoods : !item.dealGoods )
            .map(item => {

                if(item.orderGroupNo) {
                    const compOrderGroupNo = item.orderGroupNo
                    if (orderGroupNo !== compOrderGroupNo)
                        orderGroupNoList.push(compOrderGroupNo)

                    const compKey = item.orderGroupNo + "_" + item.orderSubGroupNo + "_" + item.directGoods
                    if (subGroupKey !== compKey) {
                        subGroupKeyList.push({
                            orderGroupNo: item.orderGroupNo,
                            orderSubGroupNo: item.orderSubGroupNo, //producerNo ->orderSubGroupNo 로 대체.
                            directGoods: item.directGoods,
                            couponType: item.couponType
                        })
                    }

                    orderGroupNo = compOrderGroupNo
                    subGroupKey = compKey
                }
            })
        console.log({subGroupKeyList});

        return {orderList: data, orderGroupNoList, subGroupKeyList}
    }

    // 주문 상세조회
    getOrderDetail = (orderSeq) => {
        this.props.history.push(`/mypage/orderDetail?orderSeq=${orderSeq}`)
    }

    // 구매확정
    onConfirmed = async (orderSeq, isConfirmed, e) => {
        //const { data : orderDetail } = await getOrderDetailByOrderSeq(orderSeq)
        //console.log('orderDetail : ', orderDetail);

        if(isConfirmed) { // modal에서 확인 버튼을 누를 경우 true, 취소는 false
            this.setState({chainLoading: true});

            const {data:errRes} =  await updateConsumerOkDate(orderSeq);  //db에 저장

            if(errRes.resCode) {
                alert(errRes.errMsg); //구매확정 실패 오류
                this.setState({
                    chainLoading: false
                });

            } else { //resCode==0이면 구매확정 성공.
                this.setState({
                    chainLoading: false,
                    reviewModalOpen: true,
                    orderSeq: orderSeq,
                    //goodsNo: orderDetail.goodsNo //미사용이라 막음 2022.04
                });

            }
        }
        this.fetchMoreData(true, this.state.tabId);
        // this.getOrderList(orderDetail.consumerNo);
    }

    // 주문그룹단위별 구매확정
    onSubGroupConfirmed = async (orderSubGroupNo, isConfirmed, e) => {
        if(isConfirmed) { // modal에서 확인 버튼을 누를 경우 true, 취소는 false
            this.setState({chainLoading: true});

            const {data:errRes} =  await updateConsumerOkDateForSubGroup(orderSubGroupNo);  //db에 저장

            if(errRes.resCode) {
                alert(errRes.errMsg); //구매확정 실패 오류
                this.setState({
                    chainLoading: false
                });

            } else { //resCode==0이면 구매확정 성공.
                this.setState({
                    chainLoading: false,
                    reviewModalOpen: true
                });
            }
        }
        this.fetchMoreData(true, this.state.tabId);
        // this.getOrderList(orderDetail.consumerNo);
    }

    toggle = () => {
        this.setState({
            confirmModalOpen: !this.state.confirmModalOpen
        });
    }

    toggleOk = () => {
        this.props.history.push('/goodsReviewList/1')
    }

    // 리뷰작성 modal
    toggleReview = () => {
        this.setState({
            reviewModalOpen: !this.state.reviewModalOpen
        });
    }


    onHeaderClick = (pTabId) => {
        // 탭버튼이 너무 늦게 반응하는 경우가 있어 탭버튼 활성화 및 로딩 적용 22.05.11 david
        this.setState({
            tabId:pTabId,
            loading:true
        });
        // this.setAllData(pTabId, this.state.orderList);
        this.fetchMoreData(true, pTabId)
    }

    onSubGroupPayCancelReq = (orderDetail) => {
        // if(orderDetail.usedCouponNo > 0 && !orderDetail.dealGoods) {
        //     if(!window.confirm('쿠폰으로 구매한 상품입니다. 결제취소시 쿠폰이 재발급 되지 않습니다. 취소하시겠습니까?'))
        //         return
        // }

        //subGroup취소도 orderSeq하나만 넣으면 orderCancel.js 내부에서 subGroup인지 판단.
        this.props.history.push(`/mypage/orderCancel?orderSeq=${orderDetail.orderSeq}`)
    }

    //subGroup(list 1개이상)의 구매확정 가능여부 check.

    isPossibleSubGroupConfirm = (orderList) => {
        //(취소안된것중) 구매확정된것이나, trackingNumber없는게 있으면 false.
        if ( orderList.find( orderDetail =>  (orderDetail.payStatus!=='cancelled' && orderDetail.payStatus!=='revoked') && (orderDetail.consumerOkDate || !orderDetail.trackingNumber)) )
            return false;

        //다 취소됬으면 확정불가
        let cancelledList = orderList.filter( orderDetail => (orderDetail.payStatus ==='cancelled' || orderDetail.payStatus==='revoked') )
        console.log('isPossibleSubGroupConfirm cancelledList:', cancelledList )

        if ( cancelledList && cancelledList.length == orderList.length)
            return false;

        return true;
    }

    //subGroup(list 1개이상)의 취소 가능여부 check.
    isPossibleSubGroupCancel = (orderList) => {

        //다 취소됬으면 취소 불가
        let cancelledList = orderList.filter( orderDetail => (orderDetail.payStatus ==='cancelled' || orderDetail.payStatus==='revoked') )
        if ( cancelledList && cancelledList.length == orderList.length)
            return false;

        //배송중이거나 출고대기면 취소 불가
        // orderDetail.trackingNumber
        //orderDetail => orderDetail.orderConfirm === 'confirmed' || orderDetail.orderConfirm === 'shipping'
        if( orderList.find(orderDetail => orderDetail.orderConfirm === 'confirmed' || orderDetail.orderConfirm === 'shipping' || orderDetail.trackingNumber) )
            return false;

        //하나라도 취소 가능하면 return true: TODO 맞는지 check필요.
        if ( orderList.find( orderDetail =>  !orderDetail.consumerOkDate && orderDetail.payStatus!=='cancelled' && orderDetail.payStatus!=='revoked' && orderDetail.orderConfirm != 'confirmed' ))
            return true;

        //참고소스 OrderDetail.js:
        //  if(orderPayStatus !== 'cancelled' && orderPayStatus !== 'revoked'){
        //     // 운송장번호 대신 orderConfirm이용.  // if(!orderDetail.trackingNumber){
        //     (orderDetail.orderConfirm != 'confirmed'    //&& !orderDetail.onePlusSubFlag){
        //     }
        //  }

        return false;
    }

    //subGroup의 배송비 표시 (card, blct결제금액까지)
    sumOrderListAdminDeliveryFee = (orderList) => {
        const subGroupList = Object.assign([],this.state.orderSubGroupList);

        const subGroup = subGroupList && subGroupList.filter(item => item.orderSubGroupNo === orderList[0].orderSubGroupNo);
        // console.log(subGroup)

        if(subGroup.length === 0)
            return;

        let deliveryFee = '0원'
        let deliveryFlag = false;
        if(subGroup[0].deliveryFee > 0) {
            deliveryFee = (subGroup[0].deliveryBlctToken > 0)? `${ComUtil.addCommas(subGroup[0].deliveryFee)}원 (${ComUtil.addCommas(subGroup[0].deliveryCardPrice)}원 + ${subGroup[0].deliveryBlctToken}BLY)`
                : `${ComUtil.addCommas(subGroup[0].deliveryFee)}원` //BLY없을때 원화만 출력.
            deliveryFlag = true;
        }

        // console.log({deliveryFlag})
        // console.log({deliveryFee})
        if (!deliveryFlag)
            return;

        return deliveryFee;
        // return orderList.reduce((sum, orderDetail)=> sum + orderDetail.adminDeliveryFee, 0);
    }

    render() {
        const data = this.state.orderList;
        return(
            <Fragment>
                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }
                {/*<ShopXButtonNav underline fixed historyBack>주문목록</ShopXButtonNav>*/}
                <BackNavigation>주문목록</BackNavigation>
                <Flex bg={'white'} px={16} py={16} custom={`
                    & > div:nth-child(1){
                        border-right: 0;
                        border-top-right-radius: 0;
                        border-bottom-right-radius: 0;
                    }
                    & > div:nth-child(2){
                        border-left: 0;
                        border-top-left-radius: 0;
                        border-bottom-left-radius: 0;
                    }
                `}>
                    <HeaderButton active={this.state.tabId === '1'} onClick={this.onHeaderClick.bind(this, '1')} >즉시상품</HeaderButton>
                    <HeaderButton active={this.state.tabId === '2'} onClick={this.onHeaderClick.bind(this, '2')} >쑥쑥-계약재배</HeaderButton>
                </Flex>

                {
                    this.state.loading ?
                        <Skeleton count={5} bc={'light'} m={16}/> :
                        (
                            this.state.orderGroupNoList.length > 0 ? (
                                <InfiniteScroll
                                    dataLength={this.state.orderList.length}
                                    next={this.fetchMoreData.bind(this, false, this.state.tabId)}
                                    hasMore={this.state.hasMore}
                                    loader={<Skeleton.List count={1} />}
                                    refreshFunction={this.fetchMoreData.bind(this, true, this.state.tabId)}
                                    pullDownToRefresh
                                    pullDownToRefreshThreshold={100}
                                    pullDownToRefreshContent={
                                        <Div textAlign={'center'} fg={'green'}>
                                            &#8595; 아래로 당겨서 업데이트
                                        </Div>
                                    }
                                    releaseToRefreshContent={
                                        <Div textAlign={'center'} fg={'green'}>
                                            &#8593; 업데이트 반영
                                        </Div>
                                    }
                                >
                                    {
                                        this.state.orderGroupNoList.map(orderGroupNo => {
                                            const subGroupKeyList = this.state.subGroupKeyList.filter(subGroupKey => subGroupKey.orderGroupNo === orderGroupNo)
                                            return(
                                                <SubGroup key={orderGroupNo}>
                                                    {
                                                        subGroupKeyList.map(({orderGroupNo, orderSubGroupNo, directGoods, couponType}, pIndex) => {
                                                            const orderList = this.state.orderList.filter(order =>
                                                                order.orderGroupNo === orderGroupNo
                                                                && order.orderSubGroupNo === orderSubGroupNo  //producerNo ->orderSubGroupNo 로 대체.
                                                                && order.directGoods === directGoods)
                                                            return (
                                                                <Fragment key={'subGroup'+pIndex} fg={'darkBlack'}>
                                                                    {
                                                                        pIndex === 0 && (
                                                                            <Flex mb={6} fontSize={13} px={16}>
                                                                                <div>{ComUtil.utcToString(orderList[0].orderDate)}</div>
                                                                                <Right>
                                                                                    <Span fg={'dark'}>주문그룹번호</Span> {orderSubGroupNo}
                                                                                </Right>
                                                                            </Flex>
                                                                        )
                                                                    }
                                                                    <SubGroupDetail key={orderGroupNo+"_"+ orderSubGroupNo + "_" + pIndex} bg={'white'}>
                                                                        {
                                                                            orderList.map((order, index) =><Order key={'order_'+order.orderSeq} {...order} onConfirmed={this.onConfirmed}/>)
                                                                        }

                                                                        { //(묶음)배송비 : any Order의 adminDeliveryFee 존재시 출력.
                                                                            (orderList.length > 1) && this.sumOrderListAdminDeliveryFee(orderList) &&
                                                                            <Flex mr={16} ml={16} pb={16} lineHeight={'1'}>
                                                                                <Flex> <Span>배송비</Span> <Div ml={3} fontSize={12}>{couponType === 'deliveryCoupon' ? "(배송비 지원쿠폰 사용)" : ""}</Div></Flex>
                                                                                <Right>
                                                                                    <Div> {this.sumOrderListAdminDeliveryFee(orderList)}</Div>
                                                                                </Right>
                                                                            </Flex>
                                                                        }
                                                                        {//SubGroup구매확정
                                                                            (orderList.length > 1) && this.isPossibleSubGroupConfirm(orderList) &&//1subGroup이 다건 주문일때만 (=orderDetail.subGroupListSize>1 과 동일)
                                                                            <Div pr={16} pb={16} pl={16}>
                                                                                <ModalConfirm
                                                                                    title={'전체 구매확정'}
                                                                                    content={<div>구매확정 하시겠습니까?<br/>구매확정 후 교환 및 반품이 불가합니다.</div>}
                                                                                    onClick={this.onSubGroupConfirmed.bind(this, orderSubGroupNo)}>
                                                                                    <Btn mr={16}
                                                                                         block bg={'green'} fg={'white'}
                                                                                         rounded={5}>
                                                                                        전체 구매확정
                                                                                    </Btn>
                                                                                </ModalConfirm>
                                                                            </Div>
                                                                        }
                                                                        {// SubGroup취소
                                                                            (orderList.length > 1) && this.isPossibleSubGroupCancel(orderList) &&
                                                                            <Div pr={16} pb={16} pl={16}>
                                                                                <Btn block bg={'danger'} fg={'white'} rounded={5}
                                                                                     onClick={this.onSubGroupPayCancelReq.bind(this, orderList[0])}>
                                                                                    전체 취소요청
                                                                                </Btn>
                                                                            </Div>
                                                                        }
                                                                    </SubGroupDetail>

                                                                </Fragment>
                                                            )
                                                        })
                                                    }
                                                </SubGroup>
                                            )
                                        })
                                    }
                                </InfiniteScroll>
                            ) : (
                                <EmptyBox>주문 내역이 없습니다.</EmptyBox>
                                // <div className='w-100 h-100 d-flex justify-content-center align-items-center p-5 text-dark'>주문 내역이 없습니다.</div>

                            )

                        )
                }
                <Modal isOpen={this.state.reviewModalOpen} centered>
                    <ModalBody>리뷰작성 하시겠습니까?</ModalBody>
                    <ModalFooter>
                        <Button color="info" onClick={this.toggleOk}>확인</Button>
                        <Button color="secondary" onClick={this.toggleReview}>취소</Button>
                    </ModalFooter>
                </Modal>
            </Fragment>
        )
    }
}


const HeaderButton = ({children, active, onClick, disabled}) => {
    return(
        <Div flexGrow={1} py={10}
             textAlign={'center'} cursor={1}
             fg={active ? 'black':'secondary'}
             custom={`
                border-bottom: 2px solid ${active ? color.dark : color.white};
             `}
            // style={{borderBottom:active?'solid':''}}
             onClick={disabled ? null:onClick}
        >{children}</Div>
    )
}
