import React, { Component, useEffect, useState } from 'react'

import DealGoodsDetail from "./dealGoodsDetail";
import DirectGoodsDetail from './directGoodsDetail'
import LocalGoodsDetail from './localGoodsDetail'
import PbGoodsDetail from './pbGoodsDetail'

import {BlocerySpinner, ShopXButtonNav} from '~/components/common'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { getProducerByProducerNo } from '~/lib/producerApi'
import ComUtil from '../../../util/ComUtil'
import { Server } from '~/components/Properties'
import { Container, Row, Col } from 'reactstrap'
import BackNavigation from "~/components/common/navs/BackNavigation";
import CartLinkButton from "~/components/common/buttons/CartLinkButton";
// import {B2cBackHeader} from '~/components/common/headers'

import loadable from "@loadable/component";
import {useRecoilState} from "recoil";
import {goodsState} from "~/recoilState";
import TG from "~/components/common/tg/TG";
import {FixedScrollUpButton} from "~/components/common/buttons/ScrollUpButton";

// const GoodsDetail = loadable(() => import('../../common/goodsDetail'))
// const DealGoodsDetail = loadable(() => import('~/components/shop/dealGoods/DealGoodsDetail'))

function Goods(props) {
    const params = ComUtil.getParams(props)

    const [state, setState] = useState()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (params && params.goodsNo)
            search()
    }, [params.goodsNo])

    const search = async () => {

        setLoading(true)

        const { data:goods } = await getGoodsByGoodsNo(params.goodsNo)
        console.log('goods:',goods, goods.producerNo)
        const { data:producer } = await getProducerByProducerNo(goods.producerNo)

        goods.options = goods.options.filter(option => !option.deleted) //숨겨진 항목 제거

        //dealGoods 인 경우 orderCnt = 1 을 기본으로 넣어준다. (옵션있는 상품은 모두 기본 넣어주도록 수정)
        // if (goods.dealGoods) {
        if (goods.options && goods.options.length > 0) {
            goods.options.map(option => option.orderCnt = 1)
        }
        // }

        //옵션 정렬
        ComUtil.sortNumber(goods.options, 'sortNum')

        setState({
            goods: goods,
            producer: producer,
            images: goods.goodsImages
        })

        setLoading(false)
    }

    return(
        <div>

            {/*<ShopXButtonNav fixed historyBack isVisibleCart={true}>상품정보</ShopXButtonNav>*/}
            <BackNavigation rightContent={<CartLinkButton/>}>상품정보</BackNavigation>
            <FixedScrollUpButton bottom={54 + 16} />
            {/*<B2cBackHeader title={'상품정보'} />*/}
            {
                loading ? (<BlocerySpinner/>) :
                    state.goods.dealGoods ?
                        <DealGoodsDetail props={props} goods={state.goods} couponNo={state.couponNo} producer={state.producer} /> :
                        state.goods.localfoodFarmerNo ?
                            <LocalGoodsDetail
                                goods={state.goods}
                                couponNo={state.couponNo}
                                producer={state.producer}
                            /> :
                            state.goods.pbFlag ?
                                <PbGoodsDetail props={props} goods={state.goods} couponNo={state.couponNo} producer={state.producer} /> :
                                <DirectGoodsDetail goods={state.goods} couponNo={state.couponNo} producer={state.producer}
                                    // farmDiaries={state.farmDiaries}
                                    // images={state.images}
                                />
            }
            {
                !loading && state.goods &&
                    <TG ty={"Item"} items={state.goods}/>
            }
        </div>
    )
}
export default Goods