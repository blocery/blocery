import React, {Fragment, useEffect, useRef, useState} from 'react';
import {Button, Input, Modal, ModalBody, ModalHeader} from 'reactstrap';
import Switch from "react-switch";
import ComUtil from '~/util/ComUtil'
import Textarea from 'react-textarea-autosize'
import { getOrderDetailByOrderSeq, getGoodsQnaByGoodsQnaNo, setGoodsQnaAnswerByGoodsQnaNo } from '~/lib/producerApi';
import { toast } from 'react-toastify'; //토스트
import 'react-toastify/dist/ReactToastify.css';
import { Server } from '~/components/Properties'
import {Flex, Div, Span, Img, Space, Right} from "~/styledComponents/shared";
import BasicSwiper from "~/components/common/swipers/BasicSwiper";
import {color} from "~/styledComponents/Properties";
import {useModal} from "~/util/useModal";
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
const ProducerQnaAnswer = (props) => {

    const inputAnswerNameEl = useRef(null)
    const inputRefundAmtEl = useRef(null)
    const inputCalRateEl = useRef(null)

    const [isModalOpen, , selected, setSelected, , toggle] = useModal(false)

    const [allim, setAllim] = useState(true);
    const [qnaStat, setQnaStat] = useState("");
    const [claimProcStat, setClaimProcStat] = useState("");
    const [calRate, setCalRate] = useState(0);
    const [calAmt, setCalAmt] = useState(0);

    const [state, setState] = useState({
        goodsQnaNo: props.goodsQnaNo,
        goodsQna: null,
        order: null,
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
            goodsQna.goodsAns = '안녕하세요. 사랑을 전하는 샵블리(SHOPBLY) 고객센터입니다.'
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
        if(goodsQna.goodsQnaStat && (goodsQna.goodsQnaStat === "processing"||goodsQna.goodsQnaStat === "success")) {
            setQnaStat(goodsQna.goodsQnaStat)
        }
        if(goodsQna.qaClaimProcStat && (goodsQna.qaClaimProcStat === "reject" || goodsQna.qaClaimProcStat === "confirm")){
            setClaimProcStat(goodsQna.qaClaimProcStat)
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

    const onQnaStatChange = (e) => {
        const { name, value } = e.target;
        setQnaStat(value)
    }

    const onClaimProcStatChange = (e) => {
        const { name, value } = e.target;
        setClaimProcStat(value)
    }

    const onAllimChange = () => {
        setAllim(!allim)
    }

    const onCalRateChange = (e) => {
        const orderInfo = Object.assign({}, state.order);
        const { name, value } = e.target;
        const adminOrderPrice = orderInfo.adminOrderPrice;
        const rate = MathUtil.dividedBy(value, 100);
        const calAmt = MathUtil.multipliedBy(adminOrderPrice,rate);
        setCalRate(value)
        setCalAmt(calAmt)
    }

    const onClose = (refreash) => {
        props.onClose(refreash) //부모(GoodsQnaList.js) callback
    }

    const onModify = () => {
        setState({
            ...state,
            act:'U'
        })
    }

    const onSave = async () => {
        const goodsQna = Object.assign({}, state.goodsQna);
        let confirmMsg = "답변저장을 하시겠습니까?";

        if (!goodsQna.goodsAns) {
            notify('답변내용을 입력해 주십시오!', toast.warn);
            return
        }

        if(goodsQna.goodsQnaStat === "ready") {
            if (qnaStat === "") {
                notify('진행상태를 선택해 주세요.', toast.warn);
                return
            }
        }

        if (qnaStat !== "") {
            goodsQna.goodsQnaStat = qnaStat;
        }

        if(goodsQna.qaClaimKind){
            if(goodsQna.qaClaimProcStat === "" || goodsQna.qaClaimProcStat === "request"){
                if(claimProcStat !== "") {
                    goodsQna.qaClaimProcStat = claimProcStat;
                }
            }
        }

        if(!goodsQna.answerName) goodsQna.answerName = "고객센터";

        if(window.confirm(confirmMsg)){
            const { status, data } = await setGoodsQnaAnswerByGoodsQnaNo(goodsQna,allim);
            if(status !== 200){
                if(data === -2){
                    notify('소비자가 문의 취소하여 삭제한 문의내용입니다.', toast.error);
                    return
                }
                notify('저장중 에러가 발생하였습니다.', toast.error);
                return
            }
            notify('저장 되었습니다.', toast.success);
            onClose(true);  //부모(GoodsQnaList.js) callback
        }
    }
    const {kind, data: selectedData} = selected || {kind: '', data: []}
    if(!state.goodsQna) return null;
    const { goodsQna, order } = state;
    return(
        <Fragment>
            <Div maxHeight={500} overflow={'auto'}>
                <div className={'p-3'}>
                    <div className={'p-2 small border-bottom'}>
                        문의타입 : {goodsQna.qaType === 0 && "상품문의"}{goodsQna.qaType === 1 && "판매자문의"}{goodsQna.qaType === 9 && "고객센터문의"}
                    </div>
                    <div className={'p-2 small border-bottom'}>
                        문의유형 : {goodsQna.qaKind ? goodsQna.qaKind:"없음"}
                    </div>
                    {
                        goodsQna.qaClaimKind &&
                            <div className={'p-2 small border-bottom'}>
                                문의종류 : {goodsQna.qaClaimKind}
                            </div>
                    }
                    {
                        (goodsQna.qaClaimKind && goodsQna.qaClaimMethod) &&
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
                                    [주문번호 : {goodsQna.orderSeq}] <br/>
                                    {
                                        order && <>
                                            주문금액 : <Span bold>{ComUtil.addCommas(order.adminOrderPrice)}</Span> , 배송비: {ComUtil.addCommas(order.adminDeliveryFee)}, 카드금액 : {ComUtil.addCommas(order.adminCardPrice)}, 토큰결제: {ComUtil.addCommas(order.adminBlctToken)}({ComUtil.addCommas(MathUtil.roundHalf(MathUtil.multipliedBy(order.adminBlctToken,order.orderBlctExchangeRate)))}원), 쿠폰Bly: {ComUtil.addCommas(order.usedCouponBlyAmount)}({ComUtil.addCommas(MathUtil.roundHalf(MathUtil.multipliedBy(order.usedCouponBlyAmount,order.orderBlctExchangeRate)))}원), 환율:{order.orderBlctExchangeRate}
                                        </>
                                    }
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
                                {
                                    (state.act === 'U' || state.act === 'P') ?
                                        <Input ref={inputAnswerNameEl}  type={'text'}
                                               name='answerName'
                                               style={{
                                                   width:'100%',
                                                   borderColor: `${color.light}!important`,
                                                   borderRadius: '3px'
                                               }}
                                               maxLength="10"
                                               placeholder={'답변자를 입력해 주세요!'}
                                               value={goodsQna.answerName || "고객센터"}
                                               onChange={onGoodsQnaAnsChange} />
                                        : <>답변자 : {goodsQna.answerName || "고객센터"}</>
                                }
                            </div>
                            <div className={'m-2 text-secondary ml-auto'}>
                                { goodsQna.goodsAnsDate && ComUtil.utcToString(goodsQna.goodsAnsDate,'YYYY-MM-DD HH:mm')}
                            </div>
                        </div>
                        <div className={'p-2'} style={{whiteSpace:"pre-line"}}>
                            {
                                (state.act === 'U' || state.act === 'P') ?
                                    <Textarea
                                        name="goodsAns"
                                        style={{width: '100%', minHeight: 300, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}
                                        className={'border-info'}
                                        rows={3}
                                        maxRows={3}
                                        onChange={onGoodsQnaAnsChange}
                                        placeholder='문의에 대한 답변내용을 입력해 주세요.'>{goodsQna.goodsAns}</Textarea>
                                    :
                                    <p style={{whiteSpace:"pre-line"}}>
                                        {goodsQna.goodsAns}
                                    </p>
                            }
                        </div>
                    </div>
                    <div>
                        <Flex p={2}>
                            <Space>
                                <Div minWidth={220}>
                                    진행상태 {(state.act === 'U' || state.act === 'P') ? (goodsQna.goodsQnaStat && goodsQna.goodsQnaStat == "ready") && "(대기)":""}
                                </Div>
                                <Div>
                                    {
                                        (state.act === 'U' || state.act === 'P') ?
                                            <Input type='select' name='qnaStat' id='qnaStat' style={{width: 170}} value={qnaStat||""} onChange={onQnaStatChange}>
                                                {/*<option name={"goodsQnaStat_0"} value={"ready"}>대기</option>*/}
                                                <option name={"qnaStat_-1"} value={""}>선택</option>
                                                <option name={"qnaStat_1"} value={"processing"}>진행중</option>
                                                <option name={"qnaStat_2"} value={"success"}>처리완료</option>
                                            </Input>
                                            :
                                            <Div fg={"green"}>
                                                {goodsQna.goodsQnaStat === "ready" && "대기"}{goodsQna.goodsQnaStat === "processing" && "진행중"}{goodsQna.goodsQnaStat === "success" && "처리완료"}
                                            </Div>
                                    }
                                </Div>
                            </Space>
                        </Flex>
                    </div>
                    {
                        goodsQna.qaClaimKind &&
                        <div>
                            <Flex p={2}>
                                <Space>
                                    <Div minWidth={220}>
                                        관리자 클레임 상태

                                        {
                                            (state.act === 'U' || state.act === 'P') &&
                                            <>
                                                {goodsQna.qaClaimProcStat === "" && "(미처리)"}{goodsQna.qaClaimProcStat === "request" && "(생산자요청)"}{goodsQna.qaClaimProcStat === "reject" && "(반려)"}{goodsQna.qaClaimProcStat === "confirm" && "(승인)"}
                                            </>
                                        }

                                    </Div>
                                    <Div>
                                        {
                                            (state.act === 'U' || state.act === 'P') ?
                                                <Input type='select' name='qaClaimProcStat' id='qaClaimProcStat' style={{width: 170}} value={claimProcStat||""} onChange={onClaimProcStatChange}>
                                                    <option name={"qaClaimProcStat_-1"} value={""}>선택</option>
                                                    {/*<option name={"qaClaimProcStat_0"} value={""}>미처리</option>*/}
                                                    {/*<option name={"qaClaimProcStat_1"} value={"request"}>생산자요청</option>*/}
                                                    <option name={"qaClaimProcStat_2"} value={"reject"}>반려</option>
                                                    <option name={"qaClaimProcStat_3"} value={"confirm"}>승인</option>
                                                </Input>
                                                :
                                                <Div fg={"green"}>
                                                    {goodsQna.qaClaimProcStat === "" && "미처리"}{goodsQna.qaClaimProcStat === "request" && "생산자요청"}{goodsQna.qaClaimProcStat === "reject" && "반려"}{goodsQna.qaClaimProcStat === "confirm" && "승인"}
                                                </Div>
                                        }
                                    </Div>
                                </Space>
                            </Flex>
                        </div>
                    }
                    {
                        (goodsQna.qaClaimKind && goodsQna.qaClaimKind == "환불") &&
                        <Flex p={2}>
                            <Space>
                                <Div minWidth={220}>
                                    {goodsQna.qaClaimKind}
                                </Div>
                                <Div>
                                    {
                                        (state.act === 'U' || state.act === 'P') ?
                                            <Input type='select' name='qaClaimMethod' id='qaClaimMethod' style={{width: 170}} value={goodsQna.qaClaimMethod||""} onChange={onGoodsQnaAnsChange}>
                                                <option name={"qaClaimMethod_0"} value={"전체 환불"}>전체 환불</option>
                                                <option name={"qaClaimMethod_1"} value={"부분 환불"}>부분 환불</option>
                                            </Input>
                                            :
                                            <>{goodsQna.qaClaimMethod}</>
                                    }
                                </Div>
                            </Space>
                        </Flex>
                    }
                    <Div p={2}>
                        {
                            ( (goodsQna.qaClaimKind && goodsQna.qaClaimMethod) && goodsQna.qaClaimMethod === '부분 환불') &&
                            <>
                                <Flex p={2}>
                                    <Div minWidth={220}>
                                        환불정보
                                    </Div>
                                    <Div>
                                        <Span fontSize={10}>은행</Span> {goodsQna.bankName} / <Span fontSize={10}>계좌번호</Span> {goodsQna.bankAccount} / <Span fontSize={10}>예금주</Span> {goodsQna.bankAccountHolder}
                                    </Div>
                                </Flex>
                                <Flex p={2}>
                                    <Div minWidth={220}>
                                        주문금액
                                        {
                                            (state.act === 'U' || state.act === 'P') &&
                                            <>{order && ComUtil.addCommas(order.adminOrderPrice)}원</>
                                        }
                                    </Div>
                                    {
                                        (state.act === 'U' || state.act === 'P') ?
                                            <>
                                                <Div ml={5}>
                                                    <Input ref={inputCalRateEl}  type={'number'}
                                                           name="calRate"
                                                           style={{
                                                               width:'100px',
                                                               borderColor: `${color.light}!important`,
                                                               borderRadius: '3px'
                                                           }}
                                                           maxLength="10"
                                                           placeholder={'%비율'}
                                                           value={calRate||""}
                                                           onChange={onCalRateChange} />
                                                </Div>
                                                <Div>%</Div>
                                                <Div ml={5}> = <Span bold>{ComUtil.addCommas(calAmt)}원</Span> (편하게 %비율로 계산해 보세요. 참고용)</Div>
                                            </>
                                            :
                                            <Div>{order && ComUtil.addCommas(order.adminOrderPrice)}원</Div>
                                    }
                                </Flex>
                                <Flex p={2}>
                                    <Div minWidth={220}>환불금액 </Div>
                                    {
                                        (state.act === 'U' || state.act === 'P') ?
                                            <Input ref={inputRefundAmtEl}  type={'number'}
                                                   name="refundAmt"
                                                   style={{
                                                       width:'200px',
                                                       borderColor: `${color.light}!important`,
                                                       borderRadius: '3px'
                                                   }}
                                                   maxLength="10"
                                                   placeholder={'환불금액을 입력해 주세요!'}
                                                   value={goodsQna.refundAmt||""}
                                                   onChange={onGoodsQnaAnsChange} />
                                            :
                                            <>{ComUtil.addCommas(goodsQna.refundAmt)}원</>
                                    }
                                </Flex>
                            </>
                        }
                    </Div>
                    <Div p={2}>
                        <Flex mb={16} alignItems={'flex-start'}>
                            <Div minWidth={220}>관리자용 메모 </Div>
                            <Div flexGrow={1}>
                                <textarea
                                    name={'adminMemo'}
                                    style={{width:'100%',}}
                                    placeholder={'관리자용 메모'}
                                    disabled={(state.act === 'U' || state.act === 'P') ? false:true}
                                    value={goodsQna.adminMemo}
                                    onChange={onGoodsQnaAnsChange}
                                />
                            </Div>
                        </Flex>
                    </Div>

                    <Flex m={2}>
                        <Right>
                            <Space>
                                <Button onClick={onClose}>{(state.act === 'U' || state.act === 'P') ? '취소':'닫기' }</Button>
                                {
                                    state.act === 'R' && <Button color={'info'} onClick={onModify}>수정모드</Button>
                                }
                                {
                                    (state.act === 'U' || state.act === 'P') &&
                                        <>
                                            <Button color={'info'} onClick={onSave}>저장</Button>
                                            <Flex>
                                                <Div bold>소비자알림</Div>
                                                <Div>
                                                    <Switch checked={allim} onChange={onAllimChange}></Switch>
                                                </Div>
                                            </Flex>
                                        </>
                                }
                            </Space>
                        </Right>
                    </Flex>
                </div>
            </Div>

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

export default ProducerQnaAnswer