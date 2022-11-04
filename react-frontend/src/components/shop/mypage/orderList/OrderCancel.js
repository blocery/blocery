import React, { Component, Fragment } from 'react'
import { Container, Row, Col, ListGroup, ListGroupItem } from 'reactstrap'
import {FaCheck} from 'react-icons/fa'
import Textarea from 'react-textarea-autosize'
import ComUtil from '~/util/ComUtil'
import { BlockChainSpinner, ModalConfirm} from '~/components/common/index'
import { Div, Flex, Button } from '~/styledComponents/shared'
import { getOrderDetailByOrderSeq, addPgWrapOrderCancel, getValidOrderListByOrderGroupNo, getOrderSubGroup, getOrderListBySubGroupNoForCancel } from '~/lib/shopApi'
import { scOntCancelOrderBlct } from '~/lib/smartcontractApi';
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { getServerToday } from '~/lib/commonApi'
import Style from './OrderDetail.module.scss'
import { toast } from 'react-toastify'     //토스트
import OrderCancelItem from './OrderCancelItem'
import classnames from 'classnames'
import BackNavigation from "~/components/common/navs/BackNavigation";
import {withRouter} from 'react-router-dom'
import {getPayMethodPgNm} from "~/util/bzLogic";
import MathUtil from "~/util/MathUtil";


class OrderCancel extends Component {
    constructor(props) {
        super(props);

        //파라미터로 주문정보 가져오기
        const params = new URLSearchParams(this.props.location.search);
        const orderSeq = params.get('orderSeq');

        this.state = {
            orderCancelView:false,

            orderSeq: orderSeq,
            orderInfo: {},
            wrapOrderList : [],  // producerWrapDelivered가 true인 경우에만 group리스트를 모두 넣어주고, 아닌 경우 해당 orderDetail 1개만 리스트에 넣음.
            goodsInfo: {},          // 주문목록에서 선택된 주문에 해당하는 상품의 정보를 저장하는 필드로 directGoods여부를 판단할 때에만 사용중 (묶음배송에 영향 없음)

            chainLoading: false,
            serverToday: {},

            cancelReasonIdx:null,
            cancelReason:null,
            cancelReasonDetail:null,

            isCancelFeeInfoOpen: false,
            refundWon: -1,
            totalCardPrice: 0,  // 묶음배송일때를 대비해서 모든 취소상품의 카드결제 합
            totalBlct: 0,   // 묶음배송일때를 대비해서 모든 취소상품의 BLCT 합
            producerWrapDelivered: false // 생산자 묶음배송 취소여부
        }

        this.cancelFeeTitle="";
        this.cancelTitleSel = [null,null,null,null,null,null,null]; //5 당일취소 추가. 6 즉시상품 추가.
    }

    componentDidMount = async() => {

        //서버 현재일자
        const { data:serverToday } = await getServerToday();
        this.setState({
            serverToday: serverToday
        });

        await this.getOrderDetailInfo();

    }

