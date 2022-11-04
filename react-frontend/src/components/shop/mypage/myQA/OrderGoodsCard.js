import React from 'react';
import {Div, Flex, Img} from "~/styledComponents/shared";
import ComUtil from "~/util/ComUtil";
import {BadgeSharp} from "~/styledComponents/ShopBlyLayouts";
import {Server} from "~/components/Properties";
import {FaCheckCircle} from "react-icons/all";
import {color} from "~/styledComponents/Properties";

const OrderGoodsCard = ({orderSeq, goodsNm, orderImg, orderDate, onClick = () => null}) => {
    return(
        <Flex bg={'white'} doActive p={16} height={100} alignItems={'flex-start'} cursor={1} onClick={onClick}>
            <Div flexShrink={0} width={68} height={68}>
                <Img cover rounded={3} src={Server.getThumbnailURL() + orderImg} alt={goodsNm} />
            </Div>
            <Div px={10} flexGrow={1} flexGrow={1}>
                <Div bold>주문번호 {orderSeq}</Div>
                <Div lineClamp={1}>{goodsNm}</Div>
                <Div fg={'dark'} fontSize={13}>
                    {ComUtil.utcToString(orderDate, 'YYYY-MM-DD HH:mm')}
                </Div>
            </Div>
        </Flex>

    )
}
export default OrderGoodsCard;