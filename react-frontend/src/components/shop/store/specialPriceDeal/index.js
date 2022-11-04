import React, {Fragment, useState, useEffect, useRef} from 'react'
import { SpinnerBox } from '~/components/common'

// import { GrandTitle } from '~/components/common/texts'
import {GrandTitle, GridList, VerticalGoodsGridList} from '~/styledComponents/ShopBlyLayouts'
import { getConsumerGoodsJustCached } from '~/lib/goodsApi'
import {Div, Flex, GridColumns, Img, Right} from "~/styledComponents/shared";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import Skeleton from "~/components/common/cards/Skeleton";
import {getSpecialDealGoodsList} from "~/lib/shopApi";
import SpecialDealImage from '~/images/background/special-deal.jpg'
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import {withRouter} from "react-router-dom"
import {isForceUpdate} from "~/lib/axiosCache";

const SpecialPriceDeal = (props) => {

    const abortControllerRef = useRef(new AbortController());

    const { limitCount = 99 } = props

    const [data, setData] = useState()

    useEffect(() => {
        search()
        return(() => {
            abortControllerRef.current.abort()
        })
    }, [])

    async function search() {

        try{
            const {data} = await getSpecialDealGoodsList(isForceUpdate(props.history), abortControllerRef.current.signal)

            if(data.length > limitCount){
                data.splice(limitCount, data.length);
            }
            setData(data)

        }catch (error) {
            if (error.message === 'canceled') {
                console.log("Request cancelled : SpecialPriceDeal")
            }else{
                console.log("Request error : SpecialPriceDeal")
            }
        }
    }

    return (
        <Fragment>
            <img style={{width: '100%'}} src={SpecialDealImage} alt={'특가딜 소개'} />
            {/*<GrandTitle*/}
            {/*    px={16}*/}
            {/*    mt={20}*/}
            {/*>*/}
            {/*    <Div>특가딜</Div>*/}
            {/*</GrandTitle>*/}
            {
                !data ? <Skeleton.ProductList count={5} /> : (
                    <>
                        <VerticalGoodsGridList p={16}>
                            <List data={data} />
                        </VerticalGoodsGridList>
                    </>
                )
            }
            {/*<Footer/>*/}
        </Fragment>

    )
}
export default withRouter(SpecialPriceDeal)

function List({data}) {
    return(
        data.map(goods =>
            <VerticalGoodsCard.Medium key={goods.goodsNo} goods={goods} imageType={TYPE_OF_IMAGE.SQUARE}/>
        )
    )
}