    getOrderDetailInfo = async () => {
        const {data:orderDetail} = await getOrderDetailByOrderSeq(this.state.orderSeq);

        // 묶음배송시 List를 만드는데, 1개 취소의 경우에도 List에 1개만 넣어서 동일하게 처리함.
        let wrapOrderList = []
        let orderSubGroup;

        //2022.04추가: subGroup이 추가된 이후에는 항상 필요.
        if (orderDetail.orderSubGroupNo > 0) {
            let {data} = await getOrderSubGroup(orderDetail.orderSubGroupNo)
            orderSubGroup = data;
        }

        // 공동구매시 전체취소이기에 주문취소되지 않은 orderDetailList 가져오기
        if(orderDetail.dealGoods) {
            let {data:list} = await getValidOrderListByOrderGroupNo(orderDetail.orderGroupNo);
            wrapOrderList = list;

        } else if (orderDetail.subGroupListSize > 1) { //subGroup 여러건 취소 2022.04 추가////////////////////

            let {data:list} = await getOrderListBySubGroupNoForCancel(orderSubGroup.orderSubGroupNo);
            wrapOrderList = list;


        } else {
            wrapOrderList.push(orderDetail);
        }

        // 주문취소할 전체 상품의 구매한 cardPrice와 blctToken의 합
        let totalCardPrice = 0;
        let totalBlct = 0;
        let orderPayStatus = orderDetail.orderPayStatus; //1개짜리 주문은 여기서 결정.

        wrapOrderList
            .filter(orderDetail => (orderDetail.orderPayStatus !== 'cancelled' && orderDetail.orderPayStatus !== 'revoked'))
            .map((orderDetail) => {
                totalCardPrice = MathUtil.plusBy(totalCardPrice,orderDetail.cardPrice);
                totalBlct = MathUtil.plusBy(totalBlct,orderDetail.blctToken);

                //여러개짜리 주문은 여기서 결정.
                orderPayStatus = orderDetail.orderPayStatus //canncelled나 revoked외에 값이 있으면 설정됨.
            })

        //2022.04 subGroup배송비 추가: subGroup이 추가된 이후에는 항상 필요.
        if (orderSubGroup) {
            totalCardPrice = MathUtil.plusBy(totalCardPrice,orderSubGroup.deliveryCardPrice);
            totalBlct = MathUtil.plusBy(totalBlct,orderSubGroup.deliveryBlctToken);
        }

        console.log(orderSubGroup)

        const goodsInfo = await getGoodsByGoodsNo(orderDetail.goodsNo);
        let totalOrderWon = totalCardPrice;
        totalOrderWon += MathUtil.multipliedBy(totalBlct,orderDetail.orderBlctExchangeRate);
        totalOrderWon = MathUtil.roundHalf(totalOrderWon); // bly 오차때문에 원단위 반올림

        this.setState({
            orderInfo: orderDetail,
            goodsInfo: goodsInfo.data,
            totalOrderWon: totalOrderWon,
            //refundWon: refundWon,
            totalCardPrice: totalCardPrice,
            totalBlct: totalBlct,
            wrapOrderList: wrapOrderList,
            producerWrapDelivered: orderDetail.producerWrapDelivered,
            orderSubGroup: orderSubGroup,

            orderPayStatus: orderPayStatus //옵션여러개 구매시에는 cancelled나 revoked, 아닌것으로 설정.
        });
    };

    //취소버튼 클릭시 취소요청 창 닫음
    onCancel = () => {
        // Webview.closePopup();
        this.setState({
            orderCancelView: false
        })
    }

    // 주문취소 클릭시
    onPayCancel = async (isConfirmed) => {
        if(!isConfirmed) {
            return;
        }

        // const orderDetail = Object.assign({},this.state.orderInfo);
        const wrapOrderList = Object.assign([],this.state.wrapOrderList);
        const orderDetail = wrapOrderList[0];

        let payMethod = orderDetail.payMethod;    //결제구분(blct, card)

        let imp_uid = orderDetail.impUid;         //PG고유번호 (여러건의 주문이라도 한번에 결제하면 모두 동일함)
        // let merchant_uid = orderDetail.orderSeq;  //주문일련번호

        //subGroup단위로 취소할 경우 orderSeq를 merchant_uid_list 여기에 다 넣어줘야 함.
        let merchant_uid_list = []  // 묶음배송 취소할 수 있기에 orderSeq 리스트로 구성 (1개인 경우 1개만)
        wrapOrderList.map( orderDetail => {
            merchant_uid_list.push(orderDetail.orderSeq)
        })

        //TESTCODE
        console.log('onPayCancel:', wrapOrderList, this.state )

        if(payMethod !== "blct"){
            if(imp_uid === null){
                alert("PG내역이 없습니다.");
                return false;
            }
        }

        if(payMethod === "blct"){
            //블록체인스피너 chainLoading=true
            this.setState({chainLoading: true});
            toast.info('주문취소중.');

            // TODO subGroup단위로 취소할 경우 취소할 orderDetail의 blctToken과 subGroup의 배송비 blctToken이 totalBlct에 다 합해져 있는지 확인필요.
            let cancelFee = 0;
            let data = {
                orderGroupNo: orderDetail.orderGroupNo,
                orderSeqList: merchant_uid_list,
                orderSeq: orderDetail.orderSeq,
                cancelFee: cancelFee,
                cancelBlctTokenFee: cancelFee,
                cancelReason: this.state.cancelReason,
                cancelReasonDetail: this.state.cancelReasonDetail,
                goodsPriceBlct: this.state.totalBlct,
                isNotDelivery: false,
                cancelType:1
            };

            this.blctPayCancel(wrapOrderList, data);
        }

        if(payMethod === "card" || payMethod === "cardBlct" ) {
            //블록체인스피너 chainLoading=true
            this.setState({chainLoading: true});
            toast.info('주문취소중.');

            let cancelFee = 0;
            let cancelBlctTokenFee = 0;

            console.log("merchant_uid_list", merchant_uid_list);

            let data = {
                impUid: imp_uid,
                merchantUid: merchant_uid_list[0],
                wrapMerchantUid: merchant_uid_list   // 주문취소 후 DB를 update 해줘야 하기에 orderSeq를 리스트로 보내야 함....
            };
            //주문취소수수료(기본0원)
            data['cancelFee']=cancelFee;
            data['cancelBlctTokenFee']=cancelBlctTokenFee;
            //취소수수료가 0 이상일 경우 파라미터 세팅(주문취소금액)
            //if(cancelFee > 0){
            //주문취소금액 파라미터 생성 (부분취소금액) == PG부분취소금액
            data['amount']=this.state.totalCardPrice;
            //}
            //주문취소사유 및 취소상세사유
            data['cancelReason']=this.state.cancelReason;
            data['cancelReasonDetail']=this.state.cancelReasonDetail;

            data['cancelType'] = 1;

            this.payCancel(wrapOrderList, data);
        }
    };

