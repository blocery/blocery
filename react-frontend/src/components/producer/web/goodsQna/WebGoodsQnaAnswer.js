import React, {Fragment, useEffect, useState} from 'react';
import {Button, Input, Modal, ModalBody, ModalHeader} from 'reactstrap';
import ComUtil from '~/util/ComUtil'
import Textarea from 'react-textarea-autosize'
import { getOrderDetailByOrderSeq, getGoodsQnaByGoodsQnaNo, setGoodsQnaAnswerByGoodsQnaNo } from '~/lib/producerApi';

import { toast } from 'react-toastify'; //토스트
import 'react-toastify/dist/ReactToastify.css';
import { Server } from '~/components/Properties'

import BasicSwiper from "~/components/common/swipers/BasicSwiper";
import {Div, Flex, Img, Right, Space, Span} from "~/styledComponents/shared";
import {useModal} from "~/util/useModal";
import {color} from "~/styledComponents/Properties";
import MathUtil from "~/util/MathUtil";
const options = {
    lazy: true,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true
    },
}
const KIND = {
    IMAGE_VIEWER: 'imageViewer'
}
const WebGoodsQnaAnswer = (props) => {

    // const {openImageViewer} = useImageViewer();
    const [isModalOpen, , selected, setSelected, , toggle] = useModal(false)

    const [state, setState] = useState({
        goodsQnaNo: props.goodsQnaNo,
        goodsQna: null,
        act:"U"
    });

    const notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }

    useEffect(() => {
        async function fetch(){
            await search();
        }

        fetch()

    }, []);

    const search = async () => {
        const { data: goodsQna } = await getGoodsQnaByGoodsQnaNo(state.goodsQnaNo);
        //console.log({goodsQna });
        let vAct = "U";
        if(goodsQna.goodsQnaStat === "ready"){
            vAct = "U";
        }else if(goodsQna.goodsQnaStat === "processing"){
            vAct = "P";
        }else{
            vAct = "R";
        }
        let orderInfoData = null;
        if(goodsQna.orderSeq > 0) {
            const {data: orderData} = await getOrderDetailByOrderSeq(goodsQna.orderSeq)
            orderInfoData = orderData;
        }
        setState({
            ...state,
            act:vAct,
            goodsQna: goodsQna,
            order:orderInfoData
        })
    }

    const onImageClick = (index) => {
        //openImageViewer(state.goodsQna.qaImages, index)
        setSelected({kind: KIND.IMAGE_VIEWER, data: state.goodsQna.qaImages})
        toggle()
    }

    const onGoodsQnaAnsChange = (e) => {
        const { name, value } = e.target;
        const goodsQna = Object.assign({}, state.goodsQna);
        goodsQna[name] = value;
        setState({
            ...state,
            goodsQna: goodsQna
        })
    }

    const onClose = (refreash) => {
        props.onClose(refreash) //부모(GoodsQnaList.js) callback
    }

    const onSave = async (qnaStat) => {

        const goodsQnaData = Object.assign({}, state.goodsQna);

        let confirmMsg= "답변처리를 완료하시겠습니까?";

        // 미처리일경우 생산자가 답변을 달면 request
        if(goodsQnaData.qaClaimKind === "환불"){
            if(goodsQnaData.qaClaimMethod === "부분 환불"){
                if(goodsQnaData.qaClaimProcStat === null || goodsQnaData.qaClaimProcStat === "" || goodsQnaData.qaClaimProcStat === "request"){
                    confirmMsg = confirmMsg + " [관리자에게 요청이 갑니다]"
                    goodsQnaData.qaClaimProcStat = "request";
                    goodsQnaData.goodsQnaStat = "processing";
                }
            }
        }else{
            goodsQnaData.goodsQnaStat = qnaStat;
        }

        if (!goodsQna.goodsAns) {
            notify('답변내용을 입력해 주십시오!', toast.warn);
            return
        }
        // 생산자 답변시 생산자명
        goodsQnaData.answerName = goodsQnaData.producerName+"("+goodsQnaData.farmName+")";
        if(window.confirm(confirmMsg)) {
            const {status, data} = await setGoodsQnaAnswerByGoodsQnaNo(goodsQnaData);
            if (status !== 200) {
                if(data === -2){
                    notify('소비자가 문의 취소하여 삭제한 문의내용입니다.', toast.error);
                    return
                }
                notify('답변 처리중 에러가 발생하였습니다.', toast.error);
                return
            }
            notify('답변 처리 하였습니다.', toast.success);
            onClose(true);  //부모(GoodsQnaList.js) callback
        }
    }
    const onChangeAns = () => {
        setState({
            ...state,
            act: "U"
        })
    }

    const {kind, data: selectedData} = selected || {kind: '', data: []}
    if(!state.goodsQna) return null;
    const { goodsQna, order } = state;
    return(
        <Fragment>

            <div className={'p-3'}>
                <div className={'p-2 small border-bottom'}>
                    문의타입 : {goodsQna.qaType === 0 && "상품문의"}{goodsQna.qaType === 1 && "판매자문의"}{goodsQna.qaType === 9 && "고객센터문의"}
                </div>
                <div className={'p-2 small border-bottom'}>
                    문의종류 : {goodsQna.qaKind ? goodsQna.qaKind:"없음"}
                </div>
                {
                    goodsQna.qaClaimKind &&
                    <div className={'p-2 small border-bottom'}>
                        문의종류 : {goodsQna.qaClaimKind}
                    </div>
                }
                {
                    goodsQna.qaClaimMethod &&
                    <div className={'p-2 small border-bottom'}>
                        세부사항 : {goodsQna.qaClaimMethod}
                    </div>
                }
                {
                    goodsQna.goodsNo > 0 &&
                    <div className={'d-flex align-items-center m-2 border p-2'}>
                        <img className={'rounded-sm mr-3'} style={{width: 60, height: 60, objectFit: 'cover'}} src={Server.getThumbnailURL() + goodsQna.goodsImages[0].imageUrl}/>
                        <div>{ goodsQna.goodsName }</div>
                        <div className={'ml-auto small text-secondary'}>상품번호({goodsQna.goodsNo})</div>
                    </div>
                }

                <div className={'m-2 border'}>
                    {
                        goodsQna.orderSeq > 0 &&
                        <div className={'p-2 small'}>
                            [주문번호 : {goodsQna.orderSeq}] {order && <> - 주문금액: {ComUtil.addCommas(order.adminOrderPrice)} </>}
                            {/*{*/}
                            {/*    order && <>*/}
                            {/*        주문금액 : {ComUtil.addCommas(order.adminOrderPrice)}, 배송비: {ComUtil.addCommas(order.adminDeliveryFee)}, 카드금액 : {ComUtil.addCommas(order.adminCardPrice)}, 토큰결제: {ComUtil.addCommas(order.adminBlctToken)}({ComUtil.addCommas(MathUtil.roundHalf(MathUtil.multipliedBy(order.adminBlctToken,order.orderBlctExchangeRate)))}원), 쿠폰Bly: {ComUtil.addCommas(order.usedCouponBlyAmount)}({ComUtil.addCommas(MathUtil.roundHalf(MathUtil.multipliedBy(order.usedCouponBlyAmount,order.orderBlctExchangeRate)))}원), 환율:{order.orderBlctExchangeRate}*/}
                            {/*    </>*/}
                            {/*}*/}
                        </div>
                    }
                    <div className={'p-2 d-flex align-items-center bg-light border-bottom'}>
                        <div className={'f1  p-1 pl-3 pr-3 font-weight-bolder bg-info text-white rounded-sm mr-2'}>
                            Q
                        </div>
                        <div>
                            { goodsQna.consumerName }
                        </div>
                        <div className={'m-2 text-secondary ml-auto'}>
                            {goodsQna.goodsQueDate && ComUtil.utcToString(goodsQna.goodsQueDate,'YYYY-MM-DD HH:mm')}
                        </div>
                    </div>
                    <div className={'p-2'} style={{whiteSpace:"pre-line"}}>
                        {goodsQna.goodsQue}
                    </div>
                    <div className={'p-2'} >
                        {
                            goodsQna.qaImages && goodsQna.qaImages.length > 0 &&
                            <BasicSwiper options={options}>
                                {
                                    goodsQna.qaImages.map((image, index) =>
                                        <Img key={'qaImage'+index+'_'+image.imageUrl}
                                             maxWidth={150}
                                             maxHeight={150}
                                             cover
                                             src={Server.getThumbnailURL() + image.imageUrl}
                                             alt={image.imageNm}
                                             onClick={onImageClick.bind(this, goodsQna.qaImages, index)}
                                        />
                                    )
                                }
                            </BasicSwiper>
                        }
                    </div>
                </div>

                <div className={'m-2 border'}>
                    {
                        goodsQna.producerNo > 0 &&
                        <div className={'p-2 small'}>
                            [생산자 : {goodsQna.producerName}({goodsQna.farmName})]
                        </div>
                    }
                    <div className={'p-2 d-flex align-items-center bg-light border-bottom'}>
                        <div className={'f1  p-1 pl-3 pr-3 font-weight-bolder bg-danger text-white rounded-sm mr-2'}>
                            A
                        </div>
                        <div>
                            답변자 : {goodsQna.answerName || goodsQna.producerName+"("+goodsQna.farmName+")"}
                        </div>
                        <div className={'m-2 text-secondary ml-auto'}>
                            { goodsQna.goodsAnsDate && ComUtil.utcToString(goodsQna.goodsAnsDate,'YYYY-MM-DD HH:mm')}
                        </div>
                    </div>
                    <div className={'p-2'} style={{whiteSpace:"pre-line"}}>
                        {
                            state.act === 'U' ?
                                <Textarea
                                    name="goodsAns"
                                    style={{width: '100%', minHeight: 100, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}
                                    className={'border-info'}
                                    rows={3}
                                    maxRows={3}
                                    onChange={onGoodsQnaAnsChange}
                                    placeholder='상품문의에 대한 답변내용을 입력해 주세요.'>{goodsQna.goodsAns}</Textarea>
                                :
                                <Flex>
                                <p style={{whiteSpace:"pre-line"}}>
                                    {goodsQna.goodsAns}
                                </p>
                                    <Right>
                                        <Button onClick={onChangeAns}>수정</Button>
                                    </Right>
                                </Flex>
                        }
                    </div>
                </div>
                <Flex p={2}>
                    <Space>
                        <Div minWidth={150}>
                            진행상태
                        </Div>
                        <Div fg={"green"}>
                            {goodsQna.goodsQnaStat === "ready" && "대기"}{goodsQna.goodsQnaStat === "processing" && "진행중"}{goodsQna.goodsQnaStat === "success" && "처리완료"}
                        </Div>
                    </Space>
                </Flex>
                {
                    (goodsQna.qaClaimKind) &&
                        <Div p={2}>
                            <Space>
                                <Div minWidth={150}>
                                    관리자 클레임 상태
                                </Div>
                                <Div fg={"green"}>
                                    {goodsQna.qaClaimProcStat === null && "미처리"}{goodsQna.qaClaimProcStat === "" && "미처리"}{goodsQna.qaClaimProcStat === "request" && "생산자요청"}{goodsQna.qaClaimProcStat === "reject" && "반려"}{goodsQna.qaClaimProcStat === "confirm" && "승인"}
                                </Div>
                            </Space>
                        </Div>
                }
                {
                    (goodsQna.qaClaimKind && goodsQna.qaClaimKind == "환불") &&
                    <Flex p={2}>
                        <Space>
                            <Div minWidth={150}>
                                {goodsQna.qaClaimKind}
                            </Div>
                            <Div>
                                {
                                    state.act === 'U' ?
                                        <Input type='select' name='qaClaimMethod' id='qaClaimMethod' style={{width: 170}} value={goodsQna.qaClaimMethod||""} onChange={onGoodsQnaAnsChange}>
                                            <option name={"qaClaimMethod_0"} value={"전체 환불"}>전체 환불</option>
                                            <option name={"qaClaimMethod_1"} value={"부분 환불"}>부분 환불</option>
                                        </Input>
                                        :
                                        <Div fg={"green"}>{goodsQna.qaClaimMethod}</Div>
                                }
                            </Div>
                        </Space>
                    </Flex>
                }

                {
                    ( (goodsQna.qaClaimMethod) && goodsQna.qaClaimMethod === '부분 환불') &&
                    <div>
                        {
                            (goodsQna.bankName && goodsQna.bankAccount && goodsQna.bankAccountHolder) &&
                            <Div p={2}>
                                <Flex p={2}>
                                    <Space>
                                        <Div minWidth={150}>
                                            환불정보
                                        </Div>
                                        <Div>
                                            <Span fontSize={10}>은행</Span> {goodsQna.bankName} / <Span fontSize={10}>계좌번호</Span> {goodsQna.bankAccount} / <Span fontSize={10}>예금주</Span> {goodsQna.bankAccountHolder}
                                        </Div>
                                    </Space>
                                </Flex>
                            </Div>
                        }
                        {
                            goodsQna.refundAmt > 0 &&
                                <Div p={2}>
                                    <Flex p={2}>
                                        <Space>
                                            <Div minWidth={150}>
                                                환불금액
                                            </Div>
                                            <Div>
                                                {ComUtil.addCommas(goodsQna.refundAmt)}원
                                            </Div>
                                        </Space>
                                    </Flex>
                                </Div>
                        }
                    </div>
                }

                <div className={'m-2 d-flex justify-content-center'}>
                    <Button onClick={onClose}>{state.act === 'U' ? '취소':'닫기' }</Button>
                    {
                        state.act === 'U' &&
                            <Button className={'ml-2'} color={'info'} onClick={onSave.bind(this,'success')}>답변처리</Button>
                    }
                </div>

            </div>

            <Modal isOpen={kind === KIND.IMAGE_VIEWER && isModalOpen} toggle={toggle} size={'md'} >
                <ModalHeader toggle={toggle}>
                    이미지
                </ModalHeader>
                <ModalBody>
                    {
                        selectedData.map(image =>
                            <Div p={16} mb={16} bc={'secondary'}>
                                <img style={{display: 'block', width: '100%'}} src={Server.getImageURL() + image.imageUrl} />
                            </Div>
                        )
                    }
                </ModalBody>
            </Modal>
        </Fragment>
    )

}
export default WebGoodsQnaAnswer