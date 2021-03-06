import React, { Component, Fragment } from 'react'
import { updateOrderTrackingInfo, producerCancelOrder, partialRefundOrder, getProducerByProducerNo, getOrderDetailByOrderSeq, getTransportCompany, reqProducerOrderCancel } from '~/lib/producerApi'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import { Container, ListGroup, ListGroupItem, FormGroup, Label, Input, Button, Alert, Modal, ModalBody, ModalHeader, ModalFooter } from 'reactstrap';
import Style from './Order.module.scss'
import ComUtil from '../../../../util/ComUtil'

import { ModalWithNav } from '../../../common'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import Select from 'react-select'
import 'react-dates/initialize';
import { Flex } from "~/styledComponents/shared/Layouts";

export default class Order extends Component{
    constructor(props){
        super(props)
        this.state = {
            transportationCompanies: [],
            trackingUrl: '',    //배송조회용 운송장번호와 조합된 url
            order: null,
            //consumer: null,
            goods: null,
            isOpen: false,
            isTrackingUrl: false,   //택배사 링크 존재여부
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
            alert('택배사 목록 조회가 실패하였습니다')
            return
        }

        this.transportCompanies = data.map(item => {return {value: item.transportCompanyCode, label: item.transportCompanyName, url: item.transportCompanyUrl}})
    }
    search = async () => {
        const { data: order } = await getOrderDetailByOrderSeq(this.props.orderSeq)
        //const { data: consumer } = await getConsumerByConsumerNo(order.consumerNo)
        const { data: goods } = await getGoodsByGoodsNo(order.goodsNo)
        const { data: producer} = await getProducerByProducerNo(order.producerNo)

        console.log(order);

        this.setState({
            order,
            //consumer,
            goods,
            trackingUrl: this.getTraceUrl(order),
            originalTrackingNumber: order.trackingNumber,
            producerPayoutBlctFlag: producer.payoutBlct
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
            this.notify('택배사를 선택해 주십시오!', toast.warn)
            return
        }

        if(!orderInfo.trackingNumber){
            this.notify('송장번호를 입력해 주십시오!', toast.warn)
            return
        }

        if(!window.confirm('송장번호 ' + orderInfo.trackingNumber + '로 저장하시겠습니까? (-제거해야합니다!)')) return

        if(orderInfo.trackingNumber) {
            orderInfo.trackingNumber = orderInfo.trackingNumber.replace(/\-/g, '');
        }
        const { status, result } = await updateOrderTrackingInfo(orderInfo)

        if(status !== 200){
            this.notify('저장중 에러가 발생하였습니다.', toast.error)
            return
        }

        if(result == false)
        {
            this.notify('주문이 취소되었거나 미배송 처리되어서 송장 정보를 저장할 수 없습니다.', toast.error)
            return
        }

        alert('저장이 완료되었습니다.');
        this.notify('저장되었습니다.', toast.success)

        //푸시알림

        this.props.onClose(true) //부모(OrderList.js) callback
    }
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }

