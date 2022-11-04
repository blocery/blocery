import React, {useEffect, useState, useContext, createContext} from 'react';
import {useParams} from "react-router-dom";
import {ShopXButtonNav} from "~/components/common";

import {withRouter} from 'react-router-dom'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import FooterButtonGroup from "../components/FooterButtonGroup";
import BackNavigation from "~/components/common/navs/BackNavigation";
import DealGoodsContent from "./DealGoodsContent";

const DealGoodsDetail = ({props, goods, couponNo, producer}) => {

    const params = useParams()
    // const [goods, setGoods] = useState(goods)

    useEffect(() => {
        // searchGoods()

        // console.log(props)
        const params = new URLSearchParams(props.location.search)

        //추천인코드 localStorage에 임시저장
        //호출방법: http://localhost:3000/goods?goodsNo=431&inviteCode=CM000E5
        let inviteCode = params.get('inviteCode');
        if (inviteCode) {
            console.log('inviteCode:'+ inviteCode + ',' + 'dealRecommenderNo' + goods.goodsNo);
            localStorage.setItem('inviteCode', inviteCode);

            //key= dealRecommenderNo431(431=goodsNo), value= CM000E5형태로 저장. (431번 공동구매상품 추천자 = CM000E5 의미)
            localStorage.setItem('dealRecommenderNo' + goods.goodsNo, inviteCode);
        }

    }, [])


    // const searchGoods = async() => {
    //     const {data} = await getGoodsByGoodsNo(params.goodsNo)
    //
    //     //orderCnt = 1 을 기본으로 넣어준다.
    //     if (data.options) {
    //         data.options.map(option => option.orderCnt = 1)
    //     }
    //
    //     setGoods(data)
    // }

    return (
        <>
            {/*<ShopXButtonNav historyBack>상품상세</ShopXButtonNav>*/}
            {/*<BackNavigation>상품상세</BackNavigation>*/}
            <DealGoodsContent goods={goods} producer={producer} />
            {
                goods && <FooterButtonGroup goods={goods}/>
            }
        </>
    );
};

export default withRouter(DealGoodsDetail);


