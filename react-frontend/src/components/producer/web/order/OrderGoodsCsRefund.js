import React, { Component } from 'react'
import {FormGroup, Label, Alert, Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap'
import moment from 'moment-timezone'
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';
import ComUtil from '~/util/ComUtil'
import {getOrderDetailByOrderSeq, addCsRefundOrder, cancelCsRefundOrder} from "~/lib/producerApi";
import {ProducerGoodsSelSearch} from "~/components/common";
import {FaMinusCircle, FaPlusCircle, FaSearchPlus} from "react-icons/fa";
import MathUtil from "~/util/MathUtil";
export default class OrderGoodsCsRefund extends Component {
    constructor(props) {
        super(props);
        this.state = {
            goodsSearchModal:false,
            csRefund: {
                csRefundFlag:false,
                goodsNo:"",
                goodsNm:"",            // 상품명
                currentPrice:"",
                orderCnt:1,
                csDay:moment(moment().toDate()).format("YYYYMMDD"),
                csRefundPrice:"",            // 취소금액
                csRefundDesc:""              // 비고
            }
        };
    }

    //밸리데이션 체크
    setValidatedObj = (csRefund) => {

        if(!csRefund.csRefundPrice) {
            alert("전표금액은 필수 입니다.");
            return false;
        }

        return true;

    };

    async componentDidMount(){
        // 주문정보 가져오기
        //this.search();
    };

    search = async () => {
        const {data: order} = await getOrderDetailByOrderSeq(this.props.orderSeq)
        console.log(order)
        // const { data: orderGroup } = await getOrderGroupByOrderGroupNo(order.orderGroupNo)
        // const { data: goods } = await getGoodsByGoodsNo(order.goodsNo)
        // const { data: producer} = await getProducerByProducerNo(order.producerNo)

        const strCsRefundDesc = "주문번호:"+order.orderSeq+" 소비자:"+order.consumerNm+"("+order.consumerNo+")";

        const csRefund = {
            csRefundFlag:order.csRefundFlag,
            orderGroupNo:order.orderGroupNo,  // 주문그룹번호
            orderNo:order.orderSeq,            // 주문번호
            goodsNm:order.goodsOptionNm,            // 상품명
            consumerNm:order.consumerNm,
            consumerEmail:order.consumerEmail,
            consumerPhone:order.consumerPhone,
            orderPrice:order.adminOrderPrice,
            csDay:order.csRefundFlag ? moment(order.orderDate).format("YYYYMMDD"):moment(moment().toDate()).format("YYYYMMDD"),
            csRefundOrderSeq:order.csRefundFlag ? order.csRefundOrderSeq:order.orderSeq,
            csRefundPrice:order.csRefundFlag ? order.csRefundPrice:"",                                       // 취소금액
            csRefundDesc:order.csRefundFlag ? order.csRefundDesc:strCsRefundDesc   // 비고
        }
        this.setState({
            csRefund:csRefund
        })
    }

    //인풋박스
    onInputChange = (e) => {
        let {name, value} = e.target;
        let csRefund = Object.assign({}, this.state.csRefund);
        let obj_state = {};
        csRefund[name] = value;
        obj_state.csRefund = csRefund;
        if(name === "orderCnt"){
            csRefund.csRefundPrice = MathUtil.multipliedBy(csRefund.currentPrice, value);
        }
        this.setState(obj_state);
    };

    onCancelOnlyCloseClick = () => {
        this.props.onClose(false);
    };

    onCancelClick = () => {
        this.props.onClose(true);
    };

    onConfirmClick = async () => {

        alert("상품 수동 전표 발행 보류..");
        return;

        const csRefund = Object.assign({}, this.state.csRefund);

        let return_chk = this.setValidatedObj(csRefund);
        if(!return_chk){
            return false;
        }

        if(window.confirm("전표를 발행하시겠습니까?")){
            // const csDay = csRefund.csDay;
            // const csRefundOrderSeq = csRefund.orderNo;
            // const csAmount = csRefund.csRefundPrice;
            // const csRefundDesc = csRefund.csRefundDesc;
            // //전표발급
            // const {data: errRes, status} = await addCsRefundOrder(csDay, csAmount, csRefundOrderSeq, csRefundDesc);
            // if (errRes.resCode) {
            //     alert(errRes.errMsg);
            //     return;
            // } else {
            //     alert('전표가 발행되었습니다.')
            //     this.onCancelClick();
            // }
        }

    };

    onDateChange = (date) => {
        let csRefund = Object.assign({}, this.state.csRefund);
        let obj_state = {};
        csRefund["csDay"] = date.endOf('day');
        obj_state.csRefund = csRefund;
        this.setState(obj_state);
    }

    // 상품 검색 모달 [상품선택] 온체인지 이벤트
    goodsSearchModalOnChange = (obj) => {
        console.log("goodsSearchModalOnChange===",obj)

        const csRefund = Object.assign([], this.state.csRefund);

        csRefund.producerNo = obj.producerNo;
        csRefund.producerFarmNm = obj.producerFarmNm;
        csRefund.goodsNo = obj.goodsNo;
        csRefund.goodsNm = obj.goodsNm;
        csRefund.currentPrice = obj.currentPrice;

        csRefund.csRefundPrice = MathUtil.multipliedBy(csRefund.currentPrice, csRefund.orderCnt);
        //202205 eventFlag 옵션에 추가.
        // csRefund.eventOptionPrice = obj.eventOptionPrice;
        // csRefund.eventOptionName = obj.eventOptionName;

        this.setState({
            csRefund
        });

        this.goodsSearchModalToggle();
    };

    goodsSearchModalToggle = () => {
        this.setState(prevState => ({
            goodsSearchModal: !prevState.goodsSearchModal
        }));
    };

    render() {
        const { csRefund } = this.state;

        const star = <span className='text-danger'>*</span>;

        return (
            <div>

                <div className='pt-0 pl-2 pr-2 pb-1'>
                    <FormGroup>
                        <Alert color={'secondary'} className='small'>
                            [상품]수동전표발행 <br/>
                            샵블리 오피셜로 전표를 발행합니다. <br/>
                            금액을 -금액으로 입력하면 -전표입니다. <br/>
                            메모는 비고 작성시에만 들어갑니다. <br/>
                        </Alert>
                    </FormGroup>

                    <FormGroup>
                        <Label className={'font-weight-bold text-secondary small'}>상품 {star}</Label>
                        <div className="mb-1">
                            <Button color={'info'} onClick={this.goodsSearchModalToggle}>
                                <FaSearchPlus /> 상품검색
                            </Button>
                        </div>
                        <div className="d-flex">
                            <div className="d-flex flex-column align-items-center mb-1">

                                <div className="d-flex align-items-center mb-1" >
                                    <div className="input-group">
                                        <input type="text"
                                               name={'producerNo'}
                                               className="ml-1"
                                               style={{width:'50px'}}
                                               value={csRefund.producerNo||""}
                                               readOnly='readonly'
                                               placeholder={'생산자번호'}
                                               />
                                        <input type="text"
                                               name={'producerFarmNm'}
                                               className="ml-1"
                                               style={{width:'100px'}}
                                               value={csRefund.producerFarmNm||""}
                                               readOnly='readonly'
                                               placeholder={'생산자명'}
                                               />
                                        <input type="text"
                                               name={'goodsNm'}
                                               className="ml-1"
                                               style={{width:'450px'}}
                                               value={csRefund.goodsNm ||""}
                                               readOnly='readonly'
                                               placeholder={'상품명'}
                                               />
                                        <input type="number"
                                               name={'goodsNo'}
                                               className="ml-1"
                                               style={{width:'100px'}}
                                               value={csRefund.goodsNo||""}
                                               readOnly='readonly'
                                               placeholder={'상품번호'}
                                               />
                                    </div>

                                </div>

                            </div>
                        </div>
                    </FormGroup>

                    <FormGroup>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>상품</Label>
                            <span className="ml-2">
                                상품명 : {csRefund.goodsNm} / 상품가 : {ComUtil.addCommas(csRefund.currentPrice)}원
                            </span>
                        </div>
                        <div className="input-group">
                            <Label className={'font-weight-bold text-secondary small'}>주문수량 {star}</Label>
                            <input type="number"
                                   name={'orderCnt'}
                                   className="ml-1"
                                   style={{width:'100px'}}
                                   value={csRefund.orderCnt||1}
                                   placeholder={'주문수량'}
                                   onChange={this.onInputChange} />
                        </div>
                        <div className="mb-2" >
                            <Label className={'font-weight-bold text-secondary small'}>전표일자 {star}</Label>
                            <div className="input-group">
                                <SingleDatePicker
                                    placeholder="전표일자"
                                    date={csRefund.csDay ? moment(csRefund.csDay) : null}
                                    onDateChange={this.onDateChange}
                                    focused={this.state['focused']} // PropTypes.bool
                                    onFocusChange={({focused}) => this.setState({['focused']: focused})} // PropTypes.func.isRequired
                                    id={"csDay"} // PropTypes.string.isRequired,
                                    numberOfMonths={1}
                                    withPortal
                                    small
                                    readOnly
                                    isOutsideRange={() => false}
                                    calendarInfoPosition="top"
                                    verticalHeight={700}
                                    // renderCalendarInfo={this.renderUntilCalendarInfo.bind(this, stepNo)}
                                />
                            </div>
                        </div>
                        <div className="mb-2" >
                            <Label className={'font-weight-bold text-secondary small'}>전표금액 {star}</Label>
                            <div className="input-group">
                                <input type="number"
                                       name={'csRefundPrice'}
                                       className="ml-1"
                                       style={{width:'200px'}}
                                       value={csRefund.csRefundPrice||""}
                                       placeholder={'전표금액'}
                                       onChange={this.onInputChange} />
                            </div>
                        </div>
                        <div className="mb-2" >
                            <Label className={'font-weight-bold text-secondary small'}>비고</Label>
                            <div className="input-group">
                                <input type="text"
                                       name={'csRefundDesc'}
                                       className="ml-1"
                                       style={{width:'600px'}}
                                       value={csRefund.csRefundDesc||""}
                                       placeholder={'비고'}
                                       onChange={this.onInputChange} />
                            </div>
                        </div>
                    </FormGroup>

                    <div className="d-flex">
                        <div className='flex-grow-1 p-1'>
                            <Button onClick={this.onCancelOnlyCloseClick} block color={'warning'}>취소</Button>
                        </div>
                        <div className='flex-grow-1 p-1'>
                            <Button onClick={this.onConfirmClick} block color={'info'}>[상품]수동전표발행</Button>
                        </div>
                    </div>

                </div>

                {/*상품검색 모달 */}
                <Modal size="lg" isOpen={this.state.goodsSearchModal}
                       toggle={this.goodsSearchModalToggle} >
                    <ModalHeader toggle={this.goodsSearchModalToggle}>
                        상품 검색
                    </ModalHeader>
                    <ModalBody>
                        <ProducerGoodsSelSearch onChange={this.goodsSearchModalOnChange} />
                    </ModalBody>
                    <ModalFooter>
                        <Button color="secondary" onClick={this.goodsSearchModalToggle}>취소</Button>
                    </ModalFooter>
                </Modal>

            </div>
        )
    }
}