    //BLCT 주문 취소 : 토큰전송후 DB update까지 모두 처리(2021.2.17)
    blctPayCancel = async (wrapOrderList, data) => {
        let {data:res} = await scOntCancelOrderBlct(data);
        console.log("scOntCancelOrderBlct", res);

        if(res.resultStatus==="success"){
            toast.dismiss();
            toast.success('주문취소가 완료되었습니다');

            wrapOrderList.map( (orderDetail) => {
                if(orderDetail.dealGoods) {
                    orderDetail.payStatus = "revoked";
                } else {
                    orderDetail.payStatus = "cancelled";
                }
                orderDetail.cancelFee = data.cancelFee;
                orderDetail.cancelBlctTokenFee = data.cancelBlctTokenFee;
            })

            this.setState({
                orderInfo: wrapOrderList[0],
                wrapOrderList: wrapOrderList,
                chainLoading: false  //블록체인스피너 chainLoading=false
            });

            //주문상세내역으로 이동
            //Webview.closePopupAndMovePage(`/mypage/orderDetail?orderSeq=${orderDetail.orderSeq}`)
            // Webview.closePopup();
            this.props.history.goBack()
        }

        //이미 취소가 되어있을 경우(다시한번 상태값 취소상태로)
        if(res.resultStatus==="befcancelled"){
            toast.dismiss();
            toast.info('이미 주문취소가 되어있습니다.');

            wrapOrderList.map( (orderDetail) => {
                orderDetail.payStatus = "cancelled"
            })

            this.setState({
                orderInfo: wrapOrderList[0],
                wrapOrderList: wrapOrderList,
                chainLoading: false  //블록체인스피너 chainLoading=false
            });

            //주문상세내역으로 이동
            //Webview.closePopupAndMovePage(`/mypage/orderDetail?orderSeq=${orderDetail.orderSeq}`)
            // Webview.closePopup();
            this.props.history.goBack()
        }

        //취소실패 (bly 전송실패 포함)
        if(res.resultStatus==="failed"){
            toast.dismiss();
            toast.info(res.resultMessage);
            //블록체인스피너 chainLoading=false
            this.setState({chainLoading: false});
        }
    }

