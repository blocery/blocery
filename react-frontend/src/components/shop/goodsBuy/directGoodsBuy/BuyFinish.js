import React, {Fragment, Component } from 'react'
import axios from 'axios'
import { map } from 'lodash'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { Server } from '~/components/Properties'
import ComUtil from '~/util/ComUtil'
import {autoLoginCheckAndTry, getLoginUser} from '~/lib/loginApi'
import { getOrdersByOrderGroupNo } from '~/lib/shopApi'
import { Webview } from '~/lib/webviewApi'
import { BLCT_TO_WON } from "~/lib/exchangeApi"
import { toast } from 'react-toastify'     //토스트
import 'react-toastify/dist/ReactToastify.css'

import {Div, Right, Flex, Span, Img, Sticky, Fixed, GridColumns, Divider, Hr} from '~/styledComponents/shared/Layouts'
import {Button} from '~/styledComponents/shared/Buttons'
import BackNavigation from "~/components/common/navs/BackNavigation";
import {BsCheckCircle} from 'react-icons/bs'
import CloseNavigation from "~/components/common/navs/CloseNavigation";
import TG from "~/components/common/tg/TG";
import MathUtil from "~/util/MathUtil";

class BuyFinish extends Component {

    constructor(props) {
        super(props);

        this.state = {
            headTitle: null,
            imp_uid: "",
            merchant_uid: "",
            imp_success: false,
            resultStatus: false,
            error_msg: "",

            loginInfo: {},
            orderGroup: null,
            orderSubGroupList: null,
            orders: null,
            directGoods: null,
            blctToWon: '',           // BLCT 환율
            sumOrders: null
        }
    }

