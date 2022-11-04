import React, {useEffect, useState, useRef} from 'react';
import {Button, Div, Flex, Grid, Input, Right, Space, Span} from "~/styledComponents/shared";
import {IoIosBarcode, IoMdAdd, IoMdRemove, IoMdRepeat} from "react-icons/io";
import ComUtil from "~/util/ComUtil";
import {color} from "~/styledComponents/Properties";
import BarcodeInput from "~/components/producer/mobile/common/BarcodeInput";
import {
    getOrderDetailByOrderSeq,
    producerCancelOrder,
    producerReplaceOrder,
    producerReplaceOrderRemove,
    setOrderConfirm,
    reqProducerOrderCancel,
    reqProducerOrderCancelBack, producerReplaceOrderCheck, replaceOrderPartRemove
} from '~/lib/producerApi'
import styled from "styled-components";
import {Badge} from "~/styledComponents/mixedIn";

const COLOR_FARMER_NAME = '#0032ff'

const FlexButton = styled(Button)`
    display: flex;
    align-items: center;
    justify-content: center;
`

const ConfirmBox = ({children}) => <Div p={10} mt={14} mb={10} bc={'darkBlack'} rounded={3}>{children}</Div>

//TODO refresh
const OrderFunctionality = ({orderDetail: od, refresh}) => {
    const [deleting, setDeleting] = useState(false);
    const [isOpenBarcodeReader, setOpenBarcodeReader] = useState(false)
    const [barcodeInfoList, setBarcodeInfoList] = useState([])
    const [totalReplaceOrderPrice, setTotalReplaceOrderPrice] = useState()
    const dummyRef = useRef()

    useEffect(() => {
        console.log("barcodeInfoList 변경 useEffect=============================")
        let totalReplacePrice = 0
        barcodeInfoList.map(item => totalReplacePrice += item.optionPrice * (item.barcodeOrderCount || 0))
        setTotalReplaceOrderPrice(totalReplacePrice)
    }, [barcodeInfoList])

    //주문확인
    const onOrderConfirm = async () => {

        try {
            //backend 저장.
            let {status, data} = await setOrderConfirm(od);

            if (status === 200) {
                const {resCode, errMsg, retData} = data
                if (resCode === 1) {
                    alert(errMsg);
                }
            }else{
                alert('네트워크 에러가 발생 하였습니다.')
            }

            refresh()

        }catch (err) {
            refresh()
        }
    }

    //배송전 주문취소 요청
    const onRequestCancelOrderClick = async () => {
        const producerCancelReason = window.prompt('취소사유 입력', '재고없음')
        if (!producerCancelReason) {
            return
        }

        setDeleting(true)

        const newOrderDetail = {
            ...od,
            reqProducerCancel: 1,
            producerCancelReason: producerCancelReason,
            cancelType:2
        }

        //배송전 주문 취소
        let {status, data} = await reqProducerOrderCancel(newOrderDetail)
        // let {status, data} = await producerCancelOrder(newOrderDetail);

        if (status === 200) {
            alert(data.errMsg)
            await refresh()
            //부모의 카운트 정보 업데이트
            //취소요청 카운트 업데이트
            //TODO
            // refreshCountInfo()
        }else{
            alert('네트워크 에러가 발생 하였습니다.')
        }

        setDeleting(false)
    }

    const onRequestReplaceOrderClickForDb = () => {
        setOpenBarcodeReader(!isOpenBarcodeReader)
    }

    //주문취소요청 철회
    // reqProducerOrderCancelBack
    const onReqProducerOrderCancelBackClick = async () => {

        if (!window.confirm("주문취소요청을 철회 하시겠습니까?"))
            return

        const {status, data} = await reqProducerOrderCancelBack(od.orderSeq)

        if (status === 200) {
            alert(data.errMsg)
            await refresh()
            //부모의 카운트 정보 업데이트
            //취소요청 카운트 업데이트
            //TODO
            // refreshCountInfo()
        }else{
            alert('네트워크 에러가 발생 하였습니다.')
        }

        setDeleting(false)
    }

    // const [cancelReason, setCancelReason] = useState()

    //배송전 주문취소
    //TODO 현재 state 로 관리 해야할지 ..
    const onCancelOrderClick = async () => {

        // const producerCancelReason = window.prompt('취소사유 입력', '재고없음')

        if (!od.producerCancelReason) {
            alert('취소사유가 입력되지 않았습니다. [취소요청 철회] 후 재시도 해 주세요.');
            return
        }

        if (!window.confirm(`취소사유(${od.producerCancelReason})가 맞습니까? 소비자 결제취소되며 이후 번복이 불가능 합니다!`))
            return

        setDeleting(true)

        const newOrderDetail = {
            ...od,
            // reqProducerCancel: 1,
            producerCancelReason: od.producerCancelReason,
            dpCancelReason: od.producerCancelReason,
            cancelType:2
        }

        //배송전 주문 취소
        let {status, data} = await producerCancelOrder(newOrderDetail);

        if (status === 200) {
            await refresh()
        }else{
            alert('네트워크 에러가 발생 하였습니다.')
        }

        setDeleting(false)
    }

    //대체상품 한건 취소
    const onRemoveOneReplaceOrderClick = async (csOrderSeq, localFarmerName, optionName, orderPrice, orderCnt) => {
        console.log({orderSeq: od.orderSeq, csOrderSeq: csOrderSeq})

        //전체 대체상품 금액 - 부분취소 할 금액
        const resPrice = od.replaceOrderPlusPrice - (orderPrice * orderCnt)
        let additionalMsg = ''
        if (od.replaceOrderPlusList.length > 1) {

            // console.log({totalReplaceOrderPrice: totalReplaceOrderPrice, orderPrice, orderCnt, resPrice})
            // console.log(`${resPrice} = ${totalReplaceOrderPrice} - (${orderPrice} * ${orderCnt})`)

            //취소 될 금액이 주문금액보다 작을 경우는 취소하지 못 하게(전체취소 유도)
            if (resPrice < od.orderPrice) {
                alert(`주문금액보다 대체상품된 금액이 작아짐으로 취소 할 수 없습니다. 금액이 작은것을 취소 하거나 전체취소 후 대체상품을 새로 입력 해 주세요.` )
                return
            }

            additionalMsg = ` ${ComUtil.addCommas(resPrice - od.orderPrice)}원 초과로 변경 됩니다.`
        }

        if (!window.confirm(`${localFarmerName} ${optionName} 을 취소 하시겠습니까?${additionalMsg}`)) return false
        const {status, data} = await replaceOrderPartRemove(od.orderSeq, csOrderSeq)
        if (status === 200) {
            if (data.resCode === 0) {
                refresh()
            }else{
                alert(data.errMsg)
            }
        }
    }

    //대체상품내역 전체 취소
    const onRemoveAllReplaceOrderClick = async () => {
        if (!window.confirm('대체상품을 전체 취소 하시겠습니까?')) return false
        const {status, data} = await producerReplaceOrderRemove(od.orderSeq)
        if (status === 200) {
            if (data.resCode === 0) {
                refresh()
            }else{
                alert(data.errMsg)
            }
        }
    }

    //orderSeq, data:db에서 조회된 data
    const onBarcodeRead = async ({action, data}) => {

        //{"optionName":"노각 1개","optionPrice":4000,"optionIndex":0,"producerNo":157,"localfoodFarmerNo":28,"localFarmerName":"[옥]이선미"}

        const newBarcodeInfoList = [...barcodeInfoList]

        //이미 기록된 바코드가 있으면 수량을 +1 증가
        if (action === 'duplicated') {
            const barcodeInfo = newBarcodeInfoList.find(item => item.barcode === data.barcode)
            barcodeInfo.barcodeOrderCount++
            setBarcodeInfoList(newBarcodeInfoList)
        }else { //success 신규 바코드
            setBarcodeInfoList(newBarcodeInfoList.concat(data))
        }

        // console.log({newBarcodeInfoList: newBarcodeInfoList})




    }

    const onChangeCountButtonClick = (num, barcode) => {
        const newBarcodeInfoList = [...barcodeInfoList]
        const barcodeInfo = newBarcodeInfoList.find(barcodeInfo => barcodeInfo.barcode === barcode)
        barcodeInfo.barcodeOrderCount = Number(barcodeInfo.barcodeOrderCount || 0) + num

        //개수가 0개 이하면 최소 1 유지
        if (barcodeInfo.barcodeOrderCount <= 0) {
            barcodeInfo.barcodeOrderCount = 1
            return
        }

        setBarcodeInfoList(newBarcodeInfoList)

        // + - 버튼 클룩 후 바코드인식 했을때 submit 못하도록 강제로 더미 div로 포커스 이동
        dummyRef.current.focus();
    }

    const onBarcodeOrderCountInputChange = (barcode, e) => {
        const newBarcodeInfoList = Object.assign([], barcodeInfoList)
        const barcodeInfo = newBarcodeInfoList.find(b => b.barcode === barcode)
        barcodeInfo.barcodeOrderCount = e.target.value
        setBarcodeInfoList(newBarcodeInfoList)
    }

    //0은 작성 못 하도록 함
    const onBarcodeOrderCountInputBlur = (barcode, e) => {
        if (Number(e.target.value || 0) <= 0) {
            const newBarcodeInfoList = Object.assign([], barcodeInfoList)
            const barcodeInfo = newBarcodeInfoList.find(b => b.barcode === barcode)
            if (barcodeInfo.barcodeOrderCount <= 0) {
                barcodeInfo.barcodeOrderCount = 1
                setBarcodeInfoList(newBarcodeInfoList)
            }
        }
    }

    const onRemoveBarcodeClick = (barcode) => {
        if (!window.confirm('삭제 하시겠습니까?')) return
        const newBarcodeInfoList = Object.assign([], barcodeInfoList)
        const index = newBarcodeInfoList.findIndex(item => item.barcode === barcode)
        newBarcodeInfoList.splice(index, 1)
        setBarcodeInfoList(newBarcodeInfoList)
    }

    //바코드 리더 취소
    const onCancelBarcodeClick = () => {

        if (barcodeInfoList.length > 0) {
            if (!window.confirm('모두 취소 하시겠습니까?')) {
                return
            }
        }

        setBarcodeInfoList([])
        setOpenBarcodeReader(false)
    }

    //바코드 완료
    const onFinishBarcodeClick = async () => {

        if (od.orderPrice - od.totalReplaceOrderPrice < -5000) {
            alert(`대체상품은 ${ComUtil.addCommas(5000)}원을 초과 할 수 없습니다.`)
            return
        }

        //orderSeq, barcodeCountList
        const barcodeList = barcodeInfoList.map(item => ({barcode: item.barcode, barcodeOrderCount: item.barcodeOrderCount}))
        console.log({orderSeq: od.orderSeq, barcodeList: barcodeList})
        const {status, data} = await producerReplaceOrder(od.orderSeq, barcodeList)

        if (status === 200) {

            //이미 대체상품이 지정 된 경우는 새로고침
            if (data.resCode === 204) {
                alert(data.errMsg)
                refresh()
                return
            }

            if (data.resCode === 0) {   //성공

                //초기화
                setBarcodeInfoList([])
                setOpenBarcodeReader(false)

                //새로고침
                refresh()
            }else{ //실패
                alert(data.errMsg)
            }
        }
    }
//10000 - 15001 = -5001
    const remainedReplaceOrderPrice = od.orderPrice - totalReplaceOrderPrice

    return (
        <>
            <Flex alignItems={'flex-start'} lineHeight={'normal'}>
                <Space>
                    {
                        od.payStatus === 'paid' &&  (
                            <>
                                {
                                    !od.orderConfirm && <Button fg={'white'} bg={'green'} fontSize={13} onClick={onOrderConfirm}>주문확인</Button>
                                }
                                {
                                    od.orderConfirm ==='confirmed' && <Button disabled fontSize={13}>배송대기</Button>
                                }
                                {
                                    od.orderConfirm === 'shipping' && <Button disabled fontSize={13}>출하완료</Button>
                                }
                                {
                                    //로컬푸드 소속 농가 상품만 주문취소요청 노출
                                    (od.orderConfirm !== 'shipping' && od.localfoodFarmerNo > 0 && od.reqProducerCancel !== 2) &&
                                    <Button fontSize={13} bg={'white'} bc={'light'} disabled={deleting || od.reqProducerCancel === 1} onClick={onRequestCancelOrderClick}>{deleting ? '취소요청중..' : od.reqProducerCancel === 0 ? '주문취소요청' : '주문취소요청함'}</Button>
                                }
                            </>
                        )
                    }
                    {/*{*/}
                    {/*    od.payStatus === 'cancelled' && <div>주문취소완료(<Span fg={'danger'}>{od.dpCancelReason}</Span>)</div>*/}
                    {/*}*/}
                    {
                        (od.refundFlag || od.payStatus === 'cancelled') && (
                            <Badge ml={'auto'} flexShrink={0} bg={'danger'} fg={'white'} fontSize={14}>
                                {od.refundFlag ? '환불' :
                                    od.payStatus === 'cancelled' &&
                                        od.cancelType === 0 ?
                                            od.dpCancelReason ? `생산자취소(${od.dpCancelReason})` : '소비자취소' :
                                            od.cancelType === 1 ? '소비자취소' : `생산자취소(${od.dpCancelReason})`}
                            </Badge>
                        )
                    }

                    {/*{*/}
                    {/*    (!webBarcodeRead && payStatus !== 'cancelled' && !objectUniqueNo && !orderDetail.replaceOrderSeq && orderDetail.orderCnt === 1) && <Button fontSize={13} bg={'white'} bc={'light'} onClick={onRequestReplaceOrderClick}>*/}
                    {/*        <Flex>*/}
                    {/*            <IoIosBarcode />*/}
                    {/*            <div>대체상품지정</div>*/}
                    {/*        </Flex>*/}
                    {/*    </Button>*/}
                    {/*}*/}
                    {
                        // (payStatus !== 'cancelled' && !objectUniqueNo && !replaceFlag) && (
                        (od.payStatus !== 'cancelled' && !od.replaceFlag) && ( //개체인식도 댗체 허옹
                            <Button fontSize={13} bg={'white'} bc={'light'} disabled={isOpenBarcodeReader} onClick={onRequestReplaceOrderClickForDb}>
                                <Flex>
                                    <IoIosBarcode />
                                    <div>대체상품지정</div>
                                </Flex>
                            </Button>
                        )
                    }
                </Space>
            </Flex>

            {
                od.reqProducerCancel === 1 && (
                    <ConfirmBox>
                        <Div mb={5} lighter>
                            취소사유 : <b>[{od.producerCancelReason}]</b> 이 맞습니까?
                        </Div>
                        <Grid templateColumns={'1fr 1fr'} colGap={10}>
                            <Button bg={'white'} fontSize={13} px={10} bc={'light'} block onClick={onReqProducerOrderCancelBackClick}>취소요청 철회</Button>
                            <Button fontSize={13} px={10} bg={'danger'} block fg={'white'} onClick={onCancelOrderClick}>주문취소 완료하기</Button>
                        </Grid>
                    </ConfirmBox>
                )
            }


            {/*{*/}
            {/*    //대체상품지정으로 전표 발생 된 경우*/}
            {/*    (orderDetail.replaceOrderSeq && payStatus !== 'cancelled') && (*/}
            {/*        <Div p={10} mt={14} mb={10} bg={'darkBlack'} fg={'white'} rounded={3}>*/}
            {/*            <Flex>*/}
            {/*                <IoMdRepeat color={'#36FF65'} style={{marginRight: 4}} /> 대체상품 지정완료<br/>*/}
            {/*                <Button ml={'auto'} bg={'darkBlack'} bc={'light'} fontSize={12} px={10} onClick={onReplaceOrderRemoveClick}>취소</Button>*/}
            {/*            </Flex>*/}

            {/*            <b>{orderDetail.replaceGoodsDesc}</b>*/}
            {/*        </Div>*/}
            {/*    )*/}
            {/*}*/}
            {
                (od.replaceFlag && od.payStatus !== 'cancelled') && (
                    <Div mt={14} mb={10} bc={'light'} rounded={3} overflow={'hidden'}>
                        <Flex justifyContent={'space-between'} px={10} py={8}>
                            <div>
                                <IoMdRepeat style={{marginRight: 4}} />대체상품
                            </div>
                            <Space spaceGap={4}>
                                {ComUtil.addCommas(od.replaceOrderPlusPrice)}원
                                {
                                    od.replaceOrderPlusPrice - od.orderPrice > 0 && <Span fg={'green'}>({ComUtil.addCommas(od.replaceOrderPlusPrice - od.orderPrice)}원 초과)</Span>
                                }
                            </Space>
                        </Flex>

                        <Div
                            px={10}
                            py={8}
                            custom={`
                                                & > div {
                                                    border-bottom: 1px solid ${color.light};
                                                }
                                                & > div:last-child {
                                                    border: 0;
                                                }
                                            `}


                        >
                            {
                                /*
                                String gubun;       //plus,minus : 섞이진 않음.
                                long orderSeq;      //새 전표(주문)번호
                                String goodsName;   //상품옵션명
                                int orderPrice;     //가격
                                int orderCnt;       //수량

                                //2208멀티대체 하면서 이동
                                String replaceBarcode;          //대체상품바코드
                                String replaceGoodsDesc;        //대체상품비고[대체상품: 상품명 ???원]
                                String replaceBarcodeOption;    //Json String
                                //{"optionName":"노각 1개","optionPrice":4000,"optionIndex":0,"producerNo":157,"localfoodFarmerNo":28,"localFarmerName":"[옥]이선미"}
                                */

                                od.replaceOrderPlusList.map(item => {
                                    //{optionName, optionPrice, optionIndex, producerNo, localfoodFarmerNo, localFarmerName}
                                    const repOption = JSON.parse(item.replaceBarcodeOption)
                                    return(
                                        <Flex key={`${repOption.optionIndex}_${item.orderSeq}`} py={8}>
                                            <div>
                                                <Div fg={COLOR_FARMER_NAME}>
                                                    {repOption.localFarmerName}
                                                </Div>
                                                <div>
                                                    {repOption.optionName}
                                                </div>
                                                <div>
                                                    {ComUtil.addCommas(repOption.optionPrice)} X {item.orderCnt}개 = {ComUtil.addCommas(repOption.optionPrice * item.orderCnt)}원
                                                </div>
                                            </div>
                                            {
                                                od.orderConfirm !== 'shipping' && (
                                                    <Right flexShrink={0}>
                                                        <FlexButton fg={'darkBlack'} fontSize={13} onClick={onRemoveOneReplaceOrderClick.bind(this, item.orderSeq, repOption.localFarmerName, repOption.optionName, item.orderPrice, item.orderCnt)}>취소</FlexButton>
                                                    </Right>
                                                )
                                            }
                                            {/*<pre>*/}
                                            {/*    {JSON.stringify(item, null, 2)}*/}
                                            {/*</pre>*/}
                                        </Flex>
                                    )
                                })
                            }
                        </Div>
                        {
                            od.orderConfirm !== 'shipping' && <FlexButton bg={'veryLight'} fg={'darkBlack'} fontSize={13} block onClick={onRemoveAllReplaceOrderClick} >전체취소</FlexButton>
                        }
                    </Div>
                )
            }
            {
                isOpenBarcodeReader &&
                <Div mb={10} pt={10}>
                    <BarcodeInput orderSeq={od.orderSeq} callback={onBarcodeRead} barcodeInfoList={barcodeInfoList} />
                    <Div mb={10} fontSize={13}>
                        <Span>총 {ComUtil.addCommas(totalReplaceOrderPrice)}원</Span>
                        {
                            remainedReplaceOrderPrice <= 0 && <Span ml={10} fg={remainedReplaceOrderPrice < -5000 ? 'danger' : 'green' }>{ComUtil.addCommas(remainedReplaceOrderPrice * -1)}원 초과(최대 5천원)</Span>
                        }
                    </Div>
                    <Div custom={`
                                            & > div {
                                                border-bottom: 1px solid ${color.light};
                                            }
                                            & > div:last-child {
                                                border: 0;
                                            }
                                        `}>


                        {
                            barcodeInfoList.map((barcodeInfo, index) =>
                                <Flex key={'barcode'+index} bg={'white'} py={8}>
                                    <div>
                                        <div fg={COLOR_FARMER_NAME} >{barcodeInfo.localFarmerName}</div>
                                        <div>{barcodeInfo.optionName}</div>
                                        <div>
                                            {ComUtil.addCommas(barcodeInfo.optionPrice)}원 X {barcodeInfo.barcodeOrderCount}개 = {ComUtil.addCommas(barcodeInfo.optionPrice * barcodeInfo.barcodeOrderCount)}원
                                        </div>
                                    </div>
                                    <Div ml={'auto'} flexShrink={0}>
                                        <Flex bg={'light'} bc={'light'} mb={8} height={30} custom={`
                                                                & > * {
                                                                    border: 0;
                                                                    border-radius: 0;
                                                                    margin-right: 1px;
                                                                }
                                                                
                                                                & > *:last-child {
                                                                    margin: 0;
                                                                }
                                                            `}>
                                            <FlexButton height={'100%'} onClick={onChangeCountButtonClick.bind(this, -1, barcodeInfo.barcode)}><IoMdRemove/></FlexButton>
                                            <Input p={0} height={'100%'} type={'number'} placeholder={'수량'} width={40} value={barcodeInfo.barcodeOrderCount} style={{textAlign:'center'}}
                                                   onChange={onBarcodeOrderCountInputChange.bind(this, barcodeInfo.barcode)}
                                                   onBlur={onBarcodeOrderCountInputBlur.bind(this, barcodeInfo.barcode)}/>
                                            <FlexButton height={'100%'} onClick={onChangeCountButtonClick.bind(this, 1, barcodeInfo.barcode)}><IoMdAdd/></FlexButton>
                                        </Flex>
                                        <FlexButton height={30} block bc={'light'} textAlign={'center'} onClick={onRemoveBarcodeClick.bind(this, barcodeInfo.barcode)}>삭제</FlexButton>
                                    </Div>
                                </Flex>
                            )
                        }
                    </Div>
                    <div ref={dummyRef} tabIndex="-1" ></div>
                    <Grid templateColumns={'1fr 1fr'} colGap={10}>
                        <Button p={5} mt={10} fg={'black'} bg={'white'} fontSize={13} bc={'light'} block onClick={onCancelBarcodeClick}>취소</Button>
                        <Button p={5} mt={10} fg={'white'} bg={'green'} fontSize={13} bc={'light'} block disabled={remainedReplaceOrderPrice < -5000 || remainedReplaceOrderPrice > 0} onClick={onFinishBarcodeClick}>완료</Button>
                    </Grid>

                    {/*<Grid templateColumns={'1fr 1fr'} colGap={10}>*/}
                    {/*<Button p={5} mt={10} fg={'white'} bg={'green'} fontSize={13} bc={'light'} block onClick={onWebBarcodeReadDone.bind(this, orderDetail.orderSeq, barcodeValue)}>바코드읽기 완료(적용)</Button>*/}
                    {/*<Button p={5} mt={10} fg={'black'} bg={'white'} fontSize={13} bc={'light'} block onClick={onWebBarcodeReadCancel}>바코드읽기 취소</Button>*/}
                    {/*</Grid>*/}
                </Div>
            }
            {/*{*/}
            {/*    (!od.replaceOrderSeq && replaceOrderInfo) && (*/}
            {/*        <ConfirmBox>*/}
            {/*            {*/}
            {/*                replaceOrderInfo.isSuccess && (*/}
            {/*                    <Div mb={5} lighter>*/}
            {/*                        아래 상품으로 대체 하시겠습니까?*/}
            {/*                    </Div>*/}
            {/*                )*/}
            {/*            }*/}
            {/*            <Div fg={!replaceOrderInfo.isSuccess && 'danger'} mb={10} bold>*/}
            {/*                {*/}
            {/*                    replaceOrderInfo.isSuccess ? replaceOrderInfo.replaceGoodsDesc : replaceOrderInfo.errMsg*/}
            {/*                }*/}
            {/*            </Div>*/}
            {/*            {*/}
            {/*                replaceOrderInfo.isSuccess ? (*/}
            {/*                    <Grid templateColumns={'1fr 1fr'} colGap={10}>*/}
            {/*                        <Button bg={'white'} fontSize={13} px={10} bc={'light'} block onClick={onReplaceOrderCancelClick}>취소</Button>*/}
            {/*                        <Button fontSize={13} px={10} bg={'danger'} block fg={'white'} onClick={onReplaceOrderConfirmClick}>확인</Button>*/}
            {/*                    </Grid>*/}
            {/*                ) : <Button bg={'white'} fontSize={13} px={10} bc={'light'} block onClick={onReplaceOrderCancelClick}>닫기</Button>*/}
            {/*            }*/}
            {/*        </ConfirmBox>*/}
            {/*    )*/}
            {/*}*/}
        </>
    )
};

export default OrderFunctionality;
