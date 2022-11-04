import React, {useEffect, useState} from 'react';
import {withRouter} from 'react-router-dom'

import PbGoodsContent from './PbGoodsContent'
import FooterButtonGroup from "~/components/shop/goods/components/FooterButtonGroup";

const PbGoodsDetail = ({props, goods, couponNo, producer}) => {


    useEffect(() => {
        const params = new URLSearchParams(props.location.search)

    }, [])

    return (
        <>
            <PbGoodsContent goods={goods} producer={producer} />
            {
                goods && <FooterButtonGroup goods={goods}/>
            }
        </>
    )
}

export default withRouter(PbGoodsDetail);