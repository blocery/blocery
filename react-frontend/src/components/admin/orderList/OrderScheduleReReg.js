import React, { Component, PropTypes } from 'react'
import { FormGroup, Label, Alert, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import Select from 'react-select'
import moment from 'moment-timezone'
import 'react-dates/lib/css/_datepicker.css';
import 'react-dates/initialize';
import { SingleDatePicker } from 'react-dates';
import {FaSearchPlus} from 'react-icons/fa'
import { BlocerySpinner, B2cGoodsSelSearch } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import { getTimeSaleAdmin, setSuperRewardRegist, setSuperRewardUpdate } from '~/lib/adminApi'
import Style from './OrderCardTempReReg.module.scss'
import importImpUid from '~/images/importImpUid.png'
import axios from "axios";
import {Server} from "~/components/Properties";
import {getOrdersByOrderGroupNo} from "~/lib/shopApi";
import {map} from "lodash";
import {getGoodsByGoodsNo} from "~/lib/goodsApi";
export default class OrderScheduleReReg extends Component {
    constructor(props) {
        super(props);

        const {
            orderGroupNo,
            orderNo,
            scheduleAtTime,
            goodsNm,
            consumerNm,
            consumerEmail,
            consumerPhone,
            cardPrice,
            impUid
        } = this.props;

        this.state = {
            reOrder: {
                impUid:impUid,              // 아임포트 impPgId
                merchantUid:orderGroupNo,   // 주문그룹번호 (아임포트 주문번호)
                orderNo:orderNo,            // 주문번호
                scheduleAtTime:scheduleAtTime,
                goodsNm:goodsNm,            // 상품명
                consumerNm:consumerNm,
                consumerEmail:consumerEmail,
                consumerPhone:consumerPhone,
                cardPrice:cardPrice
            }
        };
    }

    //밸리데이션 체크
    setValidatedObj = (reOrder) => {
        if(!reOrder.impUid) {
            alert("imp_uid 필수 입니다.");
            return false;
        }
        return true;
    };

    onCancelClick = () => {
        // 닫기(취소), 리스트 리플래시(재조회)
        let params = {
            refresh:true
        };
        this.props.onClose(params);
    };
    onConfirmClick = async () => {
        //등록 및 수정 처리
        const reOrder = Object.assign({}, this.state.reOrder);

        let return_chk = this.setValidatedObj(reOrder);
        if(!return_chk){
            return false;
        }

        if(window.confirm("다음날로 예약처리 하시겠습니까?")){
            // PG 결제일경우
            if (reOrder.impUid && reOrder.impUid.length > 0) {
                axios(
                    Server.getRestAPIHost() + "/iamport/setNextScheduleReq",
                    {
                        method: "post",
                        headers: {"Content-Type": "application/json"},
                        data: {
                            impUid: reOrder.impUid,
                            merchantUid: reOrder.merchantUid
                        },
                        withCredentials: true,
                        credentials: 'same-origin'
                    }
                ).then(async ({data}) => {
                    if (data.resultStatus === "success") {
                        alert("예약 처리 완료되었습니다!!")
                        this.onCancelClick();
                    }else{
                        alert("실패");
                        this.onCancelClick();
                    }

                });
            }
        }
    };

    render() {
        const { reOrder } = this.state;

        const star = <span className='text-danger'>*</span>;

        return (
            <div className={Style.wrap}>

                <div className='pt-0 pl-2 pr-2 pb-1'>
                    <FormGroup>
                        <Alert color={'secondary'} className='small'>
                            예약실패로 예약이 다음날로 예약처리가 안되어 있을 경우
                        </Alert>
                    </FormGroup>

                    <FormGroup>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>주문 번호</Label>
                            <span className="ml-2">{reOrder.orderNo}</span>
                        </div>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>상품명</Label>
                            <span className="ml-2">{reOrder.goodsNm}</span>
                        </div>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>주문예약결제</Label>
                            <span className="ml-2">{reOrder.scheduleAtTime > 0 ? "일시 "+ComUtil.longToDateTime(reOrder.scheduleAtTime):""}</span>
                        </div>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>주문자</Label>
                            <span className="ml-2">{reOrder.consumerNm}</span>
                        </div>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>주문자EMail</Label>
                            <span className="ml-2">{reOrder.consumerEmail ? reOrder.consumerEmail:''}</span>
                        </div>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>주문자연락처</Label>
                            <span className="ml-2">{reOrder.consumerPhone ? reOrder.consumerPhone:''}</span>
                        </div>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>카드결제금액</Label>
                            <span className="ml-2">{reOrder.cardPrice}원</span>
                        </div>
                        <div className="mb-2">
                            <Label className={'font-weight-bold text-secondary small'}>merchant_uid(주문그룹번호){star}</Label>
                            <span className="ml-2">{reOrder.merchantUid}</span>
                        </div>
                        <div className="mb-2" >
                            <Label className={'font-weight-bold text-secondary small'}>imp_uid {star}</Label>
                            <span className="ml-2">{reOrder.impUid}</span>
                        </div>
                    </FormGroup>

                    <div className="d-flex">
                        <div className='flex-grow-1 p-1'>
                            <Button onClick={this.onCancelClick} block color={'warning'}>취소</Button>
                        </div>
                        <div className='flex-grow-1 p-1'>
                            <Button onClick={this.onConfirmClick} block color={'info'}>저장</Button>
                        </div>
                    </div>

                </div>

            </div>
        )
    }
}