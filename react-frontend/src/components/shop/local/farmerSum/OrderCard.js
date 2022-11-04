import React, {useState} from 'react';
import {withRouter} from 'react-router-dom'
import {Div, Flex, Img, WhiteSpace, Right, Button, Space, Input, Hr, Span} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import {Server} from "~/components/Properties";
import ComUtil from "~/util/ComUtil";

const OrderCard = ({orderDetail, showDetail, searchOkDate}) => {

    const { localFarmerName, consumerOkDate, goodsNm, localKey, csRefundFlag, csRefundOrderSeq, csRefundDesc, optionName, goodsNo, orderImg, orderDate, orderSeq, orderSubGroupNo, orderCnt, consumerNm, orderPrice, dealGoods, payStatus, refundFlag, refundForReplace} = orderDetail

    const _orderSeq = orderSeq.toString();
    const orderSeqStart = _orderSeq.substr(0, _orderSeq.length-3)
    const orderSeqEnd = _orderSeq.substr(_orderSeq.length - 3, _orderSeq.length)

    return (
        <div>

            <Flex p={16} style={{borderBottom: `1px solid ${color.veryLight}`}} alignItems={'flex-start'}>

                <Flex alignItems={'flex-start'} cursor={1} flexGrow={1}>
                    {/*<Div flexShrink={0}>*/}
                    {/*    {*/}
                    {/*        orderImg && <Img width={40} height={40} mb={10} src={Server.getThumbnailURL() + orderImg} alt={'사진'} />*/}
                    {/*    }*/}
                    {/*</Div>*/}

                    <Div ml={10} fontSize={18} lineHeight={30} flexGrow={1}>

                        <Flex>
                            <Div>{goodsNm}</Div>
                            <Right>
                                {!csRefundFlag ?
                                    <div><b>{ComUtil.addCommas(orderPrice)}원 {refundFlag?'(환불)':''}</b></div>
                                    :
                                    <div><Span fg={'danger'}>{ComUtil.addCommas(orderPrice)}원 </Span> <Span fg={'darkgray'}> (정산조정) </Span> </div>
                                }

                            </Right>
                        </Flex>

                        <Flex>
                            <Span>[{optionName} x {orderCnt}개]</Span>
                            <Right>
                                {searchOkDate &&//구매확정일로 조회시 아래꺼
                                    // <Flex>
                                    //     <div>{ComUtil.utcToString(orderDate, 'HH:mm')} </div>
                                    // </Flex>
                                    // :
                                    <Flex>
                                        주문일:
                                        <div>{ComUtil.utcToString(orderDate, 'YY/MM/DD')} </div>
                                        &nbsp;확정일:
                                        <div>{ComUtil.utcToString(consumerOkDate, 'YY/MM/DD')} </div>
                                    </Flex>
                                }
                            </Right>

                        </Flex>

                        {showDetail &&
                            <Div lineHeight={30} fontSize={15}>
                                <div>주문시각 : {ComUtil.utcToString(orderDate, 'HH:mm')}</div>
                                <div>주문그룹: {localKey? '('+localKey+') ':''}{orderSubGroupNo} </div>
                                <div>주문번호: {orderSeq} </div>
                                {/*<div>주문번호:{orderSeqStart}<Span fg={'danger'}><b>{orderSeqEnd}</b></Span></div>*/}
                                {csRefundFlag &&
                                    <Flex>
                                        <div><Span fg={'info'}>설명:</Span> {csRefundDesc} </div>
                                    </Flex>
                                }
                            </Div>
                        }

                    </Div>

                </Flex>
            </Flex>

        </div>
    )
}

export default OrderCard;