    //react-toastify  usage: this.notify('메세지', toast.success/warn/error);
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    }

    async componentDidMount() {

        //로그인 체크
        const consumerLoginInfo = await getLoginUser();
        if (!consumerLoginInfo) { //미 로그인 시 로그인 창으로 이동.
            //자동 로그인 시도(아래 다시 체크 구문을 생략)
            const loginUser = await autoLoginCheckAndTry();
            if(!loginUser){
                this.props.history.push('/login');
            }
        }

        // const {data:blctToWon} = await BLCT_TO_WON();
        // this.setState({
        //     blctToWon: blctToWon
        // })

        const params = new URLSearchParams(this.props.location.search);

        let imp_success = params.get('imp_success') === 'true' ? true : false;

        let imp_uid = params.get('imp_uid')||'';            //아임포트ID
        let merchant_uid = params.get('merchant_uid')||'';  //주문그룹번호(=OrderGroupNo)
        let error_msg = params.get('error_msg');            //에러메시지

        let isScheduled = false;
        if(merchant_uid.length > 0) {
            // 빌링키용 B가 있을경우 예약 주문을 뜻함
            if(merchant_uid.includes("B")){
                merchant_uid = merchant_uid.replace(/B/g,"");
                isScheduled = true;
            }
        }

        //결제성공여부
        if(imp_success) {

            // PG 결제일경우
            if (imp_uid.length > 0) {

                //this.notify('결제검증.', toast.warn);

                //결제성공 후 결제검증페이지 처리 -> 주문내역등록등.
                //[1] 서버단에서 결제정보 조회를 위해 jQuery ajax로 imp_uid 전달하기
                axios(
                    Server.getRestAPIHost() + "/iamport/paycomplate",
                    {
                        method: "post",
                        headers: {"Content-Type": "application/json"},
                        data: {
                            impUid: imp_uid,
                            merchantUid: merchant_uid
                        },
                        withCredentials: true,
                        credentials: 'same-origin'
                    }
                ).then(async ({data}) => {

                    console.log(data);

                    const resultMessage = data.resultMessage;

                    //결제성공
                    if (data.resultStatus === "success" ||
                        data.resultStatus == "orderT" ||
                        data.resultStatus == "scheduled")
                    {
                        // 정상적인 결제 정보로 주문그룹번호로 주문그룹 및 주문내역 조회
                        await this.getOrdersInfo({
                            impSuccess: imp_success,
                            impUid: imp_uid,
                            errorMsg: error_msg,
                            loginInfo: consumerLoginInfo,
                            merchantUid: merchant_uid
                        });
                    }

                    //아임포트 REST API로부터 고유 UID가 같을경우 => 결제정보확인 및 서비스 루틴이 정상적이지 않으면
                    if (data.resultStatus == "failed" ||
                        data.resultStatus == "scheduledFailed" ||
                        data.resultStatus == "forgery" ||
                        data.resultStatus == "scheduledForgery" ||
                        data.resultStatus == "remainCancel" ||
                        data.resultStatus == "orderF"||
                        data.resultStatus == "blocked"
                    ) {
                        let v_headTitle = '결제실패';
                        let v_errMsg = '';
                        if (data.resultStatus == "failed" || data.resultStatus == "forgery"){
                            v_errMsg = '비정상적인 결제로 인해 주문취소 처리 되었습니다.';
                        }
                        if (data.resultStatus == "scheduledFailed") {
                            v_headTitle = '주문예약 결제실패';
                            v_errMsg = resultMessage;
                        }
                        if (data.resultStatus == "scheduledForgery"){
                            v_headTitle = '주문예약 결제실패';
                            v_errMsg = '비정상적인 결제로 인해 주문예약취소 처리 되었습니다.';
                        }
                        if (data.resultStatus == "remainCancel"){
                            v_errMsg = '재고소진으로 인해 주문취소 처리 되었습니다.';
                        }
                        if (data.resultStatus == "orderF") {
                            v_headTitle = '주문정보없음';
                            v_errMsg = '주문정보가 존재하지 않습니다.';
                        }
                        if (data.resultStatus == "blocked") {
                            v_headTitle = '결제실패';
                            v_errMsg = '어뷰징 유사 사례로 판단되어 자동 차단 되었습니다. 고객센터 메일 cs@blocery.io 로 문의 부탁 드립니다.';
                        }
                        if (data.resultStatus == "failedBlct") {
                            v_errMsg = 'BLY전송오류로 인해 결제실패했습니다. 다시 주문해주세요.';
                        }

                        this.setState({
                            headTitle: v_headTitle,
                            resultStatus: false,
                            imp_uid: imp_uid,
                            merchant_uid: merchant_uid,
                            imp_success: false,
                            error_msg: v_errMsg
                        });
                    }

                });

            } else{
                // 정상적인 결제 정보로 주문그룹번호로 주문그룹 및 주문내역 조회
                await this.getOrdersInfo({
                    impSuccess:imp_success,
                    impUid:imp_uid,
                    errorMsg:error_msg,
                    loginInfo:consumerLoginInfo,
                    merchantUid:merchant_uid
                });

            }
        } else {
            //결제실패
            this.setState({
                headTitle: "결제실패",
                imp_uid: imp_uid,
                merchant_uid: merchant_uid,
                imp_success: false,
                error_msg: error_msg
            });
        }
    }

    getSumOrders = (subGroupList, orders) => {
        const orderBlctExchangeRate = orders[0].orderBlctExchangeRate;

        let sumWon = 0
        let sumBlctToken = 0
        let totalGoodsPrice = 0
        let totalDeliveryFee = 0
        let totalCouponBlct = 0
            // sumExchangedBlctToWon = 0

        //orderBlctExchangeRate
        orders.map(order => {
            sumBlctToken += order.blctToken
            sumWon += order.cardPrice
            totalGoodsPrice += order.orderPrice
            // sumExchangedBlctToWon += order.blctToken * order.orderBlctExchangeRate
        })

        subGroupList.map(subGroup => {
            sumBlctToken = sumBlctToken + MathUtil.minusBy(subGroup.deliveryBlctToken,subGroup.usedCouponBlyAmount);
            sumWon += subGroup.deliveryCardPrice
            totalDeliveryFee += subGroup.deliveryFee
            totalCouponBlct += subGroup.usedCouponBlyAmount
        })

        const sumExchangedBlctToWon = MathUtil.roundHalf(MathUtil.multipliedBy(sumBlctToken,orderBlctExchangeRate));

        const totalCouponWon = MathUtil.roundHalf(MathUtil.multipliedBy(totalCouponBlct,orderBlctExchangeRate));

        return {
            sumBlctToken,
            sumExchangedBlctToWon : sumExchangedBlctToWon,
            sumWon,
            totalGoodsPrice,
            totalDeliveryFee,
            totalCouponBlct,
            totalCouponWon
        }
    }

    getOrdersInfo = async ({impSuccess, impUid, errorMsg, loginInfo, merchantUid}) => {
        // 정상적인 결제 정보로 주문그룹번호로 주문그룹 및 주문내역 조회
        const {data: returnedOrders} = await getOrdersByOrderGroupNo(merchantUid);
        const {orderGroup: r_OrderGroup, orderSubGroupList: r_OrderSubGroupList, orderDetailList: r_OrderList} = returnedOrders;

        if (r_OrderGroup !== null && r_OrderList !== null) {

            let headTitle = '구매완료';
            // 주문그룹정보 예약됨(실행되기 전) 상태여부 체크
            if(r_OrderGroup.payStatus === 'scheduled'){
                headTitle = '예약완료';
            }

            // const result = map(r_OrderList, async (order) => {
            //     let {data: goods} = await getGoodsByGoodsNo(order.goodsNo);
            //     order.consumerPrice = goods.consumerPrice;
            // });

            // Promise.all(result).then((response) => {

            const sumOrders = this.getSumOrders(r_OrderSubGroupList, r_OrderList)

            this.setState({
                headTitle: headTitle,
                resultStatus: true,

                imp_uid: impUid,
                merchant_uid: merchantUid,
                imp_success: impSuccess,
                error_msg: errorMsg,

                loginInfo: loginInfo,
                orderGroup: r_OrderGroup,
                orderSubGroupList: r_OrderSubGroupList,
                orders: r_OrderList,
                sumOrders: sumOrders
            });
            // })

        } else {
            this.setState({
                headTitle: "주문정보없음",
                resultStatus: false,
                imp_uid: impUid,
                merchant_uid: merchantUid,
                imp_success: false,
                error_msg: "주문정보가 존재하지 않습니다."
            });
        }
    }

    //array의 첫번째 이미지 썸네일 url 리턴
    /*
    getFirstImageUrl = (goodsImages) => {
        if (!goodsImages)
            return '';

        const image = goodsImages.filter((v, idx) => { return idx === 0;}) //첫번째 이미지
        if (image.length === 1) {
            return Server.getThumbnailURL() + image[0].imageUrl;
        }
        return '';
    };
    */
    // 주문정보안 상품 이미지
    getFirstImgUrl = (orderImg) => {
        if (!orderImg) return '';

        return Server.getThumbnailURL() + orderImg;
    };


    // onConfirmClick = () => {
    //     Webview.closePopupAndMovePage('/mypage')
    // };

    onContinueClick = () => {
        // this.props.history.push('/main/recommend');
        // Webview.closePopupAndMovePage('/home/1')
        Webview.closePopupAndMovePage('/')
    };

    failed_render_comp = () => {
        return(
            <Fragment>
                {/*<ShopXButtonNav home underline> {this.state.headTitle} </ShopXButtonNav>*/}
                <BackNavigation>{this.state.headTitle}</BackNavigation>

                <div className={'text-center pt-3'}>
                    { this.state.error_msg }
                </div>
                <hr/>
                <div className={'d-flex p-1'}>
                    <div className={'flex-grow-1 p-1'}>
                        <Button color='dark' block onClick={this.onContinueClick}> 계속 쇼핑하기 </Button>
                    </div>
                </div>

                {/*<ToastContainer/>*/}
            </Fragment>
        )
    }

    render() {
        if(!this.state.imp_success){
            return(this.failed_render_comp())
        }

        // if (!this.state.orders || !this.state.blctToWon) return null;
        if (!this.state.orders) return null;
        if(this.state.imp_success){
            if(this.state.resultStatus)
            {
                return(
                    <Div pb={70}>
                        {/*<ShopXButtonNav home underline> {this.state.headTitle} </ShopXButtonNav>*/}
                        {/*<BackNavigation onBackClick={this.onContinueClick}>{this.state.headTitle}</BackNavigation>*/}
                        <CloseNavigation onCloseClick={this.onContinueClick}>
                         <Div pl={16}>
                            {this.state.headTitle}
                         </Div>
                        </CloseNavigation>
                        <Div p={16} >
                            <Flex flexDirection={'column'} justifyContent={'center'} bg={'green'} fg={'white'} height={160} rounded={3} lineHeight={'1.7'}>
                                <Div><BsCheckCircle size={37}/></Div>

                                {/*카드결제시 totalOrderPrice=0임, coupon사용금액을 빼고 보여주도록 수정 20211026*/}
                                <Div fontSize={22} bold>
                                    {
                                        // this.state.orderGroup.dealGoods ?
                                        //     `${ComUtil.addCommas(this.state.orderGroup.totalOrderPrice - ComUtil.roundDown(this.state.sumOrders.totalCouponWon.toFixed(0)))}원 결제`
                                        //     :
                                            `${ComUtil.addCommas(this.state.orderGroup.totalOrderPrice)}원 결제`
                                    }
                                    {this.state.orderGroup.payStatus === 'scheduled' ? ' 예약' : ''}
                                </Div>

                                <Div fontSize={17} >
                                    {
                                        this.state.orderGroup.payStatus === 'scheduled' ?
                                            '예약 주문 신청이 완료되었습니다.' :
                                            '주문이 완료되었습니다.'
                                    }
                                </Div>
                            </Flex>
                        </Div>
                        <Divider />

                        <Div p={16}>
                            {/*<Flex fontSize={16} pb={16}>*/}
                            {/*    <Div fw={900}>주문번호</Div>*/}
                            {/*    <Right>{this.state.orderGroup.orderGroupNo}</Right>*/}
                            {/*</Flex>*/}

                            {/*<Div fontSize={12} mb={16}>주문번호 {this.state.orderGroup.orderGroupNo}</Div>*/}
                            <GridColumns repeat={1} colGap={0} rowGap={16}>
                                {
                                    map(this.state.orders, (order,idx) =>
                                        <Flex key={'orderGoods'+idx} bg='white' alignItems='flex-start'>
                                            <Div width={63} height={63} mr={14} flexShrink={0}>
                                                <Img cover src={this.getFirstImgUrl(order.orderImg)} alt="상품이미지" />
                                            </Div>
                                            <Div fontSize={12} fg='dark' flexGrow={1}>
                                                <Div mb={4} fontSize={14} fg={'black'}>{order.goodsNm}</Div>
                                                {/*{order.dealGoods ?*/}
                                                {/*    <Div mb={4} >[옵션] {order.optionName}</Div>*/}
                                                {/*    : null*/}
                                                {/*}*/}
                                                {/*<Flex>*/}
                                                {/*    <Div minWidth={90}>주문일련번호</Div>*/}
                                                {/*    <Div>{order.orderSeq}</Div>*/}
                                                {/*</Flex>*/}

                                                <Div lineHeight={25}>
                                                    <Flex>
                                                        <Div>수량</Div>
                                                        <Right>{ComUtil.addCommas(order.orderCnt)}개</Right>
                                                    </Flex>

                                                    <Flex>
                                                        <Div>금액</Div>
                                                        <Right>{ComUtil.addCommas(order.orderPrice)} 원 {(order.payMethod.startsWith('card'))? '': '(' + ComUtil.addCommas(order.blctToken) +'BLY)'}</Right>
                                                    </Flex>

                                                    <Flex>
                                                        <Div>배송예정</Div>
                                                        <Right>
                                                            {
                                                                order.hopeDeliveryFlag ?
                                                                    `희망 수령일에 맞게 배송 예정`
                                                                    :
                                                                    order.directGoods ?
                                                                        `구매 후 3일 이내 발송`
                                                                        :
                                                                        (order.expectShippingStart && order.expectShippingEnd) && `${ComUtil.utcToString(order.expectShippingStart)} ~ ${ComUtil.utcToString(order.expectShippingEnd)}`
                                                            }
                                                        </Right>
                                                    </Flex>
                                                </Div>


                                                {
                                                    order.hopeDeliveryFlag && (
                                                        <Flex>
                                                            <Div minWidth={90}>희망수령일</Div>
                                                            <Div>{ComUtil.utcToString(order.hopeDeliveryDate)}</Div>
                                                        </Flex>
                                                    )
                                                }
                                                {/*<Div>주문일련번호 : {order.orderSeq}</Div>*/}
                                                {/*<Div>수량 : {ComUtil.addCommas(order.orderCnt)}개</Div>*/}
                                                {/*<Div>금액 : {ComUtil.addCommas(order.orderPrice)} 원 {(order.payMethod.startsWith('card'))? '': '(' + ComUtil.addCommas(order.blctToken) +'BLY)'}</Div>*/}
                                                {/*<Div>배송예정 :*/}
                                                {/*{*/}
                                                {/*order.expectShippingStart ?*/}
                                                {/*` ${ComUtil.utcToString(order.expectShippingStart)} ~ ${ComUtil.utcToString(order.expectShippingEnd)}` :*/}
                                                {/*` 구매 후 3일 이내`*/}
                                                {/*}*/}
                                                {/*</Div>*/}
                                            </Div>
                                        </Flex>
                                    )
                                }
                            </GridColumns>
                        </Div>
                        <Divider />

                        <Div px={16} py={20}>
                            <Div fw={900} fontSize={16} pb={16}>결제요약</Div>
                            <GridColumns repeat={1} colGap={0} rowGap={16}>
                                <Flex fontSize={13}>
                                    <Div>상품가격</Div>
                                    <Right>
                                        {`${ComUtil.addCommas(this.state.sumOrders.totalGoodsPrice)} 원`}
                                    </Right>
                                </Flex>
                                {
                                    this.state.sumOrders.totalCouponBlct > 0 &&
                                    <Flex fontSize={13}>
                                        <Div>쿠폰 사용</Div>
                                        {/*<Right>*/}
                                        {/*    {`${ComUtil.addCommas(ComUtil.roundDown(this.state.sumOrders.totalCouponBlct,2))} BLY ( - ${ComUtil.addCommas(ComUtil.roundDown(this.state.sumOrders.totalCouponWon, 0))} 원)`}*/}
                                        {/*</Right>*/}
                                        <Right fg={'danger'}>
                                            {
                                                `- ${ComUtil.addCommas(ComUtil.roundDown(this.state.sumOrders.totalCouponWon, 0))} 원`
                                            }
                                        </Right>
                                    </Flex>
                                }
                                <Flex fontSize={13}>
                                    <Div>배송비</Div>
                                    <Right>
                                        {`${this.state.sumOrders.totalDeliveryFee > 0 ? '+' : ''} ${ComUtil.addCommas(this.state.sumOrders.totalDeliveryFee)} 원`}
                                    </Right>
                                </Flex>
                                <Flex alignItems={'flex-start'} fontSize={13}>
                                    <Div>BLY 토큰 사용</Div>
                                    <Right textAlign={'right'}>
                                        {
                                            // this.state.sumOrders.totalCouponBlct > 0 ?
                                                <Div>

                                                    {
                                                        (this.state.sumOrders.sumBlctToken > 0) ?
                                                            `${ComUtil.addCommas(ComUtil.roundDown(this.state.sumOrders.sumBlctToken, 2))} BLY
                                                    ( - ${ComUtil.addCommas(ComUtil.roundDown(this.state.sumOrders.sumExchangedBlctToWon, 0))} 원)`
                                                            : '0BLY (0원)'
                                                    }

                                                    {/*{*/}
                                                    {/*    (this.state.sumOrders.sumBlctToken > this.state.orders[0].usedCouponBlyAmount) ?*/}
                                                    {/*        `${ComUtil.addCommas(ComUtil.roundDown((this.state.sumOrders.sumBlctToken - this.state.orders[0].usedCouponBlyAmount), 2))} BLY*/}
                                                    {/*( - ${ComUtil.addCommas(ComUtil.roundDown((this.state.sumOrders.sumBlctToken - this.state.orders[0].usedCouponBlyAmount) * this.state.blctToWon, 0))} 원)`*/}
                                                    {/*        : '0BLY (0원)'*/}
                                                    {/*}*/}
                                                </Div>
                                                // :
                                                // <Div>
                                                //     {`${ComUtil.addCommas(ComUtil.roundDown(this.state.sumOrders.sumBlctToken,2))} BLY ( - ${ComUtil.addCommas(ComUtil.roundDown(this.state.sumOrders.sumExchangedBlctToWon, 0))} 원)`}
                                                // </Div>

                                        }
                                    </Right>
                                </Flex>
                                <Flex bold fontSize={16}>
                                    <Div fw={900}>최종 결제 금액</Div>
                                    <Right fg={'green'} bold>
                                        {`${ComUtil.addCommas(this.state.orderGroup.totalOrderPrice)} 원`}
                                        {//배송비 쿠폰용으로 적용하려했으나 오류 `${ComUtil.addCommas(this.state.orderGroup.totalOrderPrice - ComUtil.roundDown(this.state.sumOrders.totalCouponWon.toFixed(0)))} 원`
                                         }
                                    </Right>
                                </Flex>
                            </GridColumns>
                        </Div>

                        <Fixed bottom={0} width={'100%'} bg={'white'}>
                            <Div p={16}>
                                <GridColumns repeat={1} height={52} fontSize={16} colGap={0}>
                                    <Button fg='white' bg='green' block bold height={'100%'} custom={`border-top-right-radius: 0; border-bottom-right-radius: 0;`} onClick={this.onContinueClick}>계속 쇼핑하기</Button>
                                    {/*<Button fg='white' bg='green' bold height={'100%'} custom={`border-top-left-radius: 0; border-bottom-left-radius: 0;`} onClick={this.onConfirmClick}>마이페이지로 가기</Button>*/}
                                </GridColumns>
                            </Div>
                        </Fixed>

                        {/*{WIDERPLANET SCRIPT START 2022.06.07}*/}
                        {
                            this.state.orders &&
                                <TG ty={"PurchaseComplete"} items={this.state.orders} />
                        }
                        {/*{WIDERPLANET SCRIPT END 2022.06.07}*/}
                    </Div>
                )
            }
        }
    }
}





export default BuyFinish;