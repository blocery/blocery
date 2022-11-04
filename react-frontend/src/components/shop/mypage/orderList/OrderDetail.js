import React, { Component, Fragment } from 'react'
import { Server } from '../../../Properties'
import ComUtil from '~/util/ComUtil'
import {getTransportCarrierId,getCardPgName,getPayMethodPgNm} from '~/util/bzLogic'
import { Webview } from '~/lib/webviewApi'

import { BlockChainSpinner, BlocerySpinner, ModalWithNav } from '~/components/common/index'
import { getTransportCompany, getOrderDetailByOrderSeq, checkSubGroupStartDelivery } from '~/lib/shopApi'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'

import UpdateAddress from './UpdateAddress'
import {A, Link} from '~/styledComponents/shared/Links'
import {FaGift} from 'react-icons/fa'
import { toast } from 'react-toastify'     //토스트
import { Button as Btn } from '~/styledComponents/shared/Buttons'
import {Div, Span, Img, Flex, Right} from '~/styledComponents/shared/Layouts'
import {BadgeSharp} from "~/styledComponents/ShopBlyLayouts";
import { Badge, HrThin } from "~/styledComponents/mixedIn";
import { Icon } from '~/components/common/icons'
import { Header } from '~/styledComponents/mixedIn/Headers'
import styled from 'styled-components'
import { getValue } from '~/styledComponents/Util'
import {withRouter} from "react-router-dom";
import MathUtil from "~/util/MathUtil";

let transportCompanies;

const Title = styled(Div)`
    font-size: ${getValue(14)};
    font-weight: bold;
`;

