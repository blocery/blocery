import React, {Fragment} from "react";
import {Div, Divider, Flex, GridColumns, Span, Strong} from "~/styledComponents/shared";
// import DealGoodsShareButton from "~/components/common/buttons/DealGoodsShareButton";

/*
    쑥쑥 상품 묶음배송 지원 불가능 안내
*/
export const AboutNotSurpportedTimeSaleCouponContent = () => {
    return(
        <GridColumns fontSize={12} colGap={0} rowGap={8}>
            <div>포텐타임 쿠폰은 다른 상품과 묶음배송일 경우에는 지원되지 않습니다.
                <br/>
                <Strong fg={'green'}>포텐타임 쿠폰을 적용 하려면 <u>묶음배송이 아니거나 개별상품으로 주문</u>해 주세요.</Strong></div>
        </GridColumns>
    )
}
export const AboutBlyPriceContent = () => {
    return(
        <GridColumns fontSize={12} colGap={0} rowGap={8}>
            <div>
                BLY 가격은 <Strong fg={'green'}><b>매일 23시 거래소를 기준으로 반영</b></Strong>하여 계산됩니다. (거래소 : 코인마켓캡)
            </div>
        </GridColumns>
    )
}