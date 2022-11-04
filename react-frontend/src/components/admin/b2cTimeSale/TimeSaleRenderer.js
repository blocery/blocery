import React, { Component, useState, useEffect } from 'react';
import {getPotenCouponMaster} from '~/lib/adminApi'
import {Div, Span} from '~/styledComponents/shared/Layouts'
import ComUtil from "~/util/ComUtil";
import MathUtil from "~/util/MathUtil";

const TimeSaleRenderer = (props) => {
    const [potenSaleAmt, setPotenSaleAmt] = useState(props.data.goodsNm === props.data.eventOptionName ? props.data.defaultCurrentPrice:props.data.eventOptionPrice)
    const [potenCouponDiscount, setPotenCouponDiscount] = useState(0)

    useEffect(() => {
        getTimeSale()
    }, [])
    const getTimeSale = () => {
        const goodsno = props.data.goodsNo
        //console.log("goodsno",goodsno)
        if (goodsno > 0) {
            getPotenCouponMaster(goodsno).then(({data}) => {
                //console.log("getPotenCouponMaster", data)
                if(data) {
                    setPotenSaleAmt(Math.round(MathUtil.multipliedBy(potenSaleAmt,(1 - MathUtil.dividedBy(data.potenCouponDiscount,100))), 0));
                    setPotenCouponDiscount(data.potenCouponDiscount)
                }
            })
        }
    }

    return (
        <Div>
            {
                <Span>{ComUtil.addCommas(potenSaleAmt)}({ComUtil.addCommas(Math.round(potenCouponDiscount > 0 ? potenCouponDiscount:props.data.discountRate,0))}%)</Span>
            }
        </Div>
    )
}
export default TimeSaleRenderer