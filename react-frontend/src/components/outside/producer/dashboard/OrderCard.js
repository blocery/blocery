import React, {useEffect, useState} from "react";
import {
    getOrderDetailByOrderSeq,
    producerCancelOrder,
    producerReplaceOrder,
    producerReplaceOrderRemove,
    setOrderConfirm
} from "~/lib/producerApi";
import ComUtil from "~/util/ComUtil";
import {Button, Div, Flex, Grid, Hr, Img, Right, Space, Span} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import {Server} from "~/components/Properties";
import {IoIosArrowDown, IoIosArrowUp, IoIosBarcode, IoMdRepeat} from "react-icons/io";
import {BsCheckLg} from "react-icons/bs";
import {withRouter} from "react-router-dom";
import {AiOutlineCheck} from 'react-icons/ai'
import styled from "styled-components";
import theme from "~/styledComponents/theme";

const ImageWrapper = styled.div`
    flex-shrink: 0;
    width: 108px;
    height: 108px;
    margin-right: 16px;
    
    ${({theme}) => theme.tablet`
        width: 60px;
        height: 60px;
    `}
    
    ${({theme}) => theme.mobile`
        width: 50px;
        height: 50px;
        margin-right: 8px;
    `}
    
`

const BadgeBox = styled.div`
    padding: 9px 13px;
    border: 1px solid #8caad8;
    min-width: 100px;
    text-align: center;
    color: #8caad8;
    font-size: 13px;
    border-radius: 4px;
    ${p => p.active && `
        border: 1px solid ${color.primary};
        color: ${color.primary};
        font-weight: 900;
    `}
    
    ${({theme}) => theme.mobile`
        // min-width: 100px;
        padding: 4px 6px;
    `}
`

const Badge = ({active, children}) => <BadgeBox active={active}>
    {active && <AiOutlineCheck style={{marginRight: 4}}/>}
    {children}
</BadgeBox>