    toggle = () => {
        if(this.state.isOpen) {
            this.setState({isOpen: !this.state.isOpen})
        } else if(this.state.orderCancelModal) {
            this.setState({orderCancelModal: !this.state.orderCancelModal})
        }
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
            let carrier_id = "";
            const v_TransportCompanyCd = order.transportCompanyCode;
            if(v_TransportCompanyCd === '01') carrier_id = 'kr.logen';
            else if(v_TransportCompanyCd === '02') carrier_id = 'kr.cjlogistics';
            else if(v_TransportCompanyCd === '03') carrier_id = 'kr.epost';
            else if(v_TransportCompanyCd === '04') carrier_id = 'kr.lotte';
            else if(v_TransportCompanyCd === '05') carrier_id = 'kr.cupost';
            else if(v_TransportCompanyCd === '07') carrier_id = 'kr.hanjin';
            // carrier_id = "kr.cjlogistics";
            // track_id = "639823384653";
            if(
                v_TransportCompanyCd !== '06' ||
                v_TransportCompanyCd !== '99') {
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
        // 배송 전 주문취소
        const orderDetail = Object.assign({},this.state.order);

        if(!this.state.tempProducerAdmin) {
            if(orderDetail.producerCancelReason === '' || orderDetail.producerCancelReason === null) {
                alert('주문취소 사유를 입력해주세요.')
                return
            }

            orderDetail.reqProducerCancel = 1;
            reqProducerOrderCancel(orderDetail);

            this.toggle();
            this.notify('주문취소요청이 완료되었습니다.', toast.info);
        } else {
            if(!window.confirm('해당 주문을 취소하시겠습니까?')) return
            this.setState({chainLoading: true});
            this.toggle();
            this.notify('주문취소중.', toast.info);
            let {data} = await producerCancelOrder(orderDetail);

            // console.log('producerCancelOrder', data);
            this.notify('주문취소가 완료되었습니다.', toast.info);

            this.setState({
                order: data,
                chainLoading: false  //블록체인스피너 chainLoading=false
            });
        }
    }


    onRefund = async () => {
        // 배송 전 주문취소
        if(!window.confirm('해당 주문을 환불하시겠습니까?')) return

        const orderDetail = Object.assign({},this.state.order);

        //superReward일 경우 알림.
        if (orderDetail.superRewardGoods) {
            if (!window.confirm('슈퍼리워드 상품입니다. 슈퍼리워드 보상은 개발/운영팀에 알려서 환수바랍니다.')) return
        }

        if(!this.state.tempProducerAdmin) {
            orderDetail.reqProducerCancel = 2;
            reqProducerOrderCancel(orderDetail);
            this.notify('주문환불요청이 완료되었습니다.', toast.info);

        } else {
            orderDetail.refundFlag = true;
            this.setState({chainLoading: true});
            this.notify('환불중.', toast.info);

            let {data} = await producerCancelOrder(orderDetail);

            // console.log('producerCancelOrder', data);
            this.notify('환불이 완료되었습니다.', toast.info);

            this.setState({
                order: data,
                chainLoading: false  //블록체인스피너 chainLoading=false
            });
        }
    }

    onPartialRefund = async() => {
        if(!window.confirm('부분환불은 주문개수를 감소시킵니다. 주문1건을 환불하시겠습니까?')) return;

        const orderDetail = Object.assign({},this.state.order);

        if(orderDetail.orderCnt < 2) return;

        this.setState({chainLoading: true});
        this.notify('환불중.', toast.info);

        let {data} = await partialRefundOrder(orderDetail);
        console.log(data);

        if('' === data) {
            this.notify('환불에 실패했습니다. 다시 시도해주세요.', toast.warn);
            this.setState({
                chainLoading: false  //블록체인스피너 chainLoading=false
            });

        } else {
            this.notify('환불이 완료되었습니다.', toast.info);
            this.setState({
                order: data,
                chainLoading: false  //블록체인스피너 chainLoading=false
            });
        }
    }

    //Ag-Grid Cell 주문금액 렌더러
    orderAmtRenderer = (rowData) => {

        let orderAmount = ComUtil.addCommas(rowData.cardPrice) + "원";
        let orderblctwon = "";
        switch (rowData.payMethod) {
            case "blct":
                orderAmount = ComUtil.addCommas(rowData.blctToken) + "BLY";
                break;

            case "cardBlct":
                orderblctwon = "("+ComUtil.addCommas(ComUtil.roundDown(rowData.blctToken*rowData.orderBlctExchangeRate, 1)) + "원)";
                orderAmount = ComUtil.addCommas(rowData.cardPrice) + "원 + " + ComUtil.addCommas(rowData.blctToken) + "BLY";
                break;
        }

        return (<span>{orderAmount}<small>{orderblctwon}</small></span>);
    }

    render(){

        if(!this.state.order) return null;

        const { order, consumer, goods  } = this.state;

        return(
            <Fragment>
                <Container className={Style.wrap}>
                    <br/>
                    {
                        order.consumerOkDate && <div className='text-danger text-center'>구매확정 되었습니다<small>[ {ComUtil.utcToString(order.consumerOkDate)} ]</small></div>
                    }
                    {
                        (order.notDeliveryDate)
                            ? <div className='text-danger text-center'>미배송 처리 되었습니다<small>[ {ComUtil.utcToString(order.notDeliveryDate)} ]</small></div>
                            : (order.payStatus === "cancelled")
                            ? <div className='text-danger text-center'>주문취소 되었습니다<small>[ {ComUtil.utcToString(order.orderCancelDate)} ]</small></div>
                            : null
                    }
                    <div className={Style.orderBox}>
                        <div>
                            주문번호 : {order.orderSeq}
                        </div>
                        <div>
                            {goods.goodsNm}
                        </div>
                        <div>
                            {`${order.packAmount}${order.packUnit} × ${order.orderCnt}`}
                        </div>
                        <div>
                            {this.orderAmtRenderer(order)}
                        </div>
                    </div>
                    {
                        !order.notDeliveryDate && order.payStatus !== "cancelled" ?
                            <div>
                                <Flex>
                                    {
                                        //order.directGoods && !this.state.originalTrackingNumber ?  //즉시상품만 주문취소 있음. (예약상품은 위약금+취소로 => (개발을 할필요 존재)현재는 미배송을 통해 미배송배치로 처리됨..  )
                                        !this.state.originalTrackingNumber ?  //예약상품도 취소 노출. (20200203 - 상추동결 문제로 노출)
                                            this.state.tempProducerAdmin ?
                                                <div className="mb-2">
                                                    <Button color={'info'} onClick={this.onCancelModal}>배송 전 주문취소</Button>
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
                                            <Button color={'danger'} onClick={this.onRefund}>환불</Button>
                                        </div>
                                    }
                                    {
                                        (order.orderCnt > 1 &&
                                            (!this.state.producerPayoutBlctFlag || !order.consumerOkDate )) &&  // payoutBlct인 생산자(팜토리)는 일단 제외 //20210203 구매확정 전이면 추가로 노출해봄 (팜토리 예약상품 상추동결 때문에)
                                        <div className="mb-2 ml-2">
                                            <Button color={'warning'} onClick={this.onPartialRefund}>1건 부분환불</Button>
                                        </div>

                                    }
                                </Flex>
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
                                            <Button color={'warning'} block onClick={this.onSave}>저장</Button>
                                            : null
                                    }


                                    {
                                        order.transportCompanyCode && order.trackingNumber && this.state.trackingUrl.length > 0 ? (
                                            <Button outline block onClick={this.toggle}>배송조회</Button>
                                        ) : (
                                            <Button outline block onClick={this.toggle} disabled={true}>배송조회 미지원</Button>
                                        )
                                    }
                                </div>
                            </div>
                            : null
                    }
                    <br/>
                    <h6>배송정보</h6>
                    <ListGroup>
                        <ListGroupItem action>
                            <div><small>결재방법</small></div>
                            <div><b>{order.payMethod === "card" ? "카드결제" : order.payMethod === "cardBlct" ? "카드+BLY결제":"BLY결제"}</b></div>
                            <div><b>{order.payMethod==='card' ? order.cardName:''}</b></div>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>상품정보</small></div>
                            <div><b>{goods.goodsNm}</b></div>
                            <div>상품가격 : <b> {`${ComUtil.addCommas(order.currentPrice)}`} 원 </b></div>
                            <div>수량 : <b> {`${order.packAmount}${order.packUnit} × ${order.orderCnt}`} </b></div>
                            <div>배송비 : <b> {`${ComUtil.addCommas(order.deliveryFee)}`} 원 </b></div>
                            <div>주문금액 : {ComUtil.addCommas(order.orderPrice)} 원</div>
                            <div>결제금액 : {this.orderAmtRenderer(order)}</div>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>받는사람</small></div>
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
                    {!order.notDeliveryDate && order.payStatus === "cancelled" ? <br /> : null}
                    {!order.notDeliveryDate && order.payStatus === "cancelled" ? <h6>취소(환불)정보</h6> : null}
                    {
                        !order.notDeliveryDate && order.payStatus === "cancelled" ?
                            <ListGroup>
                                <ListGroupItem action>
                                    <div><small>취소일시</small></div>
                                    <b>{ComUtil.utcToString(order.orderCancelDate,'YYYY-MM-DD HH:MM')}</b>
                                </ListGroupItem>
                                <ListGroupItem action>
                                    <div><small>취소사유</small></div>
                                    <b>{order.cancelReason}</b>
                                </ListGroupItem>
                                <ListGroupItem action>
                                    <div><small>취소사유상세</small></div>
                                    <b>{order.cancelReasonDetail}</b>
                                </ListGroupItem>
                                <ListGroupItem action>
                                    <div><small>취소수수료</small></div>
                                    {
                                        order.payMethod === "blct" ?
                                            <b>(-){ComUtil.addCommas(ComUtil.toNum(order.cancelBlctTokenFee))}</b>
                                            :
                                            <b>(-){ComUtil.addCommas(ComUtil.toNum(order.cancelFee))}</b>
                                    }
                                    {order.payMethod === "blct" ? ' BLY' : ' 원'}
                                </ListGroupItem>
                                <ListGroupItem action>
                                    <div><small>신용카드</small></div>
                                    <b>{ComUtil.addCommas(ComUtil.toNum(order.cardPrice)-ComUtil.toNum(order.cancelFee))}원</b>
                                </ListGroupItem>
                                <ListGroupItem action>
                                    <div><small>BLY</small></div>
                                    {
                                        order.payMethod === "blct" ?
                                            <b>
                                                {ComUtil.addCommas(ComUtil.toNum(order.blctToken)-ComUtil.toNum(order.cancelBlctTokenFee))} BLY &nbsp;
                                                <small>({ComUtil.addCommas(ComUtil.roundDown((order.blctToken-order.cancelBlctTokenFee)*order.orderBlctExchangeRate,1))}원)</small>
                                            </b>
                                            :
                                            order.payMethod === "cardBlct" ?
                                                <b>
                                                    {ComUtil.addCommas(ComUtil.toNum(order.blctToken))} BLY &nbsp;
                                                    <small>({ComUtil.addCommas(ComUtil.roundDown(order.blctToken*order.orderBlctExchangeRate, 1))}원)</small>
                                                </b>
                                                :
                                                <b>-</b>
                                    }
                                </ListGroupItem>
                                <ListGroupItem action>
                                    <div><small>총 환불금액</small></div>
                                    {
                                        order.payMethod === "blct" ?
                                            ComUtil.addCommas(ComUtil.toNum(order.blctToken)-ComUtil.toNum(order.cancelBlctTokenFee)) :
                                            ComUtil.addCommas(ComUtil.toNum(order.orderPrice)-ComUtil.toNum(order.cancelFee))
                                    }
                                    { order.payMethod === "blct" ? ' BLY' : ' 원' }
                                </ListGroupItem>
                            </ListGroup>
                            :
                            null
                    }
                    {
                        //미배송 보상금
                        (order.notDeliveryDate) ?
                            <ListGroup>
                                <ListGroupItem action>
                                    <div><small>미배송 보상금</small></div>
                                    <b>
                                        {
                                            ComUtil.addCommas(ComUtil.toNum(order.depositBlct))
                                        }
                                        {' BLY'}
                                    </b>
                                </ListGroupItem>
                            </ListGroup>
                            :
                            null
                    }
                    <br />
                    <h6>주문자정보</h6>
                    <ListGroup>
                        <ListGroupItem action>
                            <div><small>일자</small></div>
                            <b>{ComUtil.utcToString(order.orderDate,'YYYY-MM-DD HH:MM')}</b>
                        </ListGroupItem>
                        <ListGroupItem action>
                            <div><small>보내는사람</small></div>
                            <b>{order.consumerNm}</b>
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
                                <h6>운송장번호 : {order.trackingNumber}</h6>
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
                            <ModalHeader toggle={this.toggle}>주문취소요청</ModalHeader>
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
                <ToastContainer />  {/* toast 가 그려질 컨테이너 */}
            </Fragment>
        )
    }
}