class OrderDetail extends Component {
    constructor(props) {
        super(props);

        //파라미터로 주문정보 가져오기
        // const params = new URLSearchParams(this.props.location.search);
        const orderSeq = this.props.orderSeq;

        this.state = {
            orderSeq: orderSeq,
            orderInfo: {},
            goodsInfo: {},
            confirmHidden: false,
            isOpen: false,
            deliveryModal: false,
            trackingUrl: '',
            trackingOtherUrl: '',
            chainLoading: false,
            loading: false,
            serverToday: {},
            alreadySubGroupStartDelivery: false
        }

        this.cancelTitleSel = [null,null,null,null,null,null]; //[5]=당일취소 추가
    }

    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    };

    async componentDidMount() {
        // window.scrollTo(0,0)
        let { data } = await getTransportCompany();
        transportCompanies = data;

        await this.getOrderInfo();
        let orderDetail = this.state.orderInfo;

        if (orderDetail.consumerOkDate != null) {
            this.setState({
                confirmHidden: false
            });
        }

    }

    getOrderInfo = async () => {
        let {data:orderDetail} = await getOrderDetailByOrderSeq(this.state.orderSeq);
        this.setState({
            orderInfo: orderDetail
        });

        let {data:startDelivery} = await checkSubGroupStartDelivery(this.state.orderSeq);

        let goodsInfo = await getGoodsByGoodsNo(orderDetail.goodsNo);
        //console.log("goodsInfo : ", goodsInfo);
        this.setState({
            orderInfo: orderDetail,
            alreadySubGroupStartDelivery: startDelivery,
            goodsInfo: goodsInfo.data
        });
    };

    toggle = () => {
        this.setState({
            isOpen: !this.state.isOpen
        });
    };

    // 배송조회 팝업
    deliveryTracking = () => {
        let transportCompany = transportCompanies.find(transportCompany=>transportCompany.transportCompanyCode === this.state.orderInfo.transportCompanyCode);

        if (!transportCompany) {
            this.notify('송장번호가 입력되지 않았습니다.', toast.warn);
            return;
        }
        let trackingUrl = transportCompany.transportCompanyUrl.replace('[number]', this.state.orderInfo.trackingNumber);
        let trackingOtherUrl = transportCompany.transportCompanyUrl.replace('[number]', this.state.orderInfo.trackingNumber);

        // https://tracker.delivery/guide/ 해당 택배사 api 팝업연결 변경
        // 01 로젠택배      kr.logen
        // 02 CJ대한통운    kr.cjlogistics
        // 03 우체국        kr.epost
        // 04 롯데택배      kr.lotte
        // 05 CU편의점택배  kr.cupost
        // 07 한진택배      kr.hanjin

        // 새벽배송 및 기타배송 url 없음
        // 98 새벽배송
        // 99 기타배송

        let track_id = this.state.orderInfo.trackingNumber;
        const v_TransportCompanyCd = this.state.orderInfo.transportCompanyCode;

        let carrier_id = getTransportCarrierId(v_TransportCompanyCd);

        //새벽, 기타
        if(v_TransportCompanyCd !== '98' && v_TransportCompanyCd !== '99') {
            trackingUrl = `https://tracker.delivery/#/${carrier_id}/${track_id}`;
        }
        this.setState({
            trackingUrl,
            trackingOtherUrl,
            isOpen: true
        });
    };

    deliveryToggle = () => {
        this.setState(prevState => ({
            deliveryModal: !prevState.deliveryModal
        }));
    };

    //배송지 수정 팝업 callback
    updateDeliveryCallback = (data) => {
        if(data) {
            let orderDetail = Object.assign({}, this.state.orderInfo);
            orderDetail.receiverName = data.receiverName;
            orderDetail.receiverPhone = data.receiverPhone;
            orderDetail.receiverZipNo = data.receiverZipNo;
            orderDetail.receiverAddr = data.receiverAddr;
            orderDetail.receiverRoadAddr = data.receiverRoadAddr;
            orderDetail.receiverAddrDetail = data.receiverAddrDetail;
            orderDetail.deliveryMsg = data.deliveryMsg;
            orderDetail.commonEnterPwd = data.commonEnterPwd;
            this.setState({
                orderInfo: orderDetail
            });
        }

        this.deliveryToggle();
    };

    onClose = (data) => {
        this.toggle();
    };

    // 배송지정보 수정
    //배송상태가 '상품준비중'일 때만 수정 가능
    updateDeliveryInfo = () => {
        const orderDetail = Object.assign({}, this.state.orderInfo);
        if(orderDetail.trackingNumber) {
            alert('배송지정보 수정이 불가능합니다. 상품 수령 후 판매자에게 문의해주세요.');
        } else {
            if(orderDetail.orderSubGroupNo > 0 && orderDetail.subGroupListSize > 1) {
                if (!window.confirm('함께 구매한 묶음/옵션상품의 배송지가 일괄 수정됩니다. 수정하시겠습니까?'))
                    return
            }
            this.deliveryToggle();
        }
    };

    // 주문 취소 요청 클릭시 (주문취소요청화면으로 이동 팝업)
    onPayCancelReq = () => {
        let orderDetail = Object.assign({},this.state.orderInfo);

        // if(orderDetail.usedCouponNo > 0 && !orderDetail.dealGoods) {
        //     if(!window.confirm('쿠폰으로 구매한 상품입니다. 결제취소시 쿠폰이 재발급 되지 않습니다. 취소하시겠습니까?'))
        //         return
        // }

        // if(orderDetail.producerWrapDelivered) { //2021.10 현재 미사용.
        //     if(!window.confirm('생산자 묶음 배송상품입니다. 취소시 같이 구매한 동일생산자 상품이 모두 취소됩니다. 취소하시겠습니까?'))
        //         return
        // }

        let payMethod = orderDetail.payMethod;    //결제구분(blct, card)
        let merchant_uid = orderDetail.orderSeq;  //주문일련번호
        let imp_uid = orderDetail.impUid;         //PG고유번호
        if(payMethod !== "blct"){
            if(imp_uid === null){
                alert("PG내역이 없습니다.");
                return false;
            }
        }
        //Webview.openPopup(`/mypage/orderCancel?orderSeq=${merchant_uid}`);

        this.props.history.push(`/mypage/orderCancel?orderSeq=${merchant_uid}`)

    }

    render() {
        let orderDetail = this.state.orderInfo;
        let goods = this.state.goodsInfo;

        let orderPayCardName = orderDetail.cardName;
        let orderPayCardCode = orderDetail.cardCode;

        let orderPayMethod = orderDetail.payMethod;
        let orderPayStatus = orderDetail.payStatus;

        let r_pay_cancel_btn = <Btn block bc={'secondary'} bg={'white'} onClick={this.onPayCancelReq}>취소요청</Btn>;

        let r_pay_cancel_btn_view = null;

        console.log({orderPayStatus});
        // 예상배송일 기준
        if(orderPayStatus !== 'cancelled' && orderPayStatus !== 'revoked'){
            // 운송장번호 입력 전이면 취소요청 버튼 활성화
            // if(!orderDetail.trackingNumber){
            if(orderDetail.orderConfirm != 'confirmed' && !orderDetail.onePlusSubFlag){
                // 마지막 예상배송일 이전
                r_pay_cancel_btn_view = r_pay_cancel_btn;
            }
        }

        if(orderDetail.dealGoods && orderPayStatus === 'paid') {
            r_pay_cancel_btn_view = null;
        }

        return (
            <Fragment>
                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }
                {
                    this.state.loading && <BlocerySpinner/>
                }
                {/*<ShopXButtonNav fixed underline history={this.props.history} historyBack> 주문 상세내역 </ShopXButtonNav>*/}
                {
                    orderDetail && orderDetail.orderSeq &&
                    <>

                        <Header fontSize={14}>
                            <Div bold>주문정보</Div>
                            <Right fg={'dark'}>주문일련번호 : {orderDetail.orderSeq}</Right>
                        </Header>
                        <Div p={16}>
                            <Flex mb={8}>
                                <Div fg={'dark'} fontSize={12}>{ComUtil.utcToString(orderDetail.orderDate)}</Div>
                                <Right>
                                    {
                                            (orderDetail.payStatus === 'cancelled' || orderDetail.payStatus === 'revoked' ) ?
                                                <BadgeSharp size={'sm'} bg={'danger'}>
                                                    {orderDetail.payStatus === 'cancelled' && '취소완료'}
                                                    {orderDetail.payStatus === 'revoked' && '예약취소완료'}
                                                </BadgeSharp>
                                                :
                                                orderDetail.consumerOkDate ? <BadgeSharp size={'sm'} bg={'green'}>구매확정</BadgeSharp> :
                                                    orderDetail.trackingNumber ? <BadgeSharp size={'sm'} bg={'green'}>배송중</BadgeSharp> :
                                                        orderDetail.orderConfirm ?
                                                            <BadgeSharp size={'sm'} bg={'green'}>출고대기</BadgeSharp>
                                                            :
                                                            (orderDetail.payStatus === 'scheduled') ?
                                                                <BadgeSharp size={'sm'} bg={'dark'}>예약주문</BadgeSharp>
                                                                :
                                                                <BadgeSharp size={'sm'} bg={'dark'}>발송예정</BadgeSharp>
                                    }
                                </Right>
                            </Flex>

                            <Link to={'/goods?goodsNo='+goods.goodsNo} display={'block'}>
                                <Flex mb={8} alignItems={'flex-start'}>
                                    <Div width={63} height={63} mr={9} flexShrink={0}>
                                        <Img cover src={Server.getThumbnailURL()+orderDetail.orderImg} alt={'상품사진'}/>
                                    </Div>
                                    <Div lineHeight={24}>
                                        <Div fg={'green'} fontSize={12}>{orderDetail.itemName} | {orderDetail.farmName}</Div>
                                        <Div>{orderDetail.goodsOptionNm}</Div>
                                        {
                                            (orderDetail.onePlusSubFlag) &&
                                                <Div>
                                                    <Div mb={4} fontSize={14} bold>증정품</Div>
                                                    <Right fontSize={11} fg={'dark'}>수량 : {orderDetail.orderCnt} | 증정품</Right>
                                                </Div>
                                        }
                                        {
                                            (!orderDetail.onePlusSubFlag) &&
                                            <>
                                                {
                                                    (orderDetail.payMethod === 'card') &&
                                                        <Div>
                                                            <Div mb={4} fontSize={14} bold>
                                                                {ComUtil.addCommas(orderDetail.mypageOrderPrice)}원
                                                            </Div>
                                                            <Right fontSize={11} fg={'dark'}>
                                                                수량 : {orderDetail.orderCnt} | {getCardPgName(orderDetail.pgProvider)}
                                                                <Span fg={'danger'}>
                                                                    {(orderDetail.superRewardGoods) ? '(슈퍼리워드 적용)' : ''} {(orderDetail.blyTimeGoods) ? '(블리타임 적용)' : ''}
                                                                </Span>
                                                            </Right>
                                                        </Div>
                                                }
                                                {
                                                    (orderDetail.payMethod === 'blct') &&
                                                        <Div alignItems={'center'}>
                                                            <Div mb={4} fontSize={14} bold>
                                                                <Icon name={'blocery'}/>&nbsp;{ComUtil.addCommas(orderDetail.mypageBlctToken.toFixed(2))}({ComUtil.addCommas(orderDetail.mypageOrderPrice)}원)
                                                            </Div>
                                                            <Right fontSize={11} fg={'dark'}>수량 : {orderDetail.orderCnt} | BLY결제</Right>
                                                        </Div>
                                                }
                                                {
                                                    (orderDetail.payMethod === 'cardBlct') &&
                                                        <Div alignItems={'center'}>
                                                            <Div mb={4} fontSize={14} bold>
                                                                {ComUtil.addCommas(orderDetail.mypageCardPrice)}원 +<Icon name={'blocery'}/>&nbsp;{ComUtil.addCommas(orderDetail.mypageBlctToken.toFixed(2))}({ComUtil.addCommas(MathUtil.roundHalf(MathUtil.multipliedBy(orderDetail.orderBlctExchangeRate,orderDetail.mypageBlctToken)))}원)
                                                            </Div>
                                                            <Right fontSize={11} fg={'dark'}>
                                                                수량 : {orderDetail.orderCnt} | {getPayMethodPgNm(orderDetail.payMethod, orderDetail.pgProvider)}
                                                                <Span fg={'danger'}>
                                                                    {(orderDetail.superRewardGoods) ? '(슈퍼리워드 적용)' : ''} {(orderDetail.blyTimeGoods) ? '(블리타임 적용)' : ''}
                                                                </Span>
                                                            </Right>
                                                        </Div>
                                                }
                                            </>
                                        }
                                    </Div>
                                </Flex>
                            </Link>
                            {
                                (orderDetail.payStatus === 'scheduled') && (orderDetail.scheduleAtTime > 0) ?
                                    <Div width={'100%'} mb={16}>
                                        <Btn block bc={'secondary'} bg={'white'} disabled={true}>
                                            <Span fg={'white'} bold>결제예정 {ComUtil.longToDateMoment(orderDetail.scheduleAtTime).format("YY.MM.DD HH:00")}</Span>
                                        </Btn>
                                    </Div> : <></>
                            }

                            {
                                (orderPayStatus === 'cancelled' ||  orderPayStatus === 'revoked' )?
                                    <Link to={'/goods?goodsNo='+goods.goodsNo} display={'block'}><Btn block bc={'secondary'}>재구매</Btn></Link> : orderDetail.consumerOkDate ?
                                        <Flex>
                                            <Div flexGrow={1} pr={4}>
                                                <Btn block bc={'secondary'} onClick={this.deliveryTracking}>배송조회</Btn>
                                            </Div>
                                            <Div flexGrow={1} pl={4}>
                                                <Btn block bc={'secondary'}><Link to={'/goods?goodsNo='+goods.goodsNo}>재구매</Link></Btn>
                                            </Div>
                                        </Flex> : orderDetail.trackingNumber ?
                                            <Flex>
                                                <Div flexGrow={1} pr={4}>
                                                    <Btn block bc={'secondary'} onClick={this.deliveryTracking}>배송조회</Btn>
                                                </Div>
                                                <Div flexGrow={1} pl={4}>
                                                    {/*<Btn block bc={'secondary'}><Link to={'/farmersDetailActivity?producerNo='+orderDetail.producerNo}>판매자 문의</Link></Btn>*/}
                                                    <Btn block bc={'secondary'}><Link to={'/myPage/myQA/2'}>문의하기</Link></Btn>
                                                </Div>
                                            </Flex> : orderDetail.subGroupListSize<=1 && <Div width={'100%'}>{r_pay_cancel_btn_view}</Div>
                                                                 //2022.04 subGroupListSize가 여러개일때는 OrderList에 전체취소버튼 출력.
                            }
                        </Div>
                        <HrThin m={0} mb={16} />

                        <Div m={16}>
                            <Flex bold fontSize={14} mb={16}>
                                <Title>배송지 정보</Title>
                                <Right>
                                    {
                                        orderDetail.gift &&
                                        <span className='mr-2'>
                                            <FaGift className={'text-danger mr-1'} />
                                        </span>
                                    }
                                    {
                                            (orderPayStatus === 'cancelled' || orderPayStatus === 'revoked' || this.state.alreadySubGroupStartDelivery )  ? null :
                                                (orderDetail.consumerOkDate || orderDetail.trackingNumber || orderDetail.orderConfirm) ? null :
                                                    <Btn bc={'secondary'} fontSize={12} onClick={this.updateDeliveryInfo}>수정</Btn>
                                    }
                                </Right>
                            </Flex>
                            {
                                orderDetail.gift &&
                                <Flex fontSize={12} mb={3}>
                                    <Div fg={'adjust'} minWidth={80}>선물 발송자</Div>
                                    <Div>{orderDetail.senderName}</Div>
                                </Flex>
                            }
                            <Flex fontSize={12} mb={3}>
                                <Div fg={'adjust'} minWidth={80}>받는 사람</Div>
                                <Div>{orderDetail.receiverName}</Div>
                            </Flex>
                            <Flex fontSize={12} mb={3}>
                                <Div fg={'adjust'} minWidth={80}>연락처</Div>
                                <Div>{orderDetail.receiverPhone}</Div>
                            </Flex>
                            <Flex fontSize={12} mb={3}>
                                <Div fg={'adjust'} minWidth={80}>주소</Div>
                                <Div>({orderDetail.receiverZipNo}) {orderDetail.receiverAddr} {orderDetail.receiverAddrDetail}</Div>
                            </Flex>
                            <Flex fontSize={12} mb={3}>
                                <Div fg={'adjust'} minWidth={80}>배송요청사항</Div>
                                <Div>{orderDetail.deliveryMsg}</Div>
                            </Flex>
                            {
                                orderDetail.commonEnterPwd &&
                                <Flex fontSize={12} mb={3}>
                                    <Div fg={'adjust'} minWidth={80}>공동현관출입번호</Div>
                                    <Div>{orderDetail.commonEnterPwd}</Div>
                                </Flex>
                            }
                            {
                                orderDetail.hopeDeliveryFlag && (
                                    <Flex fontSize={12} mb={3}>
                                        <Div fg={'adjust'} minWidth={80}>희망 수령일</Div>
                                        <Div>{ComUtil.utcToString(orderDetail.hopeDeliveryDate)}</Div>
                                    </Flex>
                                )
                            }
                        </Div>

                        <HrThin m={0} mb={16} />

                        {/*<Div m={16}>*/}
                        {/*    <Title mb={16}>최종 결제금액</Title>*/}
                        {/*    {*/}
                        {/*        orderDetail.onePlusSubFlag ?*/}
                        {/*            <Div>*/}
                        {/*                <Flex fontSize={12} mb={3}>*/}
                        {/*                    <Div fg={'adjust'} minWidth={80}>결제구분</Div>*/}
                        {/*                    <Div>증정품</Div>*/}
                        {/*                </Flex>*/}
                        {/*                <Flex fontSize={12} mb={3}>*/}
                        {/*                    <Div fg={'adjust'} minWidth={80}>총 상품가격</Div>*/}
                        {/*                    <Div>-</Div>*/}
                        {/*                </Flex>*/}
                        {/*                {orderDetail.subGroupListSize <= 1 && //옵션여러개(or묶음) 아닐경우만 출력*/}
                        {/*                    <Flex fontSize={12} mb={3}>*/}
                        {/*                        <Div fg={'adjust'} minWidth={80}>총 배송비</Div>*/}
                        {/*                        <Div>-</Div>*/}
                        {/*                    </Flex>*/}
                        {/*                }*/}
                        {/*            </Div>*/}
                        {/*        :*/}
                        {/*            <Div>*/}
                        {/*                <Flex fontSize={12} mb={3}>*/}
                        {/*                    <Div fg={'adjust'} minWidth={80}>결제구분</Div>*/}
                        {/*                    <Div>{getPayMethodPgNm(orderDetail.payMethod,orderDetail.pgProvider)}</Div>*/}
                        {/*                </Flex>*/}
                        {/*                <Flex fontSize={12} mb={3}>*/}
                        {/*                    <Div fg={'adjust'} minWidth={80}>총 상품가격</Div>*/}
                        {/*                    <Div>{ComUtil.addCommas(orderDetail.currentPrice * orderDetail.orderCnt)} 원</Div>*/}
                        {/*                </Flex>*/}
                        {/*                {orderDetail.subGroupListSize <= 1 && //옵션여러개(or묶음) 아닐경우만 출력*/}
                        {/*                    <Flex fontSize={12} mb={3}>*/}
                        {/*                        <Div fg={'adjust'} minWidth={80}>총 배송비</Div>*/}
                        {/*                        <Div>{ComUtil.addCommas(orderDetail.adminDeliveryFee)} 원</Div>*/}
                        {/*                    </Flex>*/}
                        {/*                }*/}
                        {/*            </Div>*/}
                        {/*    }*/}
                        {/*</Div>*/}

                        {
                            !orderDetail.onePlusSubFlag ?
                            <Div m={16} fontSize={15}>
                                <Title mb={16}>결제상세</Title>
                                <Flex mb={10}>
                                    <Div>상품금액</Div>
                                    <Right bold>{ComUtil.addCommas(MathUtil.multipliedBy(orderDetail.currentPrice,orderDetail.orderCnt))} 원</Right>
                                </Flex>

                                {
                                    orderDetail.usedCouponNo !== 0 &&
                                    <Flex mb={10}>
                                        <Div>쿠폰 사용</Div>
                                        <Right fg={'danger'}>
                                            (-) {ComUtil.addCommas(MathUtil.roundHalf(MathUtil.multipliedBy(orderDetail.usedCouponBlyAmount,orderDetail.orderBlctExchangeRate)))}원
                                        </Right>
                                    </Flex>
                                }

                                {
                                    orderDetail.subGroupListSize <= 1 && //옵션여러개(or묶음) 아닐경우만 출력
                                    <Flex mb={10}>
                                        <Div>배송비</Div>
                                        <Right>(+) {ComUtil.addCommas(orderDetail.adminDeliveryFee)} 원</Right>
                                    </Flex>
                                }

                                {
                                    (orderDetail.payMethod !== "card") &&
                                    <Flex mb={10}>
                                        <Div>BLY 사용</Div>
                                        <Right>
                                            <Flex>
                                                <Div fg={'danger'}>(-)</Div> &nbsp;
                                                <Div fg={'bly'}>{ComUtil.addCommas(MathUtil.minusBy(orderDetail.mypageBlctToken,orderDetail.usedCouponBlyAmount).toFixed(2))} BLY</Div> &nbsp;
                                                <Div fg={'danger'}>({ComUtil.addCommas(MathUtil.roundHalf(MathUtil.multipliedBy(MathUtil.minusBy(orderDetail.mypageBlctToken,orderDetail.usedCouponBlyAmount),orderDetail.orderBlctExchangeRate)))}원)</Div>
                                            </Flex>
                                        </Right>
                                    </Flex>
                                }

                                <HrThin m={0} mb={16} />

                                <Flex mb={16} fontSize={14}>
                                    <Div bold alignItems={'center'}>결제금액</Div>&nbsp;
                                    {
                                        orderPayMethod !== "blct" &&
                                        <Div>
                                            ({orderDetail.pgProvider === 'uplus' ? orderDetail.cardName : getCardPgName(orderDetail.pgProvider)})
                                        </Div>
                                    }
                                    <Right bold fontSize={20}>{ComUtil.addCommas(orderDetail.mypageCardPrice)}원</Right>
                                </Flex>
                            </Div> :
                            <Flex m={16} fontSize={15}>
                                <Title mb={16}>결제상세</Title>
                                <Right bold fontSize={20} fg={'green'}>증정품</Right>
                            </Flex>
                        }

                        <HrThin m={0} mb={16} />

                        <Div m={16}>
                            {
                                //주문취소시 총 환불금액 표시
                                !orderDetail.onePlusSubFlag && ((orderPayStatus === "cancelled") || (orderPayStatus === "revoked")) ?
                                    <Div>
                                        <Title mb={16}>환불상세</Title>
                                        <Flex mb={10}>
                                            <Div>환불금액</Div>
                                            <Right bold fg={'danger'} fontSize={20}>{ComUtil.addCommas(orderDetail.mypageCardPrice)}원</Right>
                                        </Flex>
                                        <Flex mb={10}>
                                            <Div>환불 BLY</Div>
                                            <Right>
                                                <Flex>
                                                    <Div fg={'bly'}>{ComUtil.addCommas(MathUtil.minusBy(orderDetail.mypageBlctToken,orderDetail.usedCouponBlyAmount).toFixed(2))} BLY</Div> &nbsp;
                                                    <Div fg={'danger'}>({ComUtil.addCommas(MathUtil.roundHalf(MathUtil.multipliedBy(MathUtil.minusBy(orderDetail.mypageBlctToken,orderDetail.usedCouponBlyAmount),orderDetail.orderBlctExchangeRate)))}원)</Div>
                                                </Flex>
                                            </Right>
                                        </Flex>
                                    </Div>
                                    : null


                                    // <Div>
                                    //     <Flex mb={16}>
                                    //         <Title alignItems={'center'} fontSize={16}>환불금액</Title>
                                    //         {orderDetail.onePlusSubFlag ?
                                    //             <Right bold fontSize={20}> - </Right>
                                    //             :
                                    //             <Right bold fontSize={20} fg={'danger'}>
                                    //                 {
                                    //                     orderDetail.usedCouponNo ?
                                    //                         orderPayMethod === 'blct' ?
                                    //                             ComUtil.addCommas((ComUtil.toNum(orderDetail.mypageBlctToken) - ComUtil.toNum(orderDetail.usedCouponBlyAmount)).toFixed(2))
                                    //                             :
                                    //                             //ComUtil.addCommas(ComUtil.roundDown((ComUtil.toNum(orderDetail.orderPrice) - ComUtil.toNum(ComUtil.doubleMultiple(orderDetail.usedCouponBlyAmount, orderDetail.orderBlctExchangeRate))), 0))
                                    //                             ComUtil.addCommas(ComUtil.roundDown( MathUtil.minusBy(orderDetail.mypageOrderPrice, MathUtil.multipliedBy(orderDetail.usedCouponBlyAmount, orderDetail.orderBlctExchangeRate)), 0))
                                    //                         :
                                    //                         orderPayMethod === 'blct' ?
                                    //                             ComUtil.addCommas((ComUtil.toNum(orderDetail.mypageBlctToken).toFixed(2)))
                                    //                             :
                                    //                             ComUtil.addCommas(ComUtil.toNum(orderDetail.mypageOrderPrice))
                                    //                 }
                                    //                 {orderPayMethod === "blct" ? ' BLY' : ' 원'}
                                    //             </Right>
                                    //         }
                                    //     </Flex>
                                    // </Div>:null

                                /** 이전 예약상품 취소수수료 제거
                                        <Div>
                                            {
                                                    //주문취소시 취소수수료 표시
                                                    (orderPayStatus === 'cancelled' && orderDetail.directGoods !== true) ?
                                                        <Flex fontSize={12} mb={3}>
                                                            <Div fg={'adjust'}>취소수수료</Div>
                                                            <Right>
                                                                (-)
                                                                {
                                                                    orderPayMethod === "blct" ?
                                                                        ComUtil.addCommas(ComUtil.toNum(orderDetail.cancelBlctTokenFee))
                                                                        :
                                                                        ComUtil.addCommas(ComUtil.toNum(orderDetail.cancelFee))
                                                                }
                                                                {orderPayMethod === "blct" ? ' BLY' : ' 원'}
                                                            </Right>
                                                        </Flex> : null
                                            }
                                            {
                                                orderPayMethod !== "blct" &&
                                                <Flex mb={3}>
                                                    <Div fg={'adjust'}>
                                                        {getCardPgName(orderDetail.pgProvider)}
                                                    </Div>
                                                    <Right>{ComUtil.addCommas(ComUtil.toNum(orderDetail.cardPrice)-ComUtil.toNum(orderDetail.cancelFee))}원</Right>
                                                </Flex>
                                            }
                                            <Flex mb={3}>
                                                <Div fg={'adjust'}>BLY</Div>
                                                {
                                                    !orderDetail.onePlusSubFlag && orderPayMethod === "blct" ?
                                                        <Right>
                                                            <Icon name={'blocery'} />&nbsp;
                                                            {ComUtil.addCommas((ComUtil.toNum(orderDetail.blctToken)-ComUtil.toNum(orderDetail.cancelBlctTokenFee)-ComUtil.toNum(orderDetail.usedCouponBlyAmount)).toFixed(2))} BLY &nbsp;
                                                            <small>({ComUtil.addCommas(ComUtil.roundDown((ComUtil.toNum(orderDetail.blctToken)-ComUtil.toNum(orderDetail.cancelBlctTokenFee)-ComUtil.toNum(orderDetail.usedCouponBlyAmount))*orderDetail.orderBlctExchangeRate,1))}원)</small>
                                                        </Right>
                                                        :
                                                        orderPayMethod === "cardBlct" ?
                                                            orderDetail.usedCouponNo && orderDetail.blctToken != orderDetail.usedCouponBlyAmount ?
                                                                <Right>
                                                                    <Icon name={'blocery'} />&nbsp;
                                                                    { ComUtil.roundDown(ComUtil.addCommas(ComUtil.doubleSub(orderDetail.blctToken,orderDetail.usedCouponBlyAmount)),2)} BLY &nbsp;
                                                                    <small>({ComUtil.addCommas(ComUtil.roundDown((ComUtil.toNum(orderDetail.blctToken)-ComUtil.toNum(orderDetail.usedCouponBlyAmount)-ComUtil.toNum(orderDetail.cancelBlctTokenFee))*orderDetail.orderBlctExchangeRate, 1))}원)</small>
                                                                </Right>
                                                                :
                                                                <Right>
                                                                    <Icon name={'blocery'} />&nbsp;
                                                                    <span>
                                                                        {ComUtil.roundDown(ComUtil.addCommas((ComUtil.toNum(orderDetail.blctToken)-ComUtil.toNum(orderDetail.cancelBlctTokenFee)-ComUtil.toNum(orderDetail.usedCouponBlyAmount))),2)}BLY &nbsp;
                                                                    </span>
                                                                    <small>({ComUtil.addCommas(ComUtil.roundDown((ComUtil.toNum(orderDetail.blctToken)-ComUtil.toNum(orderDetail.cancelBlctTokenFee)-ComUtil.toNum(orderDetail.usedCouponBlyAmount))*orderDetail.orderBlctExchangeRate, 1))}원)</small>
                                                                </Right>
                                                        :
                                                        <Right>-</Right>
                                                }
                                            </Flex>
                                            {
                                                (orderDetail.usedCouponNo && !orderDetail.dealGoods)?
                                                    <Flex>
                                                        <Right fg={'danger'}><small>* 사용한 쿠폰은 주문 취소 후 재발급되지 않습니다.</small></Right>
                                                    </Flex> : null
                                            }
                                        </Div>
                                    </Div>
                                    :
                                    null
                                 */
                            }
                            <br/>
                            <ModalWithNav show={this.state.deliveryModal} title={'배송지 수정'} onClose={this.updateDeliveryCallback} noPadding>
                                <UpdateAddress
                                    orderSeq={orderDetail.orderSeq}
                                    orderSubGroupNo={orderDetail.orderSubGroupNo}
                                    receiverZipNo={orderDetail.receiverZipNo}
                                    receiverAddr={orderDetail.receiverAddr}
                                    receiverRoadAddr={orderDetail.receiverRoadAddr}
                                    receiverAddrDetail={orderDetail.receiverAddrDetail}
                                    receiverPhone={orderDetail.receiverPhone}
                                    receiverName={orderDetail.receiverName}
                                    deliveryMsg={orderDetail.deliveryMsg}
                                    commonEnterPwd={orderDetail.commonEnterPwd}
                                />
                            </ModalWithNav>
                        </Div>

                        {
                            this.state.isOpen &&(
                                <ModalWithNav show={this.state.isOpen} title={'배송조회'} onClose={this.onClose} noPadding={true}>
                                    <div style={{width: '100%',minHeight: '450px'}}>
                                        <h6>
                                            <span>[{orderDetail.transportCompanyName}]</span> <span> {(orderDetail.transportCompanyCode !== '98' && orderDetail.transportCompanyCode !== '99') && "운송장번호: "}{orderDetail.trackingNumber}</span>
                                        </h6>
                                        <div>
                                            {
                                                (orderDetail.transportCompanyCode !== '98' && orderDetail.transportCompanyCode !== '99') &&
                                                    <Span fontSize={12} fg={'secondary'}>* 배송조회오류일경우 <A href={this.state.trackingOtherUrl} target={'_blank'} fontSize={12} fg={'primary'}><u>배송추적</u></A> 클릭</Span>
                                            }
                                        </div>
                                        {
                                            (orderDetail.transportCompanyCode !== '98' && orderDetail.transportCompanyCode !== '99') &&
                                                <iframe src={this.state.trackingUrl}
                                                        width={'100%'}
                                                        style={{minHeight:'450px', border: '0'}}>
                                                </iframe>
                                        }
                                    </div>
                                </ModalWithNav>
                            )
                        }
                    </>
                }
            </Fragment>

        )
    }
}
export default withRouter(OrderDetail)