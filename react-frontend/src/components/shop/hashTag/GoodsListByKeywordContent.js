import {useRecoilState} from "recoil";
import {boardTagModalState} from "~/recoilState";
import React, {useCallback, useEffect, useState} from "react";
import {getGoodsByTags} from "~/lib/shopApi";
import {Div} from "~/styledComponents/shared";
import Skeleton from "~/components/common/cards/Skeleton";
import GoodsCard from "~/components/common/cards/GoodsCard";
import loadable from "@loadable/component";
import {getConsumerGoodsByKeyword} from "~/lib/goodsApi";
import {GridList} from "~/styledComponents/ShopBlyLayouts";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {withRouter} from 'react-router-dom'
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
const MoreButton = loadable(() => import("./MoreButton"))
const EmptyCard = loadable(() => import("./EmptyCard"))

const GoodsListByKeywordContent = ({history}) => {
    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)
    const [list, setList] = useState()

    useEffect(() => {
        if (tagModalState.tag) {
             search()
        }else{
            setList([])
        }
    }, [tagModalState.tag])

    const search = async () => {
        const {data} = await getConsumerGoodsByKeyword(tagModalState.tag.toLowerCase())
        setList(data)
        console.log({data})
    }

    const closeModal = () => {
        setTagModalState({
            ...tagModalState,
            isOpen: false
        })
    }

    const onClick = (goodsNo) => {
        closeModal()
        history.push(`/goods?goodsNo=${goodsNo}`)
    }

    return(
        <Div>
                {
                    !list ? <Skeleton.VerticalProductList count={5} /> :
                        <GridList p={16} >
                            {
                                list.map(goods =>

                                    <VerticalGoodsCard.Medium key={goods.goodsNo}
                                                              // isThumnail={true}
                                                              imageType={TYPE_OF_IMAGE.SQUARE}
                                                              goods={goods}
                                                              onClick={onClick.bind(this, goods.goodsNo)}
                                    />

                                )
                            }
                        </GridList>

                }

            {
                (list && list.length <= 0) && <EmptyCard url={'/store'} onClick={closeModal}/>
            }
        </Div>


    )
}
export default withRouter(GoodsListByKeywordContent)