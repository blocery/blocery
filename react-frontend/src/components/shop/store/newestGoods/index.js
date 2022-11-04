import React, {Fragment, useState, useEffect, useRef} from 'react'
import { SpinnerBox } from '~/components/common'

// import { GrandTitle } from '~/components/common/texts'
import {GrandTitle, GridList, VerticalGoodsGridList} from '~/styledComponents/ShopBlyLayouts'
import { getConsumerGoodsJustCached } from '~/lib/goodsApi'
import {Div, Flex, GridColumns, Right} from "~/styledComponents/shared";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {getSuperRewardList, getTimeSaleList} from "~/lib/shopApi";
import Skeleton from "~/components/common/cards/Skeleton";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import {withRouter} from "react-router-dom"
import {isForceUpdate} from "~/lib/axiosCache";

const NewestGoods = (props) => {

    const abortControllerRef = useRef(new AbortController());

    const { limitCount = 99 } = props

    const [data, setData] = useState()

    useEffect(() => {

        async function fetch() {
            try{
                const {data} = await getConsumerGoodsJustCached(isForceUpdate(props.history), abortControllerRef.current.signal)
                if(data.length > limitCount){
                    data.splice(limitCount, data.length);
                }
                setData(data)
            }catch (error) {
                if (error.message === 'canceled') {
                    console.log("Request cancelled : NewestGoods")
                }else{
                    console.log("Request error : NewestGoods")
                }
            }
        }
        fetch()

        return(() => {
            abortControllerRef.current.abort()
        })
    }, [])

    function onClick(item){
        props.history.push(`/goods?goodsNo=${item.goodsNo}`)
    }

    return (
        <Fragment>
            <GrandTitle
                px={16}
                mt={20}
            >
                <div>방금 등록된 따끈따끈한 상품</div>
            </GrandTitle>
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
export default withRouter(NewestGoods)

function List({data}) {
    return(
        data.map(goods =>
            <VerticalGoodsCard.Medium key={goods.goodsNo} goods={goods} imageType={TYPE_OF_IMAGE.SQUARE}/>
        )
    )
}