    // PG 주문 취소 : 주문완료페이지에서 결제검증후 BLS 처리
    payCancel = async (wrapOrderList, data) => {

        // iamport 취소시 data에 amount를 안 넣으면 전액취소로 처리하는데 subGroup 추가되면서 배송비를 따로 계산해야 해서 전액취소라도 무조건 amount 꼭 넣어주어야 함. (2022.3.21)
        // 현재 1건주문한 것에 대한 전체 취소라도 amount에 값이 있는것 확인함.

        //this.notify('주문취소중.', toast.info);
        let cancelFee = data.cancelFee;
        let cancelBlctTokenFee = data.cancelBlctTokenFee;
        data.customerFlag = true;
        let {data:res} = await addPgWrapOrderCancel(data);

        //주문취소성공
        if(res.resultStatus==="success"){
            toast.dismiss();

            wrapOrderList.map((orderDetail) => {
                // 취소 BLCT 및 BLS  반환 로직 필요 (신용카드구매)
                if(orderDetail.dealGoods) {
                    orderDetail.payStatus = "revoked";
                } else {
                    orderDetail.payStatus = "cancelled";
                }
                orderDetail.cancelFee = cancelFee;
                orderDetail.cancelBlctTokenFee = cancelBlctTokenFee;
            })

            this.setState({
                orderInfo: wrapOrderList[0],
                wrapOrderList: wrapOrderList,
                chainLoading: false  //블록체인스피너 chainLoading=false
            });

            //주문상세내역으로 이동
            //Webview.closePopupAndMovePage(`/mypage/orderDetail?orderSeq=${orderDetail.orderSeq}`)
            //Webview.closePopup();

            this.props.history.goBack()

        }

        //이미 취소가 되어있을 경우(다시한번 상태값 취소상태로)
        if(res.resultStatus==="befcancelled"){
            toast.dismiss();
            toast.info('이미 주문취소가 되어있습니다.');
            wrapOrderList.map((orderDetail) => {
                orderDetail.payStatus = "cancelled";
            })

            this.setState({
                orderInfo: wrapOrderList[0],
                wrapOrderList: wrapOrderList,
                chainLoading: false //블록체인스피너 chainLoading=false
            });

            //주문상세내역으로 이동
            //Webview.closePopupAndMovePage(`/mypage/orderDetail?orderSeq=${orderDetail.orderSeq}`)
            // Webview.closePopup();

            this.props.history.goBack()
        }

        //취소실패
        if(res.resultStatus==="failed"){
            toast.dismiss();
            toast.info(res.resultMessage);
            //블록체인스피너 chainLoading=false
            this.setState({chainLoading: false});
        }
    };

    // 취소사유 선택
    onCancelReasonClick = (key,val) => {
        let v_cancelReasonIdx = key;
        let v_cancelReasonVal = val;
        this.setState({
            cancelReasonIdx: v_cancelReasonIdx,
            cancelReason: v_cancelReasonVal
        })
    }

    // 취소 상세 사유 텍스트 박스
    onCancelReasonDetailChange = (e) => {
        this.setState({
            cancelReasonDetail: e.target.value
        })
    }

    //취소사유 다음 버튼 클릭
    onCancelReasonNextStep = () => {

        // 취소사유, 취소상세사유
        let v_CancelReason = this.state.cancelReason;
        let v_CancelReasonDetail = this.state.cancelReasonDetail;

        if(!v_CancelReason){
            toast.dismiss();
            toast.info("취소 사유를 선택해 주시기 바랍니다.");
            return
        }else{

            this.setState({
                orderCancelView: true,
                cancelReason : v_CancelReason,
                cancelReasonDetail : v_CancelReasonDetail
            })
        }

    }

    //옵션상품 이전 주문금액 (refundWon)
    getBeforeOptionGoodsRefundStr = (orderDetail) =>{
        let blctMinusCoupon = MathUtil.minusBy(orderDetail.mypageBlctToken, orderDetail.usedCouponBlyAmount);
              //card주문
        return ComUtil.addCommas(orderDetail.mypageCardPrice) + '원' +
               //blct(쿠폰 제외)
              ((blctMinusCoupon) === 0 ? '': ' + ' + blctMinusCoupon.toFixed(2) + 'BLY')
    }

