import React, { Component } from 'react'
import { FormGroup, Label, Alert, Button } from 'reactstrap'
import moment from 'moment-timezone'
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';
import ComUtil from '~/util/ComUtil'
import {getOrderDetailByOrderSeq, addCsRefundOrder, cancelCsRefundOrder} from "~/lib/producerApi";
export default class OrderCsRefund extends Component {
    constructor(props) {
        super(props);
        this.state = {
            csRefund: {
                csRefundFlag:false,
                orderGroupNo:"",  // 주문그룹번호
                orderNo:"",            // 주문번호
                goodsNm:"",            // 상품명
                consumerNm:"",
                consumerEmail:"",
                consumerPhone:"",
                orderPrice:"",
                csDay:"",
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
        this.search();
    };

    search = async () => {
        const {data: order} = await getOrderDetailByOrderSeq(this.props.orderSeq)
        console.log(order)
        // const { data: orderGroup } = await getOrderGroupByOrderGroupNo(order.orderGroupNo)
        // const { data: goods } = await getGoodsByGoodsNo(order.goodsNo)
        // const { data: producer} = await getProducerByProducerNo(order.producerNo)

        const strCsRefundDesc = "주문번호:"+order.orderSeq+" 소비자:"+order.consumerNm+"("+order.consumerNo+")";

        const csRefund = {
            payStatus:order.payStatus,
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
        this.setState(obj_state);
    };

    onCancelOnlyCloseClick = () => {
        this.props.onClose(false);
    };

    onCancelClick = () => {
        this.props.onClose(true);
    };

    onCsCancelClick = async () => {
        if(window.confirm("전표를 취소 하시겠습니까?")){
            const csRefund = Object.assign({}, this.state.csRefund)
            const csRefundOrderSeq = csRefund.orderNo;
            const {data: errRes, status} = await cancelCsRefundOrder(csRefundOrderSeq);
            if (errRes.resCode) {
                alert(errRes.errMsg);
                return;
            } else {
                alert('전표가 취소되었습니다.')
                this.onCancelClick();
            }
        }
    }

    onConfirmClick = async () => {

        const csRefund = Object.assign({}, this.state.csRefund);

        let return_chk = this.setValidatedObj(csRefund);
        if(!return_chk){
            return false;
        }

        if(window.confirm("전표를 발행하시겠습니까?")){
            const csDay = csRefund.csDay;
            const csRefundOrderSeq = csRefund.orderNo;
            const csAmount = csRefund.csRefundPrice;
            const csRefundDesc = csRefund.csRefundDesc;
            //전표발급
            const {data: errRes, status} = await addCsRefundOrder(csDay, csAmount, csRefundOrderSeq, csRefundDesc);
            if (errRes.resCode) {
                alert(errRes.errMsg);
                return;
            } else {
                alert('전표가 발행되었습니다.')
                this.onCancelClick();
            }
        }

    };

    onDateChange = (date) => {
        let csRefund = Object.assign({}, this.state.csRefund);
        let obj_state = {};
        csRefund["csDay"] = moment(date.endOf('day')).format("YYYY-MM-DD");
        obj_state.csRefund = csRefund;
        this.setState(obj_state);
    }

    render() {
        const { csRefund } = this.state;

        const star = <span className='text-danger'>*</span>;

        return (
            <div>

                <div className='pt-0 pl-2 pr-2 pb-1'>
                    <FormGroup>
                        <Alert color={'secondary'} className='small'>
                            수동전표발행 <br/>
                            샵블리 오피셜로 전표를 발행합니다. <br/>
                            금액을 -금액으로 입력하면 -전표입니다. <br/>
                            메모는 비고 작성시에만 들어갑니다. <br/>
                        </Alert>
                    </FormGroup>

                    <FormGroup>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>주문그룹번호</Label>
                            <span className="ml-2">{csRefund.orderGroupNo}</span>
                        </div>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>주문 번호</Label>
                            <span className="ml-2">{csRefund.orderNo}</span>
                        </div>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>상품명</Label>
                            <span className="ml-2">{csRefund.goodsNm}</span>
                        </div>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>주문자</Label>
                            <span className="ml-2">{csRefund.consumerNm}</span>
                        </div>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>주문자EMail</Label>
                            <span className="ml-2">{csRefund.consumerEmail ? csRefund.consumerEmail:''}</span>
                        </div>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>주문자연락처</Label>
                            <span className="ml-2">{csRefund.consumerPhone ? csRefund.consumerPhone:''}</span>
                        </div>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>주문금액</Label>
                            <span className="ml-2">{ComUtil.addCommas(csRefund.orderPrice)}원</span>
                        </div>
                        <div className="mb-2" >
                            <Label className={'font-weight-bold text-secondary small'}>전표일자 {star}</Label>
                            <div className="input-group">
                                {
                                    csRefund.csRefundFlag ?
                                        moment(csRefund.csDay).format("YYYY-MM-DD")
                                        :
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
                                }
                            </div>
                        </div>
                        <div className="mb-2" >
                            <Label className={'font-weight-bold text-secondary small'}>전표금액 {star}</Label>
                            <div className="input-group">
                                {
                                    csRefund.csRefundFlag ?
                                        ComUtil.addCommas(csRefund.orderPrice)
                                        :
                                        <input type="number"
                                               name={'csRefundPrice'}
                                               className="ml-1"
                                               style={{width:'400px'}}
                                               value={csRefund.csRefundPrice||""}
                                               placeholder={'전표금액'}
                                               onChange={this.onInputChange} />
                                }
                            </div>
                        </div>
                        <div className="mb-2" >
                            <Label className={'font-weight-bold text-secondary small'}>비고</Label>
                            <div className="input-group">
                                {
                                    csRefund.csRefundFlag ?
                                        csRefund.csRefundDesc
                                        :
                                        <input type="text"
                                               name={'csRefundDesc'}
                                               className="ml-1"
                                               style={{width:'600px'}}
                                               value={csRefund.csRefundDesc||""}
                                               placeholder={'비고'}
                                               onChange={this.onInputChange} />
                                }
                            </div>
                        </div>
                    </FormGroup>

                    <div className="d-flex">
                        <div className='flex-grow-1 p-1'>
                            <Button onClick={this.onCancelOnlyCloseClick} block color={'warning'}>취소</Button>
                        </div>
                        <div className='flex-grow-1 p-1'>
                            {
                                (csRefund.payStatus === 'cancelled' || csRefund.payStatus === 'revoked') ?
                                    <>
                                        <Button disabled={true} block>주문 취소된 내역</Button>
                                    </>
                                    :
                                    csRefund.csRefundFlag ?
                                        <Button onClick={this.onCsCancelClick} block color={'danger'}>전표취소</Button>
                                        :
                                        <Button onClick={this.onConfirmClick} block color={'info'}>수동전표발행</Button>
                            }
                        </div>
                    </div>

                </div>

            </div>
        )
    }
}