const OrderCard = ({
                       orderDetail,
                       onFarmerClick,
                       history}) => {

    // const [orderDetail, setOrderDetail] = useState(od)

    const { localFarmerName, goodsNm, optionName, goodsOptionNm, goodsNo, orderImg, orderDate, orderSeq, orderSubGroupNo, orderCnt, consumerNm, orderPrice,  //공통(주문용)
        dealGoods, scheduleAtTime, payStatus, orderCancelDate, orderConfirm, consumerPhone, receiverZipNo, receiverAddr, receiverAddrDetail, receiverName, receiverPhone, deliveryMsg, trackingNumber,
        objectUniqueNo,
        cancelReason //소비자가 취소 사유

    } = orderDetail

    const [visibleDetail, setVisibleDetail] = useState(false)

    const toggle = e => {
        e.stopPropagation()
        setVisibleDetail(!visibleDetail)
    }

    //orderSeq 를 사람의 눈으로 식별이 쉽도록 bold 와 아닌 영역을 구분해 주었음
    const _orderSeq = orderSeq.toString();
    const orderSeqStart = _orderSeq.substr(0, _orderSeq.length-3)
    const orderSeqEnd = _orderSeq.substr(_orderSeq.length - 3, _orderSeq.length)

    return (
        <Flex
            // style={{borderBottom: `1px solid ${color.veryLight}`}}
            alignItems={'flex-start'}

        >

            <ImageWrapper
                // flexShrink={0} width={108} height={108} mr={16}
            >
                {
                    orderImg && <Img rounded={4} src={Server.getThumbnailURL() + orderImg} alt={'사진'}
                        // onClick={moveToGoodsDetail.bind(this,goodsNo)}
                    />
                }
            </ImageWrapper>

            {/*<Flex flexDirection={'column'} alignItems={'flex-start'} width={'100%'}>*/}
            {/*    <Flex width={'100%'} justifyContent={'space-between'}>*/}
            {/*        <div>A-1</div>*/}
            {/*        <div>A-2</div>*/}
            {/*    </Flex>*/}
            {/*    <div>b</div>*/}
            {/*    <div>c</div>*/}
            {/*</Flex>*/}


            {/*flex-direction: column;*/}
            {/*display: flex;*/}
            {/*height: 108px;*/}
            {/*justify-content: space-evenly;*/}

            <Div fontSize={14} flexGrow={1}>
                <Flex width={'100%'} mb={10}>
                    <Div flexShrink={0}>
                        (<b>{orderSubGroupNo}</b>) {orderSeqStart}<Span fg={'danger'}><b>{orderSeqEnd}</b></Span>
                    </Div>
                    <Right>
                        {/*<span>{!dealGoods && ComUtil.utcToString(orderDate, 'MM.DD HH:mm')}</span>*/}
                        <Button bg={'white'} bc={'light'} fontSize={13} onClick={toggle} width={20} height={20} p={0} ml={10}>
                            {
                                !visibleDetail ? <IoIosArrowDown /> : <IoIosArrowUp />
                            }
                        </Button>
                    </Right>
                </Flex>
                <Flex fg={'black'} fontSize={15} mb={10} bold width={'100%'} flexWrap={'wrap'} justifyContent={'space-between'}>
                    <Strike isStrike={payStatus === 'cancelled' || orderDetail.replaceOrderSeq}>
                        <Span style={{color: '#0032ff'}} cursor={1} onClick={onFarmerClick}>{localFarmerName}</Span> {goodsNm} [{optionName}] {ComUtil.addCommas(orderDetail.currentPrice)}원 × {`${orderCnt}개`}
                    </Strike>
                    <Strike isStrike={payStatus === 'cancelled' || orderDetail.replaceOrderSeq}>
                        {ComUtil.addCommas(orderPrice)}원
                    </Strike>
                </Flex>
                {
                    visibleDetail && (
                        <Div mb={10} width={'100%'}>
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

                {
                    //대체상품지정으로 전표 발생 된 경우
                    (payStatus !== 'cancelled' && orderDetail.replaceFlag) && (
                        <Div px={16} py={10} mt={14} mb={10} bc={'light'} fg={'darkBlack'} rounded={3}>
                            <Flex justifyContent={'space-between'}>
                                <div>
                                    <IoMdRepeat style={{marginRight: 4}}/>대체상품
                                </div>
                                <div>
                                    <b>
                                        {
                                            orderDetail.replaceOrderPlusPrice - orderDetail.orderPrice > 0 && (
                                                <Span fg={'green'} mr={4}>
                                                    ({ComUtil.addCommas(orderDetail.replaceOrderPlusPrice - orderDetail.orderPrice)}원 초과)
                                                </Span>
                                            )
                                        }
                                        {ComUtil.addCommas(orderDetail.replaceOrderPlusPrice)}원
                                    </b>
                                </div>
                            </Flex>

                            <Div custom={`
                                                & > div {
                                                    border-bottom: 1px solid ${color.light};
                                                }
                                                & > div:last-child {
                                                    border: 0;
                                                }
                                            `}>
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

                                    orderDetail.replaceOrderPlusList.map(item => {
                                        //{optionName, optionPrice, optionIndex, producerNo, localfoodFarmerNo, localFarmerName}
                                        const repOption = JSON.parse(item.replaceBarcodeOption)
                                        return(
                                            <Flex key={repOption.optionIndex} py={10} justifyContent={'space-between'}>
                                                <Space spaceGap={4}>
                                                    <Span fg={'#0032ff'} mr={4}>{repOption.localFarmerName}</Span>
                                                    <span>{repOption.optionName}</span>
                                                    <span>X</span>
                                                    <span>{item.orderCnt}개</span>
                                                </Space>
                                                <div>
                                                    {ComUtil.addCommas(repOption.optionPrice)}
                                                </div>
                                            </Flex>
                                        )
                                    })
                                }
                            </Div>
                        </Div>
                    )
                }

                {
                    //대체상품지정으로 전표 발생 된 경우
                    // (orderDetail.replaceOrderSeq && payStatus !== 'cancelled') && (
                    //     <Space p={10} mb={10} bg={'darkBlack'} fg={'white'} rounded={3}>
                    //         <div>
                    //             <BsCheckLg color={'#36FF65'} style={{marginRight: 6}} /> 대체상품
                    //         </div>
                    //         <div><b>{orderDetail.replaceGoodsDesc}</b></div>
                    //     </Space>
                    // )
                }

                {
                    payStatus === 'paid' && (
                        <Space mb={10}>
                            {/*<Badge active={!orderConfirm}>미확인</Badge>*/}
                            <Badge active={orderConfirm ==='confirmed'}>주문확인됨</Badge>
                            <Badge active={orderConfirm === 'shipping'}>출하완료</Badge>
                        </Space>
                    )
                }
                {
                    orderDetail.reqProducerCancel === 1 && <Div fg={'danger'}>주문취소 요청됨</Div>
                }
                {/*{*/}
                {/*    //cancelReason 이 항상 있어서, dpCancelReason 을 우선으로 함*/}
                {/*    payStatus === 'cancelled' && (*/}
                {/*        orderDetail.dpCancelReason ? <Div fg={'danger'}>생산자 주문취소 ({orderDetail.dpCancelReason})</Div> :*/}
                {/*            <Div fg={'danger'}>소비자 주문취소 ({orderDetail.cancelReason})</Div>*/}
                {/*    )*/}
                {/*}*/}
                {
                    (orderDetail.refundFlag || orderDetail.payStatus === 'cancelled') && (
                        <Div fg={'danger'}>
                            {orderDetail.refundFlag ? '환불' :
                                orderDetail.payStatus === 'cancelled' &&
                                    orderDetail.cancelType === 0 ?
                                        orderDetail.dpCancelReason ? `생산자취소(${orderDetail.dpCancelReason})` : '소비자취소' :
                                        orderDetail.cancelType === 1 ? '소비자취소' : `생산자취소(${orderDetail.dpCancelReason})`}
                        </Div>
                    )
                }
            </Div>

            {/*<Flex alignItems={'flex-start'} cursor={1} flexGrow={1}>*/}


            {/*    */}
            {/*</Flex>*/}
        </Flex>
    )
};

export default withRouter(OrderCard);

const Strike = styled.div`
${props => props.isStrike && `
text-decoration: line-through;
text-decoration-color: rgba(0,0,0,0.3);
`}


`


