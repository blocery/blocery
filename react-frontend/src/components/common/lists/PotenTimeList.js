import React from 'react';
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {Div} from "~/styledComponents/shared";
import moment from 'moment-timezone'
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import * as TimeSale from '~/components/shop/store/timeSale/index'

const PotenTimeList = ({data}) => {
    return (
            data.map((goods, index) =>
                <TimeSale.Card
                    key={'goods'+index}
                    goods={{...goods}}
                    style={{
                        padding: 16,
                        paddingBottom: 48
                    }}
                />
            )
    )

    // return (
    //     data.map(goods => {
    //
    //         const {consumerPrice, timeSaleStart, timeSalePrice, potenPrice = 0, potenDiscountRate = 0} = goods
    //
    //         const startTime = moment(timeSaleStart)
    //         const isAfter = startTime.isAfter(moment())
    //         let maskContent;
    //         if (isAfter) {
    //
    //             // const potenPrice = timeSalePrice - (timeSalePrice * (couponMaster.potenCouponDiscount / 100))
    //             // const potenDiscountRate =  (100 - ((potenPrice / consumerPrice) * 100))
    //
    //             maskContent = MaskContent({
    //                 date: startTime.format('MM[월 ]DD[일 ]HH:mm'),
    //                 text: `${potenDiscountRate.toFixed(0)}% 할인`
    //             })
    //         }
    //         return(
    //             <Div mb={60} key={`poten_${goods.goodsNo}`}>
    //                 <VerticalGoodsCard.Medium isWide={true} goods={goods} maskContent={maskContent}
    //                                           imageType={TYPE_OF_IMAGE.THUMB}
    //                                           style={{mb: 16}}
    //                 />
    //             </Div>
    //         )
    //     })
    // );
};
export default PotenTimeList;


const MaskContent = ({date, text}) =>
    <Div textAlign={'center'}>
        <Div fontSize={21} lineHeight={'1.84'}><strong>{date}</strong></Div>
        <Div fw={900} fontSize={40} lineHeight={'1'}>{text}</Div>
    </Div>