    render() {
        let orderDetail = this.state.orderInfo;
        let goods = this.state.goodsInfo;

        let orderPayCardName = orderDetail.cardName;

        let orderPayMethod = orderDetail.payMethod;
        //state로 변경 let orderPayStatus = orderDetail.payStatus;


        let modalContent = '(당일취소는 전액환불)취소시 발생한 수수료를 제외한 차감된 금액을 환불받습니다';
        if(goods.directGoods) {
            modalContent = '즉시상품은 전액 환불됩니다';
        } else if(goods.dealGoods) {
            modalContent = '공동구매 상품은 옵션상품포함 전체 취소됩니다.';
        }
        let r_pay_cancel_btn = <ModalConfirm title={<span className={'text-danger'}>취소요청을 하시겠습니까?</span>}
                                              content={modalContent}
                                              onClick={this.onPayCancel}>
            <Button height={55} block bg={'green'} fg={'white'} rounded={3}>취소요청</Button>
        </ModalConfirm>;
        let r_pay_cancel_btn_view = null;

        //예상배송일 기준
        //if(orderDetail.expectShippingStart) {
            if(this.state.orderPayStatus !== 'cancelled'){
                // 운송장번호 입력 전이면 취소요청 버튼 활성화
                if(!orderDetail.trackingNumber){
                    r_pay_cancel_btn_view = r_pay_cancel_btn;
                }
            }
        //}

        return (
            <Fragment>
                {
                    this.state.chainLoading && <BlockChainSpinner/>
                }
                {/*<ShopXButtonNav close fixed> 주문 취소 요청 </ShopXButtonNav>*/}
                <BackNavigation>주문 취소 요청</BackNavigation>
                <br />

                {
                    /* 주문취소 사유 정보 화면 */
                    !this.state.orderCancelView &&
                        <Div p={16}>
                            <Div>
                                <Div mb={8} fw={500}>취소사유를 선택해 주세요</Div>
                                <Div>
                                    <ListGroup>
                                        <ListGroupItem
                                            color={this.state.cancelReasonIdx == 0 ? "success":""}
                                            onClick={this.onCancelReasonClick.bind(this, '0','단순 변심')}>
                                            <span className='pr-3'>
                                                {this.state.cancelReasonIdx == 0 ? <FaCheck />:""}
                                            </span>
                                            <span>
                                                단순 변심
                                            </span>
                                        </ListGroupItem>
                                        <ListGroupItem
                                            color={this.state.cancelReasonIdx == 1 ? "success":""}
                                            onClick={this.onCancelReasonClick.bind(this, '1','주문 실수')}>
                                            <span className='pr-3'>
                                                {this.state.cancelReasonIdx == 1 ? <FaCheck />:""}
                                            </span>
                                            <span>
                                                주문 실수
                                            </span>
                                        </ListGroupItem>
                                        <ListGroupItem
                                            color={this.state.cancelReasonIdx == 2 ? "success":""}
                                            onClick={this.onCancelReasonClick.bind(this, '2','서비스 불만족')}>
                                            <span className='pr-3'>
                                                {this.state.cancelReasonIdx == 2 ? <FaCheck />:""}
                                            </span>
                                            <span>
                                                서비스 불만족
                                            </span>
                                        </ListGroupItem>
                                        <ListGroupItem
                                            color={this.state.cancelReasonIdx == 3 ? "success":""}
                                            onClick={this.onCancelReasonClick.bind(this, '3','배송 기간에 부재')}>
                                            <span className='pr-3'>
                                                {this.state.cancelReasonIdx == 3 ? <FaCheck />:""}
                                            </span>
                                            <span>
                                                배송 기간에 부재
                                            </span>
                                        </ListGroupItem>
                                        <ListGroupItem
                                            color={this.state.cancelReasonIdx == 4 ? "success":""}
                                            onClick={this.onCancelReasonClick.bind(this, '4','기타')}>
                                            <span className='pr-3'>
                                                {this.state.cancelReasonIdx == 4 ? <FaCheck />:""}
                                            </span>
                                            <span>
                                                기타
                                            </span>
                                        </ListGroupItem>
                                    </ListGroup>
                                </Div>
                            </Div>
                            <Div my={30}>
                                <Div mb={8} fw={500}>상세사유를 입력해 주세요</Div>
                                <Div>
                                    <Textarea
                                        name="cancelReasonDetail"
                                        style={{width: '100%', minHeight: 100, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}
                                        //className={'border-info'}
                                        onChange={this.onCancelReasonDetailChange}
                                        ref={ref => this.inputCancelReasonDetail = ref}
                                        placeholder='상세사유를 입력해 주세요.'>{this.state.cancelReasonDetail}</Textarea>
                                </Div>
                            </Div>
                            <Div textAlign={'center'}>
                                <Button bg={'white'} bc={'secondary'} px={16} py={10} onClick={this.onCancelReasonNextStep}>다 음</Button>
                            </Div>

                        </Div>
                }

                {
                    /* 주문취소 환불 정보 화면 */
                    this.state.orderCancelView &&
                    <Container fluid>
                        <Row>
                            <Col xs="4">
                                <h5>상품정보</h5>
                            </Col>
                            <Col xs="8">
                                {
                                    // this.state.producerWrapDelivered ? (
                                    //     <h6 align='right'>주문일련번호 : {orderDetail.orderGroupNo}</h6>
                                    // ) : (
                                        <h6 align='right'>주문일련번호 : {orderDetail.orderSeq}</h6>
                                    // )
                                }
                            </Col>
                        </Row>
                        {
                            this.state.wrapOrderList.map((orderDetail, index) => {
                                return (
                                    <Row key={`orderCancel_${index}`}>
                                        <Col style={{padding: 0, margin: 0}}>
                                            <OrderCancelItem key={'cancelItem'+index} orderDetail={orderDetail}/>
                                        </Col>
                                    </Row>
                                )
                            })
                        }
                        <Row>
                            <Col style={{padding: 0, margin: 0}}>
                                <hr className={Style.hrBold}/>
                            </Col>
                        </Row>
                        <Row>
                            <Col><h6>환불 정보</h6></Col>
                        </Row>
                        <Row>
                            <Col xs="4">
                                <small>
                                    결제구분
                                </small>
                            </Col>
                            <Col xs="8" className={'text-right'}>
                                <small>{getPayMethodPgNm(orderDetail.payMethod,orderDetail.pgProvider)}</small>
                            </Col>
                        </Row>
                        {
                            orderPayCardName ?
                                <Row>
                                    <Col xs="4">
                                        <small>
                                            결제카드
                                        </small>
                                    </Col>
                                    <Col xs="8" className={'text-right'}>
                                        <small>{orderPayCardName}</small>
                                    </Col>
                                </Row>
                                : null
                        }
                        <Row>
                            <Col xs="4">
                                <small>
                                    주문금액<br/>
                                    {orderDetail.usedCouponNo ? <div><span>쿠폰사용</span><br/></div> : null}
                                </small>
                            </Col>
                            <Col xs="8" className={'text-right'}>
                                <small>
                                    {
                                        (orderDetail.subGroupListSize == 0) ? //주문금액
                                            //주문금액 옵션 이전 (refundWon)
                                            this.getBeforeOptionGoodsRefundStr(orderDetail)
                                            : //optionGoods 주문금액
                                            ComUtil.addCommas(this.state.totalOrderWon) + '원'
                                    }
                                    {   //쿠폰사용 금액
                                        (orderDetail.subGroupListSize == 0) ? //optionGoods 이전 data취소
                                            orderDetail.usedCouponNo ? <div><span>{orderDetail.usedCouponBlyAmount} BLY</span> ({ComUtil.addCommas(MathUtil.roundHalf(MathUtil.multipliedBy(orderDetail.usedCouponBlyAmount,orderDetail.orderBlctExchangeRate)))})</div> : null
                                            :
                                            this.state.orderSubGroup.usedCouponNo ? <div><span>{this.state.orderSubGroup.usedCouponBlyAmount} BLY</span></div> : null
                                    }
                                </small>
                            </Col>
                        </Row>
                        <Row>
                            <Col style={{padding: 0, margin: 0}}>
                                <hr/>
                            </Col>
                        </Row>
                        {
                            <Row>
                                <Col xs="5"><h6>총 환불 예정금액</h6></Col>
                                <Col xs="7" className={classnames('text-right')}>
                                    {
                                        //totalOrderWon - 쿠폰금액.
                                        <span>
                                            {
                                                (orderDetail.subGroupListSize == 0) ?
                                                    //주문금액 옵션 이전 (refundWon)
                                                    this.getBeforeOptionGoodsRefundStr(orderDetail)
                                                    :
                                                    //옵션상품 환불금액
                                                    <span>
                                                        {   //card 환불금액 (blct결제는 제외)
                                                            (
                                                                orderPayMethod === "blct" ?
                                                                    ''
                                                                    :
                                                                    (
                                                                        ComUtil.addCommas(
                                                                            MathUtil.minusBy(
                                                                                this.state.totalOrderWon,
                                                                                MathUtil.roundHalf(
                                                                                    MathUtil.multipliedBy(this.state.totalBlct,orderDetail.orderBlctExchangeRate)
                                                                                )
                                                                            )
                                                                        ) + '원'
                                                                    )
                                                            )
                                                            +
                                                            //blct 혹은 cardBlct중 onlyCoupon제외.
                                                            (
                                                                (orderPayMethod !== "card" && !this.state.orderSubGroup.onlyCouponBly) ?
                                                                    ' + ' +ComUtil.addCommas(MathUtil.minusBy(this.state.totalBlct,this.state.orderSubGroup.usedCouponBlyAmount).toFixed(2)) + 'BLY'
                                                                    :
                                                                    ''
                                                            )
                                                        }
                                                    </span>
                                            }
                                        </span>
                                    }
                                </Col>
                            </Row>
                        }
                        <Row>
                            <Col style={{padding: 0, margin: 0}}>
                                <hr/>
                            </Col>
                        </Row>
                        {
                            //환불방법
                            <Row>
                                <Col xs="4"><h6>환불방법</h6></Col>
                                <Col xs="8" className={classnames('text-right')}>
                                    <small>
                                        {   //optionGoods하면서: 금액 제거버전.
                                            orderPayMethod === "blct" &&
                                                <>
                                                    {
                                                    orderDetail.usedCouponNo ?
                                                        <span>
                                                        BLY결제 {orderDetail.dealGoods ? '예약' : ''}취소
                                                        {/*{*/}
                                                        {/*    !orderDetail.dealGoods &&*/}
                                                        {/*        <div className={'text-danger small'}>* 주문 취소시 사용하신 쿠폰은 재발급되지 않습니다.</div>*/}
                                                        {/*}*/}
                                                        </span>
                                                        :
                                                        <span>BLY결제 {orderDetail.dealGoods ? '예약' : ''}취소</span>
                                                    }
                                                </>
                                        }
                                        {
                                            orderPayMethod === "card" &&
                                                <span>
                                                    {getPayMethodPgNm(orderDetail.payMethod, orderDetail.pgProvider)} {orderDetail.dealGoods ? '예약' : ''}취소
                                                </span>
                                        }
                                        {
                                            orderPayMethod === "cardBlct" &&
                                                <span>
                                                    {getPayMethodPgNm(orderDetail.payMethod,orderDetail.pgProvider, this.state.orderSubGroup?this.state.orderSubGroup.onlyCouponBly:false)} 취소
                                                    {/*{*/}
                                                    {/*    !orderDetail.dealGoods && //공동구매예약취소는 쿠폰환불됨.*/}
                                                    {/*        <div className={'text-danger small'}>* 주문 취소시 사용한 쿠폰은 재발급되지 않습니다.</div>*/}
                                                    {/*}*/}
                                                </span>
                                        }
                                    </small>
                                </Col>
                            </Row>
                        }
                        <br/>
                        {
                            (this.state.orderPayStatus !== "cancelled" && this.state.orderPayStatus !== "revoked")&&
                            <Flex>
                                <Div width={'50%'}>
                                    <Div pr={8}>
                                        <Button block onClick={this.onCancel} bg={'white'} bc={'secondary'} height={55} rounded={3}>이전</Button>
                                    </Div>
                                </Div>
                                <Div width={'50%'} >
                                    <Div pl={8}>
                                        {r_pay_cancel_btn_view}
                                    </Div>
                                </Div>
                            </Flex>
                        }
                    </Container>
                }
            </Fragment>

        )
    }
}
export default withRouter(OrderCancel)