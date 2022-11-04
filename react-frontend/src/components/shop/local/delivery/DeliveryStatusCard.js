import React, {useState} from 'react';
import {withRouter} from 'react-router-dom'
import {Div, Flex, Img, WhiteSpace, Right, Button, Space, Input, Hr, Span} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import {Server} from "~/components/Properties";
import ComUtil from "~/util/ComUtil";

const DeliveryStatusCard = ({orderDetail}) => {

    const { localFarmerName, goodsNm, optionName, goodsOptionNm, goodsNo, orderImg, orderDate, orderSeq, orderSubGroupNo, orderCnt, consumerNm, orderPrice, dealGoods, payStatus} = orderDetail

    const _orderSeq = orderSeq.toString();
    const orderSeqStart = _orderSeq.substr(0, _orderSeq.length-3)
    const orderSeqEnd = _orderSeq.substr(_orderSeq.length - 3, _orderSeq.length)

    return (
        <div>
            {
                payStatus !== "cancelled" && payStatus !== "revoked" &&
                <Flex p={16} style={{borderBottom: `1px solid ${color.veryLight}`}} alignItems={'flex-start'}>

                    <Flex alignItems={'flex-start'} cursor={1} flexGrow={1}>
                        <Div flexShrink={0}>
                            {
                                orderImg && <Img width={40} height={40} mb={10} src={Server.getThumbnailURL() + orderImg} alt={'사진'} />
                            }
                        </Div>

                        <Div ml={10} fontSize={12} lineHeight={20} flexGrow={1}>
                            <div>주문번호:{orderSeqStart}<Span fg={'danger'}><b>{orderSeqEnd}</b></Span></div>
                            <Flex>
                                <div>{goodsOptionNm}</div>
                                <div>{`${orderCnt}개 ${ComUtil.addCommas(orderPrice)}원`}</div>
                            </Flex>
                        </Div>

                    </Flex>
                </Flex>
            }
        </div>
    )
}

export default DeliveryStatusCard;