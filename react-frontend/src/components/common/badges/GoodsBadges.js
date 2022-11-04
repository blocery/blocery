import {Flex, Space, Span} from "~/styledComponents/shared";
import {BadgeGoodsEventType} from "~/styledComponents/ShopBlyLayouts";
import React, {Fragment} from "react";
import ComUtil from "~/util/ComUtil";
import {BsTruck} from 'react-icons/bs'
import {GrDeliver} from "react-icons/gr";
// const getGoodsEventName = (goods) => {
//     //포텐타임
//     if (goods.timeSale && goods.inTimeSalePeriod) {
//         return 'POTENTIME'
//     }else if (goods.superReward && goods.inSuperRewardPeriod) {
//         return 'SUPERREWARD'
//     }else if (goods.dealGoods) {
//         return 'DEALGOODS'
//     }
//     return null
// }

export const BADGE_NAME_STORE = {
    "POTENTIME": '포텐타임',
    "SUPERREWARD": "슈퍼리워드",
    "DEALGOODS": "쑥쑥",
    // "COUPON": "쿠폰",
    // "FREE": "무료배송",
    // "WRAPDELIVER": "묶음배송",
}

//포텐, 슈퍼, 쑥쑥, 무료배송, 쿠폰
const GoodsBadges = ({eventName, style = {}}) => {
    // const names = []
    // const goodsEventName = ComUtil.getGoodsEventName(goods)

    //이벤트명 (포텐타임, 슈퍼리워드, 쑥쑥)
    // if (goodsEventName) {
    //     names.push(goodsEventName)
    // }

    // //무료배송
    // if (goods.producerWrapDelivered) {
    //     names.push("WRAPDELIVER")
    // } else if (goods.termsOfDeliveryFee === 'FREE') {
    //     names.push('FREE')
    // }

    // //쿠폰
    // if (goods.buyingRewardFlag) {
    //     names.push('COUPON')
    // }

    // if (names.length === 0) {
    //     return null
    // }

    return <BadgeGoodsEventType goodsEventType={eventName} style={style}>{BADGE_NAME_STORE[eventName]}</BadgeGoodsEventType>

    // return(
    //     <Space spaceGap={8} {...rest}>
    //         {
    //             names.map(name => <BadgeGoodsEventType key={name} goodsEventType={name}>{BADGE_NAME_STORE[name]}</BadgeGoodsEventType>)
    //         }
    //     </Space>
    // )
}

export default GoodsBadges
