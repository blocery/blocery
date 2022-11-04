import React, {Fragment, useState, useEffect, useRef} from 'react'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'

import { getConsumerGoodsDefined } from '~/lib/goodsApi'

import ComUtil from '~/util/ComUtil'

import {GrandTitle, GridList} from '~/styledComponents/ShopBlyLayouts'
import Skeleton from '~/components/common/cards/Skeleton'
import {Div, Flex, GridColumns, Right, Span} from "~/styledComponents/shared";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import {isForceUpdate} from "~/lib/axiosCache";
import {withRouter} from 'react-router-dom'

const BestDeal = (props) => {

    const abortControllerRef = useRef(new AbortController());
    const [data, setData] = useState()
    const [dateText, setDateText] = useState('')

    useEffect(() => {
        search()
        return(() => {
            abortControllerRef.current.abort()
        })
    }, [])

    async function search() {
        try{
            console.log("isForceUpdate:",isForceUpdate(props.history), props.history.action)
            const { data } = await getConsumerGoodsDefined('bestSelling', isForceUpdate(props.history), abortControllerRef.current.signal)
            console.log({data})
            setData(data)

            let endDate = (ComUtil.addDate(ComUtil.utcToString(ComUtil.getNow(), 'YYYY-MM-DD'), -1)).substring(5).replace('-','/');
            let startDate = (ComUtil.addDate(ComUtil.utcToString(ComUtil.getNow(), 'YYYY-MM-DD'), -30)).substring(5).replace('-','/');
            setDateText(`${startDate}~${endDate} 기준`)
        }catch (error) {
            if (error.message === 'canceled') {
                console.log("Request canceled : BestDeal")
            }else{

            }
        }
    }

    // useEffect(() => {
    //     search()
    // }, [])
    //
    // async function search() {
    //     const { data } = await getConsumerGoodsDefined('bestSelling')
    //     console.log({data})
    //     setData(data)
    //
    //     let endDate = (ComUtil.addDate(ComUtil.utcToString(ComUtil.getNow(), 'YYYY-MM-DD'), -1)).substring(5).replace('-','/');
    //     let startDate = (ComUtil.addDate(ComUtil.utcToString(ComUtil.getNow(), 'YYYY-MM-DD'), -30)).substring(5).replace('-','/');
    //     setDateText(`${startDate}~${endDate} 기준`)
    // }


    //상품클릭
    function onClick(item){
        props.history.push(`/goods?goodsNo=${item.goodsNo}`)
    }

    return(
        <Fragment>
            <GrandTitle
                px={16}
                mt={20}
            >
                <Flex>
                    <Div>샵블리 최고 인기상품</Div>
                    <Right><small>{dateText}</small></Right>
                </Flex>
            </GrandTitle>
            {
                !data ? <Skeleton.ProductList count={5} /> : (
                    <>
                        <GridColumns mt={20} repeat={1} rowGap={32} p={16}>
                            {
                                data.map((goods, index) => {
                                    if (index > 2) return null
                                    return <VerticalGoodsCard.Medium key={'bestGoods'+goods.goodsNo} goods={goods} showProducerNm isWide={true}
                                                                     imageType={TYPE_OF_IMAGE.THUMB}
                                        // isThumnail={false}
                                    />
                                })
                            }
                        </GridColumns>
                        <GridList mt={20} p={16}>
                            {
                                data.map((goods, index) => {
                                    if (index <= 2) return null
                                    return <VerticalGoodsCard.Medium key={'bestGoods'+goods.goodsNo} goods={goods} showProducerNm //isThumnail={true}
                                                                     imageType={TYPE_OF_IMAGE.SQUARE}
                                    />
                                })
                            }
                        </GridList>
                    </>
                )
            }




            {/*<Footer/>*/}
        </Fragment>
    )

}
export default withRouter(BestDeal)

