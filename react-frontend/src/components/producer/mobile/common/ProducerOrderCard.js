import React, {useEffect, useRef, useState} from 'react';
import {withRouter} from 'react-router-dom'
import {Div, Flex, Img, Right, Button, Hr, Span, Space} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import {Server} from '~/components/Properties'
import ComUtil from "~/util/ComUtil";
import {
    getOrderDetailByOrderSeq
} from '~/lib/producerApi'
import {
    IoIosArrowDown,
    IoIosArrowUp
} from 'react-icons/io'
import styled from 'styled-components'
import OrderFunctionality from "~/components/producer/mobile/common/OrderFunctionality";
import LocalFarmerTelModal from "~/components/producer/mobile/common/LocalFarmerTelModal";

const Strike = styled.div`
    ${props => props.isStrike && `
        text-decoration: line-through;
        text-decoration-color: rgba(0,0,0,0.3);
    `}
`

const ProducerOrderCard = ({
                               orderDetail: od,
                               cancelList = false,
                               //대체상품 정보 (바코드 찍힌 정보)
                               replaceOrderInfo,
                               //대체상품 요청 (native에 바코드 요청)
                               onRequestReplaceOrderClick,
                               //대체상품 바코드 정보 front 변수 클리어
                               onReplaceOrderCancelClick,
                               //대체상품 바코드 정보 front 변수 클리어(구분해서)
                               onReplaceOrderClear,
                               refreshCountInfo,
                               //2208 멀태대체시 웹용Barcode read Input으로 추가.
                               webBarcodeRead,
                               onWebBarcodeReadDone,
                               onWebBarcodeReadCancel,
                               refreshDate,
                               history}) => {

    const [orderDetail, setOrderDetail] = useState()


    const [visibleDetail, setVisibleDetail] = useState(false)

    const moveToGoodsDetail = (goodsNo) => {
        history.push(`/goods?goodsNo=${goodsNo}`)
    }

    useEffect(() => {
        console.log("orderSeq:"+od.orderSeq+" useEffect [od] 호출됨")
        setOrderDetail(od)
    }, [od])

    //부모가 갱신 요청시
    //경우1 : 바코드를 통해 주문확인이 되었을 경우 갱신
    useEffect(() => {
        if (refreshDate) {
            console.log("orderSeq:"+od.orderSeq+" useEffect [refreshDate] 호출됨")
            refreshOrderDetail()
        }
    }, [refreshDate])

    const toggle = e => {
        e.stopPropagation()
        setVisibleDetail(!visibleDetail)
    }

    //주문상세 재 조회
    const refreshOrderDetail = async () => {
        const {data} = await getOrderDetailByOrderSeq(orderDetail.orderSeq)
        setOrderDetail(data)

        //주문취소요청 카운트 조회
        if (refreshCountInfo && typeof refreshCountInfo === 'function')
            refreshCountInfo()
    }


    if (!orderDetail) return null

    const { localFarmerName, goodsNm, optionName, goodsOptionNm, goodsNo, orderImg, orderDate, orderSeq, orderSubGroupNo, orderCnt, currentPrice, consumerNm, orderPrice,  //공통(주문용)
        dealGoods, scheduleAtTime, payStatus, orderCancelDate, orderConfirm, consumerPhone, receiverZipNo, receiverAddr, receiverAddrDetail, receiverName, receiverPhone, deliveryMsg, trackingNumber,
        objectUniqueNo, replaceFlag, replaceOrderPlusList
    } = orderDetail

    //orderSeq 를 사람의 눈으로 식별이 쉽도록 bold 와 아닌 영역을 구분해 주었음
    const _orderSeq = orderSeq.toString();
    const orderSeqStart = _orderSeq.substr(0, _orderSeq.length-3)
    const orderSeqEnd = _orderSeq.substr(_orderSeq.length - 3, _orderSeq.length)


    return (
        <Flex p={16} style={{borderBottom: `1px solid ${color.veryLight}`}} alignItems={'flex-start'}>

            <div flexShrink={0}>
                {
                    orderImg && <Img width={40} height={40} mb={10} src={Server.getThumbnailURL() + orderImg} alt={'사진'} onClick={moveToGoodsDetail.bind(this,goodsNo)} />
                }
            </div>


            <Flex alignItems={'flex-start'} cursor={1} flexGrow={1}>


                <Div ml={10} fontSize={14} lineHeight={'1.7'} flexGrow={1}>
                    <Flex>
                        <Div flexShrink={0}>
                            (<b>{orderSubGroupNo}</b>) {orderSeqStart}<Span fg={'danger'}><b>{orderSeqEnd}</b></Span>
                        </Div>
                        <Right>
                            <span style={{color: color.dark}}>{!dealGoods && ComUtil.utcToString(orderDate, 'MM.DD HH:mm')}</span>
                            <Button bg={'white'} bc={'light'} fontSize={13} onClick={toggle} width={20} height={20} p={0} ml={10}>
                                {
                                    !visibleDetail ? <IoIosArrowDown /> : <IoIosArrowUp />
                                }
                            </Button>
                        </Right>
                    </Flex>
                    {
                        dealGoods && <div>주문: {ComUtil.utcToString(orderDate, 'MM/DD')} &nbsp;&nbsp; 결제: {ComUtil.intToDateString(scheduleAtTime, 'MM/DD') + ' 10:00'}</div>
                    }
                    <Div fg={'black'} fontSize={15} bold>
                        {
                            orderDetail.localfoodFarmerNo ? (
                                <LocalFarmerTelModal localfoodFarmerNo={orderDetail.localfoodFarmerNo} localFarmerName={localFarmerName} />
                            ) : null
                        }
                        <Strike isStrike={payStatus === 'cancelled' || orderDetail.replaceOrderSeq}>
                            {goodsNm} [{optionName}]
                        </Strike>
                        <Flex>
                            <Strike isStrike={payStatus === 'cancelled' || orderDetail.replaceOrderSeq}>
                                {/*{ComUtil.addCommas(orderPrice/orderCnt)}원*/}

                                <span>{ComUtil.addCommas(currentPrice)}원</span>
                                <Span display={'inline-block'} minWidth={20} textAlign={'center'}>x</Span>
                                <Span fg={'#0032ff'}>{`${orderCnt}개`}</Span>

                                {/*{ orderCnt > 1 &&*/}
                                {/*<Span fg={(payStatus === 'cancelled')?'black':'#0032ff'}> {` x ${orderCnt}개`} </Span>*/}
                                {/*}*/}
                            </Strike>
                            <Right bold>
                                {/* 총 가격이 있어야 대체 상품가격과 쉽게 비교가 가능 함 */}
                                <Strike isStrike={payStatus === 'cancelled'}>
                                    {ComUtil.addCommas(orderPrice)}원
                                </Strike>
                            </Right>
                        </Flex>
                    </Div>

                    {
                        cancelList && (
                            <Div cursor={1} fontSize={12} mt={8}>
                                취소일시: <b>{ComUtil.utcToString(orderCancelDate, 'MM/DD HH:mm')}</b>
                            </Div>
                        )
                    }

                    {
                        visibleDetail && (
                            <Div my={10}>
                                <Hr mb={10}/>
                                <div>{consumerNm} <a href={`tel:${consumerPhone}`} style={{color: color.primary, textDecoration: 'underline'}}>{consumerPhone}</a></div>
                                <div>{receiverAddr} {receiverAddrDetail}</div>
                                <div>배송메시지: {deliveryMsg}</div>
                                {
                                    trackingNumber && <div>송장번호: <b>{trackingNumber}</b></div>
                                }
                            </Div>
                        )
                    }

                    {!cancelList && <OrderFunctionality orderDetail={orderDetail} refresh={refreshOrderDetail}/>}
                </Div>
            </Flex>







            {/*<Flex ml={'auto'} justifyContent={'center'} bc={'light'} onClick={toggle} width={40} height={40} doActive>*/}
            {/*    {*/}
            {/*        !visibleDetail ? <IoIosArrowDown /> : <IoIosArrowUp />*/}
            {/*    }*/}
            {/*</Flex>*/}


        </Flex>
    )
};

