import React, { Component, Fragment } from 'react'
import {
    updateOrderTrackingInfo,
    producerCancelOrder,
    partialRefundOrder,
    getProducerByProducerNo,
    getOrderGroupByOrderGroupNo,
    getOrderDetailByOrderSeq,
    getTransportCompany,
    reqProducerOrderCancel,
    getProducer
} from '~/lib/producerApi'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import {getLoginAdminUser, getLoginProducerUser} from '~/lib/loginApi'
import { Container, ListGroup, ListGroupItem, FormGroup, Label, Input, Button, Alert, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import Style from './Order.module.scss'
import ComUtil from '~/util/ComUtil'
import MathUtil from '~/util/MathUtil'
import { ModalWithNav } from '../../../common'
import { toast } from 'react-toastify'                              //토스트
import Select from 'react-select'
import 'react-dates/initialize';
import {Div, Flex, Right, Span} from "~/styledComponents/shared/Layouts";
import {getCardPgName, getPgProviderNm, getTransportCarrierId} from "~/util/bzLogic";
import {FaGift} from "react-icons/fa";

export default class Order extends Component{
    constructor(props){
        super(props)
        this.state = {
            transportationCompanies: [],
            trackingUrl: '',    //배송조회용 운송장번호와 조합된 url
            orderGroup: null,
            order: null,
            //consumer: null,
            goods: null,
            isOpen: false,
            isTrackingUrl: false,   //택배사 링크 존재여부
            producerNo: null,
            tempProducerAdmin: false,
            orderCancelModal: false,
        }

        //택배사 리스트
        this.transportCompanies = []

    }

    async componentDidMount(){

        await this.initData()
        let adminUser = await getLoginAdminUser();
        let tempProducerAdmin = false;
        if (adminUser && adminUser.email === 'tempProducer@ezfarm.co.kr') {
            tempProducerAdmin = true;
        }

        this.setState({
            tempProducerAdmin: tempProducerAdmin
        })

        this.search()
    }
    initData = async () => {

        const { status, data } = await getTransportCompany()
        if(status !== 200){
            toast.error('택배사 목록 조회가 실패하였습니다');
            return
        }

        this.transportCompanies = data.map(item => {return {value: item.transportCompanyCode, label: item.transportCompanyName, url: item.transportCompanyUrl}})
    }
    search = async () => {
        const { data: order } = await getOrderDetailByOrderSeq(this.props.orderSeq)
        const { data: orderGroup } = await getOrderGroupByOrderGroupNo(order.orderGroupNo)
        const { data: goods } = await getGoodsByGoodsNo(order.goodsNo)
        const { data: producer} = await getProducerByProducerNo(order.producerNo)

        console.log(order);

        this.setState({
            orderGroup,
            order,
            //consumer,
            goods,
            trackingUrl: this.getTraceUrl(order),
            originalTrackingNumber: order.trackingNumber,
            producerPayoutBlctFlag: producer.payoutBlct,
            producerNo: producer.producerNo
        })
    }
    onChange = (e) => {
        const { name, value } = e.target
        const order = Object.assign({}, this.state.order)
        let vVal = value;
        order[name] = vVal

        this.setState({
            order
        })
    }

    onSave = async () => {
        //console.log(this.state.order)
        const orderInfo = Object.assign({}, this.state.order)

        if(!orderInfo.transportCompanyCode){
            toast.warn('택배사를 선택해 주십시오!')
            return
        }

        if(!orderInfo.trackingNumber){
            toast.warn('송장번호를 입력해 주십시오!')
            return
        }

        if(!window.confirm('송장번호 ' + orderInfo.trackingNumber + '로 저장하시겠습니까? (-제거해야합니다!)')) return

        if(orderInfo.trackingNumber) {
            orderInfo.trackingNumber = orderInfo.trackingNumber.replace(/\-/g, '');
        }
        const { status, result } = await updateOrderTrackingInfo(orderInfo)

        if(status !== 200){
            toast.error('저장중 에러가 발생하였습니다.')
            return
        }

        if(result == false)
        {
            toast.error('주문이 취소되었거나 미배송 처리되어서 송장 정보를 저장할 수 없습니다.')
            return
        }

        alert('저장이 완료되었습니다.');
        toast.success('저장되었습니다.')

        //푸시알림

        this.props.onClose(true) //부모(OrderList.js) callback
    }

    toggle = () => {
        if(this.state.isOpen) {
            this.setState({isOpen: !this.state.isOpen})
        } else if(this.state.orderCancelModal) {
            this.setState({orderCancelModal: !this.state.orderCancelModal})
        }
    }
    onTransportModal = () => {
        this.setState({isOpen: !this.state.isOpen})
    }

    onClose = () => {
        this.toggle()
    }
    //택배사 변경시
    onItemChange = (item) => {
        const order = Object.assign({}, this.state.order)
        order.transportCompanyCode = item.value
        order.transportCompanyName = item.label


        this.setState({
            order: order,
            trackingUrl: this.getTraceUrl(order)
        })
    }
    getTraceUrl = (order) => {
        try{
            const transportCompany = this.transportCompanies.find( item => item.value === order.transportCompanyCode)

            let trackingUrl = transportCompany.url.replace('[number]', order.trackingNumber);
            let track_id = order.trackingNumber;
            const v_TransportCompanyCd = order.transportCompanyCode;

            const carrier_id = getTransportCarrierId(v_TransportCompanyCd);

            // carrier_id = "kr.cjlogistics";
            // track_id = "639823384653";
            if(v_TransportCompanyCd !== '06' && v_TransportCompanyCd !== '98' && v_TransportCompanyCd !== '99') { //세방, 기타
                trackingUrl = `https://tracker.delivery/#/${carrier_id}/${track_id}`;
            }

            return trackingUrl;
        }catch(e){
            return ''
        }
    }

    onCancelModal = () => {
        this.setState({orderCancelModal: !this.state.orderCancelModal})
    }

    onCancel = async () => {

        const {status, data: producer} = await getProducer()

        if (status !== 200 || !producer) {
            alert('로그인 세션이 만료 되었습니다.')
            return
        }

        //로컬푸드 생산자 일 경우는 어드민 취소와 동일하게 처리 함
        // if (producer.localfoodFlag) {
        //
        //     if(this.state.order.csRefundFlag){
        //         toast.warn('전표는 주문취소를 하실수 없습니다.')
        //         return
        //     }
        //
        //     if(!this.state.order.producerCancelReason) {
        //         toast.warn('주문취소 사유를 입력해주세요.')
        //         return
        //     }
        //
        //     await this.cancelByAdmin({dpCancelReason: this.state.order.producerCancelReason})
        //     return
        // }

        const orderDetail = Object.assign({},this.state.order);

        if(orderDetail.csRefundFlag){
            toast.warn('전표는 주문취소를 하실수 없습니다.')
            return
        }
        if(!orderDetail.producerCancelReason) {
            toast.warn('주문취소 사유를 입력해주세요.')
            return
        }

        //생산자일 경우
        if(!this.state.tempProducerAdmin) {
            orderDetail.reqProducerCancel = 1;
            orderDetail.cancelType = 2;
            reqProducerOrderCancel(orderDetail);
            this.toggle();
            toast.success('주문취소요청이 완료되었습니다.');
        } else { //어드민일 경우
            await this.cancelByAdmin({dpCancelReason: this.state.order.producerCancelReason})
        }
    }


    //어드민 취소
    cancelByAdmin = async ({dpCancelReason}) => {
        if(!window.confirm('해당 주문을 취소하시겠습니까?')) return
        this.setState({chainLoading: true});
        this.toggle();
        toast.info('주문취소중.');
        const orderDetail = {...this.state.order, dpCancelReason}
        orderDetail.cancelType = 2;
        let {data} = await producerCancelOrder(orderDetail);
        toast.success('주문취소가 완료되었습니다.');
        this.setState({
            order: data,
            chainLoading: false  //블록체인스피너 chainLoading=false
        });
    }

    onRefund = async () => {
        // 배송 전 주문취소
        if(!window.confirm('해당 주문을 환불하시겠습니까?')) return

        const orderDetail = Object.assign({},this.state.order);
        if(orderDetail.csRefundFlag){
            toast.warn('전표는 주문취소를 하실수 없습니다.')
            return
        }

        //superReward일 경우 알림.
        if (orderDetail.superRewardGoods) {
            if (!window.confirm('슈퍼리워드 상품입니다. 슈퍼리워드 보상은 개발/운영팀에 알려서 환수바랍니다.')) return
        }

        if(!this.state.tempProducerAdmin) {
            orderDetail.reqProducerCancel = 2;
            orderDetail.cancelType = 2;
            reqProducerOrderCancel(orderDetail);
            toast.success('주문환불요청이 완료되었습니다.');

        } else {
            orderDetail.refundFlag = true;
            orderDetail.cancelType = 2;
            this.setState({chainLoading: true});
            toast.info('환불중.');
            let {data} = await producerCancelOrder(orderDetail);
            toast.success('환불이 완료되었습니다.');
            this.setState({
                order: data,
                chainLoading: false  //블록체인스피너 chainLoading=false
            });
        }
    }

    onPartialRefund = async() => {
        if(!window.confirm('부분환불은 주문개수를 감소시킵니다. 주문1건을 환불하시겠습니까?')) return;

        const orderDetail = Object.assign({},this.state.order);
        if(orderDetail.csRefundFlag){
            toast.warn('전표는 주문취소를 하실수 없습니다.')
            return
        }
        if(orderDetail.orderCnt < 2) return;

        this.setState({chainLoading: true});
        toast.info('환불중.');
        orderDetail.cancelType = 2;
        let {data} = await partialRefundOrder(orderDetail);
        console.log(data);

        if('' === data) {
            toast.error('환불에 실패했습니다. 다시 시도해주세요.');
            this.setState({
                chainLoading: false  //블록체인스피너 chainLoading=false
            });

        } else {
            toast.success('환불이 완료되었습니다.');
            this.setState({
                order: data,
                chainLoading: false  //블록체인스피너 chainLoading=false
            });
        }
    }

    //주문금액 렌더러
    orderAmtRenderer = (rowData) => {

        let cardPrice = "";
        let orderBlyVal = "";
        let orderBly = "";
        let orderBlyWon = "";
        let orderCouponWon = "";

        let orderAmtText = "";
        switch (rowData.payMethod) {
            case "card":
                cardPrice = ComUtil.addCommas(rowData.adminCardPrice) + "원";

                orderCouponWon = rowData.usedCouponNo !== 0 ? " / 쿠폰:"+ComUtil.addCommas(rowData.usedCouponBlyAmount)+"BLY"+"("+ComUtil.addCommas(MathUtil.roundHalf(MathUtil.multipliedBy(rowData.usedCouponBlyAmount,rowData.orderBlctExchangeRate))) + "원)":"";
                orderAmtText = "결제:"+cardPrice + " " + orderCouponWon;
                break;
            case "blct":
                orderBlyVal = MathUtil.minusBy(rowData.adminBlctToken,rowData.usedCouponBlyAmount) > 0 ? MathUtil.minusBy(rowData.adminBlctToken,rowData.usedCouponBlyAmount):0;
                orderBly = ComUtil.addCommas(orderBlyVal) + "BLY";
                orderBlyWon = ComUtil.addCommas(MathUtil.roundHalf(MathUtil.multipliedBy(orderBlyVal,rowData.orderBlctExchangeRate))) + "원";
                orderCouponWon = rowData.usedCouponNo !== 0 ? " / 쿠폰:"+ComUtil.addCommas(rowData.usedCouponBlyAmount)+"BLY"+"("+ComUtil.addCommas(MathUtil.roundHalf(MathUtil.multipliedBy(rowData.usedCouponBlyAmount,rowData.orderBlctExchangeRate))) + "원)":"";

                orderAmtText = "결제:"+orderBly+"("+orderBlyWon+") " + " " + orderCouponWon;
                break;
            case "cardBlct":
                cardPrice = ComUtil.addCommas(rowData.adminCardPrice) + "원";
                orderBlyVal = MathUtil.minusBy(rowData.adminBlctToken,rowData.usedCouponBlyAmount) > 0 ? MathUtil.minusBy(rowData.adminBlctToken,rowData.usedCouponBlyAmount):0;
                orderBly = ComUtil.addCommas(orderBlyVal) + "BLY";
                orderBlyWon = ComUtil.addCommas(MathUtil.roundHalf(MathUtil.multipliedBy(orderBlyVal,rowData.orderBlctExchangeRate))) + "원";
                orderCouponWon = rowData.usedCouponNo !== 0 ? "/ 쿠폰:"+ComUtil.addCommas(rowData.usedCouponBlyAmount)+"BLY"+"("+ComUtil.addCommas(MathUtil.roundHalf(MathUtil.multipliedBy(rowData.usedCouponBlyAmount,rowData.orderBlctExchangeRate))) + "원)":"";

                orderAmtText = "결제:"+cardPrice +" / "+ orderBly+"("+orderBlyWon+") " + " " + orderCouponWon;
                break;
        }

        return (
            <div>
                <div>
                    [<small>{orderAmtText}</small>]
                </div>
            </div>
        );
    }

    render(){

        if(!this.state.order) return null;

        const { orderGroup, order, consumer, goods  } = this.state;

        return(
            <Fragment>
                <Container className={Style.wrap}>
                    <br/>
                    {
                        order.consumerOkDate && <div className='text-danger text-center'>구매확정 되었습니다<small>[ {ComUtil.utcToString(order.consumerOkDate)} ]</small></div>
                    }
                    {
                        order.payStatus === "revoked" && <div className='text-danger text-center'>주문예약취소 되었습니다</div>
                    }
                    {
                        order.payStatus === "cancelled" &&
                        <div className='text-danger text-center'>
                            주문취소 되었습니다 [ {ComUtil.utcToString(order.orderCancelDate)} ]  {order.dpCancelReason && <span>({order.dpCancelReason})</span>}
                        </div>
                    }
                    <div className={Style.orderBox}>
                        <div>
                            {/*{order.subGroupListSize && order.subGroupListSize > 1 ? <span>주문그룹번호 : {Math.abs(order.orderSubGroupNo).toString(16).toUpperCase()}</span>:""}*/}
                            주문그룹번호 : {order.orderSubGroupNo}
                        </div>
                        <div>
                            주문번호 : {order.orderSeq}
                        </div>
                        <div>
                            {order.goodsOptionNm}
                        </div>
                        <div>
                            {/*{`${order.packAmount}${order.packUnit} × ${order.orderCnt}`}*/}
                            {`수량 ${order.orderCnt}`}
                        </div>
                        <div>
                            {ComUtil.addCommas(order.adminOrderPrice)} 원
                        </div>
                    </div>
                    {
                        order.payStatus !== "cancelled" && order.payStatus !== "revoked" ?
                            <div>
                                {
                                    order.payStatus !== "scheduled" &&
                                    <Flex>
                                        {
                                            !this.state.originalTrackingNumber ?  //예약상품도 취소 노출. (20200203 - 상추동결 문제로 노출)
                                                this.state.tempProducerAdmin ?
                                                    <div className="mb-2">
                                                        <Button color={'info'} onClick={this.onCancelModal}>[관리자]배송 전 주문취소</Button>
                                                    </div>
                                                    :
                                                    <div className="mb-2">
                                                        <Button color={'info'} onClick={this.onCancelModal}>{!order.producerCancelReason?'배송 전 주문취소요청':'취소요청 처리중'}</Button>
                                                    </div>
                                                : null
                                        }
                                        {
                                            ( this.state.originalTrackingNumber &&  //예약상품도 환불 가능하도록 수정 20200902, payoutBlct인 생산자(팜토리)는 제외
                                                (!this.state.producerPayoutBlctFlag || !order.consumerOkDate))   && //20210203 구매확정 전이면 추가로 노출해봄 (팜토리 예약상품 상추동결 때문에)

                                            <div className="mb-2">
                                                <Button color={'danger'} onClick={this.onRefund}>
                                                    {this.state.tempProducerAdmin && "[관리자]"}환불
                                                </Button>
                                            </div>
                                        }
                                        {
                                            (order.orderCnt > 1 &&
                                                (!this.state.producerPayoutBlctFlag || !order.consumerOkDate )) &&  // payoutBlct인 생산자(팜토리)는 일단 제외 //20210203 구매확정 전이면 추가로 노출해봄 (팜토리 예약상품 상추동결 때문에)
                                            <>
                                            {
                                                // 옥천로컬푸드일경우 부분환불 안보이게
                                                (order.producerNo != 157) &&
                                                        <div className="mb-2 ml-2">
                                                            <Button color={'warning'} onClick={this.onPartialRefund}>{this.state.tempProducerAdmin && "[관리자]"}1건 부분환불</Button>
                                                        </div>
                                            }
                                            </>

                                        }
                                    </Flex>
                                }
                                <div className={Style.invoiceBox}>
                                    <FormGroup>
                                        <Label><h6>택배사</h6></Label>
                                        <Select options={this.transportCompanies}
                                                value={this.transportCompanies.find(item => item.value === order.transportCompanyCode)}
                                                onChange={this.onItemChange}
                                        />
                                    </FormGroup>
                                    <FormGroup>
                                        <Label><h6>송장번호</h6></Label>
                                        <Input type="text" name='trackingNumber' onChange={this.onChange} value={order.trackingNumber}/>
                                        <div className='text-secondary'>송장번호 등록 시 '-'를 제외한 <span className='text-danger'>숫자만 입력</span>해주세요('-'입력 시 조회 불가)</div>
                                    </FormGroup>

                                    {
                                        !order.consumerOkDate  ?
                                            order.payStatus !== "scheduled" ?
                                                <Button color={'warning'} block onClick={this.onSave}>저장</Button>
                                                :
                                                null
                                            : null
                                    }


                                    {
                                        order.transportCompanyCode && order.trackingNumber && this.state.trackingUrl.length > 0 ? (
                                            <Button outline block onClick={this.onTransportModal}>배송조회</Button>
                                        ) : (
                                            <Button outline block onClick={this.onTransportModal} disabled={true}>배송조회 미지원</Button>
                                        )
                                    }
                                </div>
                            </div>
                            : null
                    }
                    <br/>
                    <h6>배송정보</h6>
                    <ListGroup>
                        {
                            order.payStatus === "scheduled" ?
                                <ListGroupItem action>
                                    <div><small>주문예약결제</small></div>
                                    <div><b>주문예약결제 {orderGroup.scheduleAtTime > 0 ? "일시 "+ComUtil.longToDateTime(orderGroup.scheduleAtTime):""}</b></div>
                                </ListGroupItem>
                                :
                                null
                        }
                        <ListGroupItem action>
                            <div><small>결재방법</small></div>
                            <div><b>{order.payMethod === "card" ? getCardPgName(orderGroup.pgProvider) : order.payMethod === "cardBlct" ? getCardPgName(orderGroup.pgProvider)+"+BLY결제":"BLY결제"}</b></div>
                            <div><b>{order.payMethod==='card' ? order.cardName:''}</b></div>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>상품정보</small></div>
                            <div><b>{order.goodsOptionNm}</b></div>
                            <div>상품가격 : <b> {`${ComUtil.addCommas(order.currentPrice)}`} </b></div>
                            <div>주문수량 : <b> {`${ComUtil.addCommas(order.orderCnt)}`} </b></div>
                            <div>주문가격 : <b> {`${ComUtil.addCommas(MathUtil.minusBy(order.mypageOrderPrice,order.adminDeliveryFee))}`} 원 </b></div>
                            <div>배송비 : <b> {`${ComUtil.addCommas(order.adminDeliveryFee)}`} 원 </b></div>
                            <Div bold fontSize={20}>주문금액 : <b> {ComUtil.addCommas(order.mypageOrderPrice)} 원 </b></Div>
                            <div>{this.orderAmtRenderer(order)}</div>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div>
                                <small>받는사람</small>
                                {
                                    order.gift && <Span ml={2}><FaGift className={'text-danger'} /></Span>
                                }
                            </div>
                            <b>{order.receiverName}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>연락처</small></div>
                            <b>{order.receiverPhone}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>주소</small></div>
                            <b>{`${order.receiverAddr} ${order.receiverAddrDetail} (${order.receiverZipNo || ''})`}</b>
                        </ListGroupItem>
                        {
                            order.deliveryMsg && (
                                <ListGroupItem action>
                                    <div><small>배송메세지</small></div>
                                    <b>{order.deliveryMsg}</b>
                                </ListGroupItem>
                            )
                        }
                        {
                            order.commonEnterPwd && (
                                <ListGroupItem action>
                                    <div><small>공동현관 출입번호</small></div>
                                    <b>{order.commonEnterPwd}</b>
                                </ListGroupItem>
                            )
                        }
                        {
                            order.hopeDeliveryFlag &&
                            (<ListGroupItem action>
                                <div>
                                    <small>희망 수령일</small>
                                </div>
                                <b>{order.hopeDeliveryFlag == true ? ComUtil.utcToString(order.hopeDeliveryDate):""}</b>
                            </ListGroupItem>)
                        }
                    </ListGroup>
                    {/* 취소시 환불정보 */}
                    {((order.payStatus === "cancelled") || (order.payStatus === "revoked")) ? <br /> : null}
                    {((order.payStatus === "cancelled") || (order.payStatus === "revoked")) ? <h6>취소(환불)정보</h6> : null}
                    {
                        ((order.payStatus === "cancelled") || (order.payStatus === "revoked")) ?
                            <ListGroup>
                                <ListGroupItem action>
                                    <div><small>취소일시</small></div>
                                    <b>{ComUtil.utcToString(order.orderCancelDate,'YYYY-MM-DD HH:mm')}</b>
                                </ListGroupItem>
                                {
                                    order.dpCancelReason &&
                                    <ListGroupItem action>
                                        <div><small>[생산자(관리자)]취소사유</small></div>
                                        <b>{order.dpCancelReason}</b>
                                    </ListGroupItem>
                                }
                                {
                                    order.cancelReason &&
                                    <ListGroupItem action>
                                        <div><small>[소비자]취소사유</small></div>
                                        <b>{order.cancelReason}</b>
                                    </ListGroupItem>
                                }
                                {
                                    order.cancelReasonDetail &&
                                    <ListGroupItem action>
                                        <div><small>[소비자]취소사유상세</small></div>
                                        <b>{order.cancelReasonDetail}</b>
                                    </ListGroupItem>
                                }

                                {
                                    (order.payMethod === "blct" && order.cancelBlctTokenFee > 0) &&
                                    <ListGroupItem action>
                                        <div><small>취소수수료</small></div>
                                        <b>(-){ComUtil.addCommas(ComUtil.toNum(order.cancelBlctTokenFee))}</b> BLY
                                    </ListGroupItem>
                                }
                                {
                                    (order.payMethod !== "blct" && order.cancelFee > 0) &&
                                    <ListGroupItem action>
                                        <div><small>취소수수료</small></div>
                                        <b>(-){ComUtil.addCommas(ComUtil.toNum(order.cancelFee))}</b> 원
                                    </ListGroupItem>
                                }
                                {
                                    (order.mypageCardPrice != null && order.mypageCardPrice != 0) &&
                                    <ListGroupItem action>
                                        <div><small>환불금액</small></div>
                                        <Flex>
                                            <Div bold fg={'danger'} fontSize={20}>{ComUtil.addCommas(order.mypageCardPrice) + '원'}</Div>
                                        </Flex>
                                    </ListGroupItem>
                                }
                                {
                                    (MathUtil.minusBy(order.mypageBlctToken,order.usedCouponBlyAmount) > 0) &&
                                    <ListGroupItem action>
                                        <div><small>환불BLY</small></div>
                                        <Flex>
                                            <Div fg={'bly'}>{ComUtil.addCommas(MathUtil.minusBy(order.mypageBlctToken,order.usedCouponBlyAmount).toFixed(2))} BLY</Div> &nbsp;
                                            <Div fg={'danger'}>({ComUtil.addCommas(MathUtil.roundHalf(MathUtil.multipliedBy(MathUtil.minusBy(order.mypageBlctToken,order.usedCouponBlyAmount),order.orderBlctExchangeRate)))}원)</Div>
                                        </Flex>
                                    </ListGroupItem>
                                }
                            </ListGroup>
                            :
                            null
                    }
                    {
                        order.gift && <>
                            <br/>
                            <h6>보내는사람 정보</h6>
                            <ListGroup>
                                <ListGroupItem action>
                                    <div><small>보내는사람</small></div>
                                    <b>{order.senderName}</b>
                                </ListGroupItem>
                            </ListGroup>
                        </>
                    }
                    <br />
                    <h6>계정정보</h6>
                    <ListGroup>
                        <ListGroupItem action>
                            <div><small>일자</small></div>
                            <b>{ComUtil.utcToString(order.orderDate,'YYYY-MM-DD HH:mm')}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>회원명 (소비자번호)</small></div>
                            <b>{order.originConsumerNm} ({order.consumerNo})</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>연락처</small></div>
                            <b>{order.consumerPhone}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>이메일</small></div>
                            <b>{order.consumerEmail}</b>
                        </ListGroupItem>
                    </ListGroup>


                </Container>
                {
                    this.state.isOpen &&(
                        <ModalWithNav show={this.state.isOpen} title={'배송조회'} onClose={this.onClose} noPadding={true}>
                            <div className='p-1' style={{width: '100%',minHeight: '350px'}}>
                                <h6>{order.transportCompanyName} 운송장번호 : {order.trackingNumber}</h6>
                                <iframe src={this.state.trackingUrl} width={'100%'} style={{minHeight:'350px', border: '0'}}></iframe>
                            </div>
                        </ModalWithNav>
                    )
                }
                {/* 배송전 주문취소요청 모달 */}
                {
                    this.state.orderCancelModal && (
                        <Modal
                            isOpen={this.state.orderCancelModal}
                            toggle={this.toggle}
                            size="lg"
                            style={{maxWidth: '800px', width: '80%'}}
                            centered
                        >
                            <ModalHeader toggle={this.toggle}>{this.state.tempProducerAdmin ? "[관리자]주문취소":"주문취소요청"}</ModalHeader>
                            <ModalBody>
                                <FormGroup>
                                    <Label className={'font-weight-bold text-secondary small'}>
                                        취소사유
                                        {
                                            !this.state.tempProducerAdmin && <span className='text-danger'>*</span>
                                        }
                                    </Label>
                                    <div>
                                        <Input
                                            type="text"
                                            name={"producerCancelReason"}
                                            style={{width:'80%'}}
                                            value={order.producerCancelReason}
                                            onChange={this.onChange}
                                        />
                                    </div>
                                </FormGroup>
                            </ModalBody>
                            <ModalFooter>
                                {
                                    !order.reqProducerCancel && <Button color="info" onClick={this.onCancel}>취소요청</Button>
                                }
                                <Button color="secondary" onClick={this.toggle}>닫기</Button>
                            </ModalFooter>
                        </Modal>
                    )
                }
            </Fragment>
        )
    }
}