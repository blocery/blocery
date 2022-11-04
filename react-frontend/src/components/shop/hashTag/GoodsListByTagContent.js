import {useRecoilState} from "recoil";
import {boardTagModalState} from "~/recoilState";
import React, {useCallback, useEffect, useState} from "react";
import {getGoodsByTag} from "~/lib/shopApi";
import {Div, GridColumns} from "~/styledComponents/shared";
import Skeleton from "~/components/common/cards/Skeleton";
import GoodsCard from "~/components/common/cards/GoodsCard";
import loadable from "@loadable/component";
import {withRouter} from 'react-router-dom'
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {GridList} from "~/styledComponents/ShopBlyLayouts";

const MoreButton = loadable(() => import("./MoreButton"))
const EmptyCard = loadable(() => import("./EmptyCard"))

const GoodsListByTagContent = ({history}) => {
    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)
    const [list, setList] = useState()
    const [page, setPage] = useState(0)
    const [totalCount, setTotalCount] = useState(0)

    useEffect(() => {
        search(true)
    }, [tagModalState.tag])

    const search = async (isClear) => {

        let params = {tags:[tagModalState.tag], isPaging: true, limit: 4, page: isClear ? 1 : page +1}

        console.log({params})
        const {data} = await getGoodsByTag({tag:tagModalState.tag, ...params})
        console.log({params,data})
        const tempList = isClear ? [] : list || []
        const newList = tempList.concat(data.goodsList)

        setList(newList)
        setPage(params.page)
        setTotalCount(data.totalCount)
    }

    const closeModal = () => {
        setTagModalState({
            ...tagModalState,
            isOpen: false
        })
    }

    const onClick=(goodsNo)=>{
        closeModal();
        if (goodsNo) {
            setTimeout(() => {
                history.push(`/goods?goodsNo=${goodsNo}`)
            }, 100)
        }
    }

    // const onRowClick = useCallback(goodsNo => {
    //     setTagModalState({
    //         ...tagModalState,
    //         isOpen: false
    //     })
    //
    //     setTimeout(() => {
    //         history.push(`/goods?goodsNo=${goodsNo}`)
    //     }, 100)
    // }, [setTagModalState])

    // const onRowClick = useCallback(() => {
    //     console.log({tagModalState})
    //     // setTagModalState(() => {
    //     //     return {
    //     //         ...tagModalState,
    //     //         isOpen: false
    //     //     }
    //     // })
    // }, [setTagModalState])

    return(
        <Div>
            {
                !list ?
                    <Skeleton.List count={5} /> :
                    list.length > 0 ? (
                            <GridList p={16} repeat={2}>
                                {
                                    list.map((goods) => <VerticalGoodsCard.Medium key={`goods${goods.goodsNo}`} goods={goods} onClick={onClick.bind(this, goods.goodsNo)}/>)
                                }
                            </GridList>
                        ) :
                        <EmptyCard url={'/store'} onClick={closeModal}/>
            }
            {
                (list && list.length < totalCount) && <MoreButton onClick={search.bind(this, false)}>더보기</MoreButton>
            }
        </Div>
    )

    return(
        <Div>
            {
                !list ?
                    <Skeleton.List count={5} /> :
                    list.length > 0 ? (
                            <>
                                {
                                    list.map((goods) =>
                                        <Div key={`goods${goods.goodsNo}`} bc={'light'} bt={0} bl={0} br={0}>
                                            <GoodsCard goods={goods} onClick={onClick.bind(this, goods.goodsNo)}/>
                                        </Div>
                                    )
                                }
                                {
                                    (list.length < totalCount) && <MoreButton onClick={search.bind(this, false)}>더보기</MoreButton>
                                }
                            </>
                        ) :
                        <EmptyCard url={'/store'} onClick={closeModal}/>
            }
        </Div>
    )
}
export default withRouter(GoodsListByTagContent)