export default withRouter(ProducerOrderCard);



// import React, {useEffect, useRef, useState} from 'react';
// import {withRouter} from 'react-router-dom'
// import {Div, Flex, Img, Right, Button, Space, Hr, Span, Grid, Input, GridColumns} from "~/styledComponents/shared";
// import {color} from "~/styledComponents/Properties";
// import {Server} from '~/components/Properties'
// import ComUtil from "~/util/ComUtil";
// import {
//     getOrderDetailByOrderSeq,
//     producerCancelOrder,
//     producerReplaceOrder,
//     producerReplaceOrderRemove,
//     setOrderConfirm,
//     reqProducerOrderCancel,
//     reqProducerOrderCancelBack, producerReplaceOrderCheck, replaceOrderPartRemove
// } from '~/lib/producerApi'
// import {
//     IoIosArrowDown,
//     IoIosArrowUp,
//     IoIosBarcode,
//     IoMdAddCircle,
//     IoMdClock,
//     IoMdClose,
//     IoMdRemove, IoMdRemoveCircle,
//     IoMdAdd, IoMdRepeat,
// } from 'react-icons/io'
// import {BsCheckLg} from 'react-icons/bs'
// import styled from 'styled-components'
// import BarcodeInput from "~/components/producer/mobile/common/BarcodeInput";
// import OrderFunctionality from "~/components/producer/mobile/common/OrderFunctionality";
//
// const FlexButton = styled(Button)`
//     display: flex;
//     align-items: center;
//     justify-content: center;
// `
//
// const COLOR_FARMER_NAME = '#0032ff'
//
// const ProducerOrderCard = ({
//                                orderDetail: od,
//                                cancelList = false,
//                                //대체상품 정보 (바코드 찍힌 정보)
//                                replaceOrderInfo,
//                                //대체상품 요청 (native에 바코드 요청)
//                                onRequestReplaceOrderClick,
//                                //대체상품 바코드 정보 front 변수 클리어
//                                onReplaceOrderCancelClick,
//                                //대체상품 바코드 정보 front 변수 클리어(구분해서)
//                                onReplaceOrderClear,
//                                refreshCountInfo,
//                                //2208 멀태대체시 웹용Barcode read Input으로 추가.
//                                webBarcodeRead,
//                                onWebBarcodeReadDone,
//                                onWebBarcodeReadCancel,
//                                refreshDate,
//                                history}) => {
//
//     const [orderDetail, setOrderDetail] = useState(od)
//
//     //2208 멀티대체: 웹바코드 read용도로 추가.
//     // const [barcodeValue, setBarcodeValue] = useState('')
//     // const barcodeRef = useRef(); //barcode input ref
//     const [isOpenBarcodeReader, setOpenBarcodeReader] = useState(false)
//     const [barcodeInfoList, setBarcodeInfoList] = useState([])
//
//
//     const { localFarmerName, goodsNm, optionName, goodsOptionNm, goodsNo, orderImg, orderDate, orderSeq, orderSubGroupNo, orderCnt, consumerNm, orderPrice,  //공통(주문용)
//         dealGoods, scheduleAtTime, payStatus, orderCancelDate, orderConfirm, consumerPhone, receiverZipNo, receiverAddr, receiverAddrDetail, receiverName, receiverPhone, deliveryMsg, trackingNumber,
//         objectUniqueNo, replaceFlag, replaceOrderPlusList
//
//     } = orderDetail
//
//     const [visibleDetail, setVisibleDetail] = useState(false)
//
//     const [deleting, setDeleting] = useState(false);
//
//     const moveToGoodsDetail = (goodsNo) => {
//         history.push(`/goods?goodsNo=${goodsNo}`)
//     }
//
//     useEffect(() => {
//         // console.log("useEffect [od] 호출됨")
//         // setOrderDetail(od)
//
//         //if(barcodeRef.current) { //2208 focus: 동작 안하는 중
//         //    barcodeRef.current.focus();//2208
//         //}
//     }, [od])
//
//     //부모가 갱신 요청시
//     //경우1 : 바코드를 통해 주문확인이 되었을 경우 갱신
//     useEffect(() => {
//
//
//         if (refreshDate) {
//             console.log("orderSeq:"+od.orderSeq+" useEffect [refreshDate] 호출됨")
//             refreshOrderDetail()
//         }
//     }, [refreshDate])
//
//
//     // useEffect(() => {
//     //     if(orderDetail.csOrderSeq) {
//     //         setProgress('대체완료ㅛ')
//     //     }else if(orderDetail.csBarcode) {
//     //         setProgress('미완료')
//     //     }
//     // }, []);
//
//     //2208 멀티대체: 웹에서 바코드Read용으로 추가.
//     // const onWebBarcodeRead = async (orderSeq, e) => {
//     //     //const {name, value} = target
//     //     let barcode = e.target.value
//     //     setBarcodeValue(barcode)
//     //
//     //     //옥천은 19자리로 진행.
//     //     if (barcode.length == 19) {
//     //
//     //         const {status, data} = await producerReplaceOrderCheck(orderSeq, barcode)
//     //         console.log(data)
//     //
//     //
//     //
//     //     }
//     // }
//
//
//     //orderSeq, data:db에서 조회된 data
//     const onBarcodeRead = async ({action, data}) => {
//
//         //{"optionName":"노각 1개","optionPrice":4000,"optionIndex":0,"producerNo":157,"localfoodFarmerNo":28,"localFarmerName":"[옥]이선미"}
//
//         const newBarcodeInfoList = [...barcodeInfoList]
//
//         //이미 기록된 바코드가 있으면 수량을 +1 증가
//         if (action === 'duplicated') {
//             const barcodeInfo = newBarcodeInfoList.find(item => item.barcode === data.barcode)
//             barcodeInfo.barcodeOrderCount++
//             setBarcodeInfoList(newBarcodeInfoList)
//         }else { //success 신규 바코드
//             setBarcodeInfoList(newBarcodeInfoList.concat(data))
//         }
//
//         // console.log({newBarcodeInfoList: newBarcodeInfoList})
//
//
//
//
//     }
//
//     const onOrderConfirm = async () => {
//
//         //backend 저장.
//         let {status, data} = await setOrderConfirm(orderDetail);
//
//         if (status === 200) {
//
//             const {resCode, errMsg, retData} = data
//
//             if (resCode === 1) {
//                 alert(errMsg);
//             }
//             else if (resCode == 0) {
//                 //list refresh
//                 // refreshCallback()
//                 await refreshOrderDetail()
//             }
//         }else{
//             alert('네트워크 에러가 발생 하였습니다.')
//             return false
//         }
//
//         return true
//     }
//
//     const toggle = e => {
//         e.stopPropagation()
//         setVisibleDetail(!visibleDetail)
//     }
//
//     //배송전 주문취소 요청
//     const onRequestCancelOrderClick = async () => {
//         const producerCancelReason = window.prompt('취소사유 입력', '재고없음')
//         if (!producerCancelReason) {
//             return
//         }
//
//         setDeleting(true)
//
//         const newOrderDetail = {
//             ...orderDetail,
//             reqProducerCancel: 1,
//             producerCancelReason: producerCancelReason,
//             // dpCancelReason: producerCancelReason
//         }
//
//         //배송전 주문 취소
//         let {status, data} = await reqProducerOrderCancel(newOrderDetail)
//         // let {status, data} = await producerCancelOrder(newOrderDetail);
//
//         if (status === 200) {
//             alert(data.errMsg)
//             await refreshOrderDetail()
//             //부모의 카운트 정보 업데이트
//             refreshCountInfo()
//         }else{
//             alert('네트워크 에러가 발생 하였습니다.')
//         }
//
//         setDeleting(false)
//     }
//
//     //주문취소요청 철회
//     // reqProducerOrderCancelBack
//     const onReqProducerOrderCancelBackClick = async () => {
//
//         if (!window.confirm("주문취소요청을 철회 하시겠습니까?"))
//             return
//
//         const {status, data} = await reqProducerOrderCancelBack(orderDetail.orderSeq)
//
//         if (status === 200) {
//             alert(data.errMsg)
//             await refreshOrderDetail()
//             //부모의 카운트 정보 업데이트
//             refreshCountInfo()
//         }else{
//             alert('네트워크 에러가 발생 하였습니다.')
//         }
//
//         setDeleting(false)
//     }
//
//
//     //배송전 주문취소
//     const onCancelOrderClick = async () => {
//
//         // const producerCancelReason = window.prompt('취소사유 입력', '재고없음')
//
//         if (!orderDetail.producerCancelReason) {
//             alert('취소사유가 입력되지 않았습니다. [취소요청 철회] 후 재시도 해 주세요.');
//             return
//         }
//
//         if (!window.confirm(`취소사유(${orderDetail.producerCancelReason})가 맞습니까? 소비자 결제취소되며 이후 번복이 불가능 합니다!`))
//             return
//
//         setDeleting(true)
//
//         const newOrderDetail = {
//             ...orderDetail,
//             // reqProducerCancel: 1,
//             producerCancelReason: orderDetail.producerCancelReason,
//             dpCancelReason: orderDetail.producerCancelReason
//         }
//
//         //배송전 주문 취소
//         let {status, data} = await producerCancelOrder(newOrderDetail);
//
//         if (status === 200) {
//             await refreshOrderDetail()
//         }else{
//             alert('네트워크 에러가 발생 하였습니다.')
//         }
//
//         setDeleting(false)
//     }
//
//     //대체상품 지정
//     const onReplaceOrderConfirmClick = async () => {
//         if (window.confirm(`${goodsNm} [${optionName}] ${ComUtil.addCommas(orderPrice)} 상품을 ${replaceOrderInfo.replaceGoodsDesc} 상품으로 대체 하시겠습니까?`)) {
//
//             const {status, data} = await producerReplaceOrder(orderDetail.orderSeq, replaceOrderInfo.replaceBarcode)
//
//             if (status === 200) {
//                 if (data.resCode === -1) {
//                     alert('다시 로그인 해 주세요.');
//                     return
//                 }
//                 else if (data.resCode !== 0) {
//                     alert(data.errMsg)
//                     return
//                 }
//
//                 //대체상품 정보 클리어
//                 onReplaceOrderClear(orderDetail.orderSeq)
//
//                 //주문상세 재 조회
//                 await refreshOrderDetail()
//
//             }else{
//                 alert('네트워크 에러가 발생 하였습니다.')
//             }
//         }
//     }
//
//     //대체상품 삭제(전표)
//     const onReplaceOrderRemoveClick = async () => {
//         if (window.confirm(`대체상품 (${orderDetail.replaceGoodsDesc})을 삭제 하시겠습니까?`)) {
//             const {status, data} = await producerReplaceOrderRemove(orderDetail.orderSeq)
//
//             if (status === 200) {
//                 if (data.resCode === -1) {
//                     alert('다시 로그인 해 주세요.')
//                     return
//                 }else if (data.resCode !== 0) {
//                     alert(data.errMsg)
//                     return
//                 }
//
//                 //대체상품 정보 클리어
//                 onReplaceOrderClear(orderDetail.orderSeq)
//
//                 await refreshOrderDetail()
//             }else{
//                 alert('네트워크 에러가 발생 하였습니다.');
//                 return
//             }
//         }
//     }
//
//     //주문상세 재 조회
//     const refreshOrderDetail = async () => {
//         const {data} = await getOrderDetailByOrderSeq(orderDetail.orderSeq)
//         setOrderDetail(data)
//
//         //주문취소요청 카운트 조회
//         refreshCountInfo()
//     }
//
//     const onRequestReplaceOrderClickForDb = () => {
//         setOpenBarcodeReader(!isOpenBarcodeReader)
//     }
//
//     const onChangeCountButtonClick = (num, barcode) => {
//         const newBarcodeInfoList = [...barcodeInfoList]
//         const barcodeInfo = newBarcodeInfoList.find(barcodeInfo => barcodeInfo.barcode === barcode)
//         barcodeInfo.barcodeOrderCount = Number(barcodeInfo.barcodeOrderCount || 0) + num
//
//         //개수가 0개 이하면 최소 1 유지
//         if (barcodeInfo.barcodeOrderCount <= 0) {
//             barcodeInfo.barcodeOrderCount = 1
//             return
//         }
//
//         setBarcodeInfoList(newBarcodeInfoList)
//     }
//
//     const onBarcodeOrderCountInputChange = (barcode, e) => {
//         const newBarcodeInfoList = Object.assign([], barcodeInfoList)
//         const barcodeInfo = newBarcodeInfoList.find(b => b.barcode === barcode)
//         barcodeInfo.barcodeOrderCount = e.target.value
//         setBarcodeInfoList(newBarcodeInfoList)
//     }
//
//     //0은 작성 못 하도록 함
//     const onBarcodeOrderCountInputBlur = (barcode, e) => {
//         if (Number(e.target.value || 0) <= 0) {
//             const newBarcodeInfoList = Object.assign([], barcodeInfoList)
//             const barcodeInfo = newBarcodeInfoList.find(b => b.barcode === barcode)
//             if (barcodeInfo.barcodeOrderCount <= 0) {
//                 barcodeInfo.barcodeOrderCount = 1
//                 setBarcodeInfoList(newBarcodeInfoList)
//             }
//         }
//     }
//
//     const onRemoveBarcodeClick = (barcode) => {
//         if (!window.confirm('삭제 하시겠습니까?')) return
//         const newBarcodeInfoList = Object.assign([], barcodeInfoList)
//         const index = newBarcodeInfoList.findIndex(item => item.barcode === barcode)
//         newBarcodeInfoList.splice(index, 1)
//         setBarcodeInfoList(newBarcodeInfoList)
//     }
//
//     //바코드 리더 취소
//     const onCancelBarcodeClick = () => {
//
//         if (barcodeInfoList.length > 0) {
//             if (!window.confirm('모두 취소 하시겠습니까?')) {
//                 return
//             }
//         }
//
//         setBarcodeInfoList([])
//         setOpenBarcodeReader(false)
//     }
//
//     //바코드 완료
//     const onFinishBarcodeClick = async () => {
//
//         if (orderPrice - totalReplaceOrderPrice < -5000) {
//             alert(`대체상품은 ${ComUtil.addCommas(5000)}원을 초과 할 수 없습니다.`)
//             return
//         }
//
//         //orderSeq, barcodeCountList
//         const barcodeList = barcodeInfoList.map(item => ({barcode: item.barcode, barcodeOrderCount: item.barcodeOrderCount}))
//         console.log({orderSeq, barcodeList: barcodeList})
//         const {status, data} = await producerReplaceOrder(orderSeq, barcodeList)
//
//         if (status === 200) {
//
//             //이미 대체상품이 지정 된 경우는 새로고침
//             if (data.resCode === 204) {
//                 alert(data.errMsg)
//                 refreshOrderDetail()
//                 return
//             }
//
//             if (data.resCode === 0) {   //성공
//
//                 //초기화
//                 setBarcodeInfoList([])
//                 setOpenBarcodeReader(false)
//
//                 //새로고침
//                 refreshOrderDetail()
//             }else{ //실패
//                 alert(data.errMsg)
//             }
//         }
//     }
//
//     const [totalReplaceOrderPrice, setTotalReplaceOrderPrice] = useState()
//
//     useEffect(() => {
//         console.log("barcodeInfoList 변경 useEffect=============================")
//         let totalReplacePrice = 0
//         barcodeInfoList.map(item => totalReplacePrice += item.optionPrice * (item.barcodeOrderCount || 0))
//         setTotalReplaceOrderPrice(totalReplacePrice)
//     }, [barcodeInfoList])
//
//
//     //대체상품내역 전체 취소
//     const onRemoveAllReplaceOrderClick = async () => {
//         if (!window.confirm('대체상품을 전체 취소 하시겠습니까?')) return false
//         const {status, data} = await producerReplaceOrderRemove(orderSeq)
//         if (status === 200) {
//             if (data.resCode === 0) {
//                 refreshOrderDetail()
//             }else{
//                 alert(data.errMsg)
//             }
//         }
//     }
//     //대체상품 한건 취소
//     const onRemoveOneReplaceOrderClick = async (csOrderSeq, localFarmerName, optionName) => {
//         console.log({orderSeq, csOrderSeq: csOrderSeq})
//         if (!window.confirm(`${localFarmerName} ${optionName} 을 취소 하시겠습니까?`)) return false
//         const {status, data} = await replaceOrderPartRemove(orderSeq, csOrderSeq)
//         if (status === 200) {
//             if (data.resCode === 0) {
//                 refreshOrderDetail()
//             }else{
//                 alert(data.errMsg)
//             }
//         }
//     }
//
//
//
//     //orderSeq 를 사람의 눈으로 식별이 쉽도록 bold 와 아닌 영역을 구분해 주었음
//     const _orderSeq = orderSeq.toString();
//     const orderSeqStart = _orderSeq.substr(0, _orderSeq.length-3)
//     const orderSeqEnd = _orderSeq.substr(_orderSeq.length - 3, _orderSeq.length)
//
//     const remainedReplaceOrderPrice = orderPrice - totalReplaceOrderPrice
//
//     return (
//         <Flex p={16} style={{borderBottom: `1px solid ${color.veryLight}`}} alignItems={'flex-start'}>
//
//             <div flexShrink={0}>
//                 {
//                     orderImg && <Img width={40} height={40} mb={10} src={Server.getThumbnailURL() + orderImg} alt={'사진'} onClick={moveToGoodsDetail.bind(this,goodsNo)} />
//                 }
//             </div>
//
//
//             <Flex alignItems={'flex-start'} cursor={1} flexGrow={1}>
//
//
//                 <Div ml={10} fontSize={14} lineHeight={'1.7'} flexGrow={1}>
//                     <Flex>
//                         <Div flexShrink={0}>
//                             (<b>{orderSubGroupNo}</b>) {orderSeqStart}<Span fg={'danger'}><b>{orderSeqEnd}</b></Span>
//                         </Div>
//                         <Right>
//                             <span>{!dealGoods && ComUtil.utcToString(orderDate, 'MM.DD HH:mm')}</span>
//                             <Button bg={'white'} bc={'light'} fontSize={13} onClick={toggle} width={20} height={20} p={0} ml={10}>
//                                 {
//                                     !visibleDetail ? <IoIosArrowDown /> : <IoIosArrowUp />
//                                 }
//                             </Button>
//                         </Right>
//                     </Flex>
//                     {
//                         dealGoods && <div>주문: {ComUtil.utcToString(orderDate, 'MM/DD')} &nbsp;&nbsp; 결제: {ComUtil.intToDateString(scheduleAtTime, 'MM/DD') + ' 10:00'}</div>
//                     }
//                     <Div fg={'black'} fontSize={15} bold>
//                         {
//                             orderDetail.localfoodFarmerNo && (
//                                 <Strike isStrike={payStatus === 'cancelled' || orderDetail.replaceOrderSeq} style={{color: '#0032ff'}}>
//                                     {localFarmerName}
//                                 </Strike>
//                             )
//                         }
//                         <Strike isStrike={payStatus === 'cancelled' || orderDetail.replaceOrderSeq}>
//                             {goodsNm} [{optionName}]<Span fg={(payStatus !== 'cancelled' && orderCnt !== 1)?'#0032ff':'black'}>{` × ${orderCnt}개`} </Span>
//                         </Strike>
//                         <Strike isStrike={payStatus === 'cancelled' || orderDetail.replaceOrderSeq}>
//                             {ComUtil.addCommas(orderPrice/orderCnt)}원
//                             { orderCnt > 1 &&
//                             <Span fg={(payStatus === 'cancelled')?'black':'#0032ff'}> {` x ${orderCnt}개`} </Span>
//                             }
//
//
//                         </Strike>
//                     </Div>
//
//                     {
//                         cancelList && (
//                             <Div cursor={1} fontSize={12} mt={8}>
//                                 취소일시: <b>{ComUtil.utcToString(orderCancelDate, 'MM/DD HH:mm')}</b>
//                             </Div>
//                         )
//                     }
//
//                     {
//                         visibleDetail && (
//                             <Div my={10}>
//                                 <Hr mb={10}/>
//                                 <div>{consumerNm} <a href={`tel:${consumerPhone}`} style={{color: color.primary, textDecoration: 'underline'}}>{consumerPhone}</a></div>
//                                 <div>{receiverAddr} {receiverAddrDetail}</div>
//                                 <div>배송메시지: {deliveryMsg}</div>
//                                 {
//                                     trackingNumber && <div>송장번호: <b>{trackingNumber}</b></div>
//                                 }
//                             </Div>
//                         )
//                     }
//
//                     {/*{!cancelList && <OrderFunctionality orderDetail={orderDetail} refresh={refreshOrderDetail}/>}*/}
//
//
//                     {
//                         !cancelList &&
//                         (
//                             <>
//                                 <Flex alignItems={'flex-start'} lineHeight={'normal'}>
//                                     <Space>
//                                         {
//                                             payStatus === 'paid' &&  (
//                                                 <>
//                                                     {
//                                                         !orderConfirm && <Button fg={'white'} bg={'green'} fontSize={13} onClick={onOrderConfirm}>주문확인</Button>
//                                                     }
//                                                     {
//                                                         orderConfirm ==='confirmed' && <Button disabled fontSize={13}>배송대기</Button>
//                                                     }
//                                                     {
//                                                         orderConfirm === 'shipping' && <Button disabled fontSize={13}>출하완료</Button>
//                                                     }
//                                                     {
//                                                         //로컬푸드 소속 농가 상품만 주문취소요청 노출
//                                                         (orderConfirm !== 'shipping' && orderDetail.localfoodFarmerNo > 0 && orderDetail.reqProducerCancel !== 2) &&
//                                                         <Button fontSize={13} bg={'white'} bc={'light'} disabled={deleting || orderDetail.reqProducerCancel === 1} onClick={onRequestCancelOrderClick}>{deleting ? '취소요청중..' : orderDetail.reqProducerCancel === 0 ? '주문취소요청' : '주문취소요청함'}</Button>
//                                                     }
//                                                 </>
//                                             )
//                                         }
//                                         {
//                                             payStatus === 'cancelled' && <div>주문취소완료(<Span fg={'danger'}>{orderDetail.dpCancelReason}</Span>)</div>
//                                         }
//
//                                         {/*{*/}
//                                         {/*    (!webBarcodeRead && payStatus !== 'cancelled' && !objectUniqueNo && !orderDetail.replaceOrderSeq && orderDetail.orderCnt === 1) && <Button fontSize={13} bg={'white'} bc={'light'} onClick={onRequestReplaceOrderClick}>*/}
//                                         {/*        <Flex>*/}
//                                         {/*            <IoIosBarcode />*/}
//                                         {/*            <div>대체상품지정</div>*/}
//                                         {/*        </Flex>*/}
//                                         {/*    </Button>*/}
//                                         {/*}*/}
//                                         {
//                                             // (payStatus !== 'cancelled' && !objectUniqueNo && !replaceFlag) && (
//                                             (payStatus !== 'cancelled' && !replaceFlag) && ( //개체인식도 댗체 허옹
//                                                 <Button fontSize={13} bg={'white'} bc={'light'} disabled={isOpenBarcodeReader} onClick={onRequestReplaceOrderClickForDb}>
//                                                     <Flex>
//                                                         <IoIosBarcode />
//                                                         <div>대체상품지정</div>
//                                                     </Flex>
//                                                 </Button>
//                                             )
//                                         }
//                                     </Space>
//                                 </Flex>
//
//                                 {
//                                     orderDetail.reqProducerCancel === 1 && (
//                                         <ConfirmBox>
//                                             <Div mb={5} lighter>
//                                                 취소사유 : <b>[{orderDetail.producerCancelReason}]</b> 이 맞습니까?
//                                             </Div>
//                                             <Grid templateColumns={'1fr 1fr'} colGap={10}>
//                                                 <Button bg={'white'} fontSize={13} px={10} bc={'light'} block onClick={onReqProducerOrderCancelBackClick}>취소요청 철회</Button>
//                                                 <Button fontSize={13} px={10} bg={'danger'} block fg={'white'} onClick={onCancelOrderClick}>주문취소 완료하기</Button>
//                                             </Grid>
//                                         </ConfirmBox>
//                                     )
//                                 }
//
//
//                                 {/*{*/}
//                                 {/*    //대체상품지정으로 전표 발생 된 경우*/}
//                                 {/*    (orderDetail.replaceOrderSeq && payStatus !== 'cancelled') && (*/}
//                                 {/*        <Div p={10} mt={14} mb={10} bg={'darkBlack'} fg={'white'} rounded={3}>*/}
//                                 {/*            <Flex>*/}
//                                 {/*                <IoMdRepeat color={'#36FF65'} style={{marginRight: 4}} /> 대체상품 지정완료<br/>*/}
//                                 {/*                <Button ml={'auto'} bg={'darkBlack'} bc={'light'} fontSize={12} px={10} onClick={onReplaceOrderRemoveClick}>취소</Button>*/}
//                                 {/*            </Flex>*/}
//
//                                 {/*            <b>{orderDetail.replaceGoodsDesc}</b>*/}
//                                 {/*        </Div>*/}
//                                 {/*    )*/}
//                                 {/*}*/}
//                                 {
//                                     (replaceFlag && payStatus !== 'cancelled') && (
//                                         <Div mt={14} mb={10} bc={'light'} rounded={3} overflow={'hidden'}>
//                                             <Flex justifyContent={'space-between'} px={10} py={8}>
//                                                 <div>
//                                                     <IoMdRepeat style={{marginRight: 4}} />대체상품
//                                                 </div>
//                                                 <Space spaceGap={4}>
//                                                     {ComUtil.addCommas(orderDetail.replaceOrderPlusPrice)}원
//                                                         {
//                                                             orderDetail.replaceOrderPlusPrice - orderDetail.orderPrice > 0 && <Span fg={'green'}>({ComUtil.addCommas(orderDetail.replaceOrderPlusPrice - orderDetail.orderPrice)}원 초과)</Span>
//                                                         }
//                                                 </Space>
//                                             </Flex>
//
//                                             <Div
//                                                 px={10}
//                                                 py={8}
//                                                 custom={`
//                                                 & > div {
//                                                     border-bottom: 1px solid ${color.light};
//                                                 }
//                                                 & > div:last-child {
//                                                     border: 0;
//                                                 }
//                                             `}
//
//
//                                             >
//                                                 {
//                                                     /*
//                                                     String gubun;       //plus,minus : 섞이진 않음.
//                                                     long orderSeq;      //새 전표(주문)번호
//                                                     String goodsName;   //상품옵션명
//                                                     int orderPrice;     //가격
//                                                     int orderCnt;       //수량
//
//                                                     //2208멀티대체 하면서 이동
//                                                     String replaceBarcode;          //대체상품바코드
//                                                     String replaceGoodsDesc;        //대체상품비고[대체상품: 상품명 ???원]
//                                                     String replaceBarcodeOption;    //Json String
//                                                     //{"optionName":"노각 1개","optionPrice":4000,"optionIndex":0,"producerNo":157,"localfoodFarmerNo":28,"localFarmerName":"[옥]이선미"}
//                                                     */
//
//                                                     replaceOrderPlusList.map(item => {
//                                                         //{optionName, optionPrice, optionIndex, producerNo, localfoodFarmerNo, localFarmerName}
//                                                         const repOption = JSON.parse(item.replaceBarcodeOption)
//                                                         return(
//                                                             <Flex key={repOption.optionIndex} py={8}>
//                                                                 <div>
//                                                                     <Div fg={COLOR_FARMER_NAME}>
//                                                                         {repOption.localFarmerName}
//                                                                     </Div>
//                                                                     <div>
//                                                                         {repOption.optionName}
//                                                                     </div>
//                                                                     <div>
//                                                                         {ComUtil.addCommas(repOption.optionPrice)} X {item.orderCnt}개 = {ComUtil.addCommas(repOption.optionPrice * item.orderCnt)}원
//                                                                     </div>
//                                                                 </div>
//                                                                 {
//                                                                     orderConfirm !== 'shipping' && (
//                                                                         <Right flexShrink={0}>
//                                                                             <FlexButton fg={'darkBlack'} fontSize={13} onClick={onRemoveOneReplaceOrderClick.bind(this, item.orderSeq, repOption.localFarmerName, repOption.optionName)}>취소</FlexButton>
//                                                                         </Right>
//                                                                     )
//                                                                 }
//                                                             </Flex>
//                                                         )
//                                                     })
//                                                 }
//                                             </Div>
//                                             {
//                                                 orderConfirm !== 'shipping' && <FlexButton bg={'veryLight'} fg={'darkBlack'} fontSize={13} block onClick={onRemoveAllReplaceOrderClick} >전체취소</FlexButton>
//                                             }
//                                         </Div>
//                                     )
//                                 }
//                                 {  //2208 멀티대체: Web용 text Barcode입력기능
//                                     isOpenBarcodeReader &&
//                                     <Div mb={10} pt={10}>
//                                         <BarcodeInput orderSeq={orderDetail.orderSeq} callback={onBarcodeRead} barcodeInfoList={barcodeInfoList} />
//                                         <Div mb={10} fontSize={13}>
//                                             <Span>총 {ComUtil.addCommas(totalReplaceOrderPrice)}원</Span>
//                                             {
//                                                 remainedReplaceOrderPrice <= 0 && <Span ml={10} fg={remainedReplaceOrderPrice <= -5000 ? 'danger' : 'green' }>{ComUtil.addCommas(remainedReplaceOrderPrice * -1)}원 초과(최대 5천원)</Span>
//                                             }
//                                         </Div>
//                                         <Div custom={`
//                                             & > div {
//                                                 border-bottom: 1px solid ${color.light};
//                                             }
//                                             & > div:last-child {
//                                                 border: 0;
//                                             }
//                                         `}>
//
//
//                                             {
//                                                 barcodeInfoList.map(barcodeInfo =>
//                                                     <Flex bg={'white'} py={8}>
//                                                         <div>
//                                                             <div fg={COLOR_FARMER_NAME} >{barcodeInfo.localFarmerName}</div>
//                                                             <div>{barcodeInfo.optionName}</div>
//                                                             <div>
//                                                                 {ComUtil.addCommas(barcodeInfo.optionPrice)}원 X {barcodeInfo.barcodeOrderCount}개 = {ComUtil.addCommas(barcodeInfo.optionPrice * barcodeInfo.barcodeOrderCount)}원
//                                                             </div>
//                                                         </div>
//                                                         <Div ml={'auto'} flexShrink={0}>
//                                                             <Flex bg={'light'} bc={'light'} mb={8} height={30} custom={`
//                                                                 & > * {
//                                                                     border: 0;
//                                                                     border-radius: 0;
//                                                                     margin-right: 1px;
//                                                                 }
//
//                                                                 & > *:last-child {
//                                                                     margin: 0;
//                                                                 }
//                                                             `}>
//                                                                 <FlexButton height={'100%'} onClick={onChangeCountButtonClick.bind(this, -1, barcodeInfo.barcode)}><IoMdRemove/></FlexButton>
//                                                                 <Input p={0} height={'100%'} type={'number'} placeholder={'수량'} width={40} value={barcodeInfo.barcodeOrderCount} style={{textAlign:'center'}}
//                                                                        onChange={onBarcodeOrderCountInputChange.bind(this, barcodeInfo.barcode)}
//                                                                        onBlur={onBarcodeOrderCountInputBlur.bind(this, barcodeInfo.barcode)}/>
//                                                                 <FlexButton height={'100%'} onClick={onChangeCountButtonClick.bind(this, 1, barcodeInfo.barcode)}><IoMdAdd/></FlexButton>
//                                                             </Flex>
//                                                             <FlexButton height={30} block bc={'light'} textAlign={'center'} onClick={onRemoveBarcodeClick.bind(this, barcodeInfo.barcode)}>삭제</FlexButton>
//                                                         </Div>
//                                                     </Flex>
//                                                 )
//                                             }
//                                         </Div>
//
//                                         <Grid templateColumns={'1fr 1fr'} colGap={10}>
//                                             <Button p={5} mt={10} fg={'black'} bg={'white'} fontSize={13} bc={'light'} block onClick={onCancelBarcodeClick}>취소</Button>
//                                             <Button p={5} mt={10} fg={'white'} bg={'green'} fontSize={13} bc={'light'} block disabled={remainedReplaceOrderPrice <= -5000 || remainedReplaceOrderPrice > 0} onClick={onFinishBarcodeClick}>완료</Button>
//                                         </Grid>
//
//                                         {/*<Grid templateColumns={'1fr 1fr'} colGap={10}>*/}
//                                         {/*<Button p={5} mt={10} fg={'white'} bg={'green'} fontSize={13} bc={'light'} block onClick={onWebBarcodeReadDone.bind(this, orderDetail.orderSeq, barcodeValue)}>바코드읽기 완료(적용)</Button>*/}
//                                         {/*<Button p={5} mt={10} fg={'black'} bg={'white'} fontSize={13} bc={'light'} block onClick={onWebBarcodeReadCancel}>바코드읽기 취소</Button>*/}
//                                         {/*</Grid>*/}
//                                     </Div>
//                                 }
//                                 {
//                                     (!orderDetail.replaceOrderSeq && replaceOrderInfo) && (
//                                         <ConfirmBox>
//                                             {
//                                                 replaceOrderInfo.isSuccess && (
//                                                     <Div mb={5} lighter>
//                                                         아래 상품으로 대체 하시겠습니까?
//                                                     </Div>
//                                                 )
//                                             }
//                                             <Div fg={!replaceOrderInfo.isSuccess && 'danger'} mb={10} bold>
//                                                 {
//                                                     replaceOrderInfo.isSuccess ? replaceOrderInfo.replaceGoodsDesc : replaceOrderInfo.errMsg
//                                                 }
//                                             </Div>
//                                             {
//                                                 replaceOrderInfo.isSuccess ? (
//                                                     <Grid templateColumns={'1fr 1fr'} colGap={10}>
//                                                         <Button bg={'white'} fontSize={13} px={10} bc={'light'} block onClick={onReplaceOrderCancelClick}>취소</Button>
//                                                         <Button fontSize={13} px={10} bg={'danger'} block fg={'white'} onClick={onReplaceOrderConfirmClick}>확인</Button>
//                                                     </Grid>
//                                                 ) : <Button bg={'white'} fontSize={13} px={10} bc={'light'} block onClick={onReplaceOrderCancelClick}>닫기</Button>
//                                             }
//                                         </ConfirmBox>
//                                     )
//                                 }
//                             </>
//                         )
//                     }
//                 </Div>
//             </Flex>
//
//
//
//
//
//
//
//             {/*<Flex ml={'auto'} justifyContent={'center'} bc={'light'} onClick={toggle} width={40} height={40} doActive>*/}
//             {/*    {*/}
//             {/*        !visibleDetail ? <IoIosArrowDown /> : <IoIosArrowUp />*/}
//             {/*    }*/}
//             {/*</Flex>*/}
//
//
//         </Flex>
//     )
// };
//
// export default withRouter(ProducerOrderCard);
//
//
// // function Strike2({isStrike, children}) {
// //     return <div style={{textDecoration: isStrike && 'line-through', textDecorationColor: isStrike && 'rgba(0,0,0,0.3)'}}>
// //         {children}
// //     </div>
// // }
//
//
// const Strike = styled.div`
//     ${props => props.isStrike && `
//         text-decoration: line-through;
//         text-decoration-color: rgba(0,0,0,0.3);
//     `}
//
//
// `
//
// const ConfirmBox = ({children}) => <Div p={10} mt={14} mb={10} bc={'darkBlack'} rounded={3}>{children}</Div>