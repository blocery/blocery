import {useRecoilState} from "recoil";
import {boardTagModalState} from "~/recoilState";
import React, {useCallback, useEffect, useState} from "react";
import {getGoodsReviewByTags} from "~/lib/shopApi";
import {Div} from "~/styledComponents/shared";
import Skeleton from "~/components/common/cards/Skeleton";
import GoodsReviewCard from "~/components/common/cards/GoodsReviewCard";
import loadable from "@loadable/component";
import {withRouter} from 'react-router-dom'
const MoreButton = loadable(() => import("./MoreButton"))
const EmptyCard = loadable(() => import("./EmptyCard"))
const GoodsReviewListContent = ({history}) => {
    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)
    const [list, setList] = useState()
    const [page, setPage] = useState(0)
    const [totalCount, setTotalCount] = useState(0)

    useEffect(() => {
        search(true)
    }, [tagModalState.tag])

    const search = async (isClear) => {

        let params = {isPaging: true, limit: 3, page: isClear ? 1 : page +1}

        const {data} = await getGoodsReviewByTags({tags:[tagModalState.tag], ...params})
        console.log({params,data})
        const tempList = isClear ? [] : list || []
        const newList = tempList.concat(data.goodsReviews)

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

    const onClick = (orderSeq) => {
        closeModal();
        history.push(`/goodsReviewDetail/${orderSeq}`)
    }

    const onProfileClick = (consumerNo) => {
        closeModal();
        history.push(`/consumersDetailActivity?consumerNo=${consumerNo}`)
    }

    return(
        <Div>
            {
                !list ?
                    <Skeleton.List count={5} /> :
                    list.length > 0 ? (
                            <>
                                {
                                    list.map((goodsReview) =>
                                        <Div key={`goodsReview${goodsReview.orderSeq}`} bc={'light'} bt={0} bl={0} br={0}>
                                            <GoodsReviewCard data={goodsReview}
                                                             onClick={onClick.bind(this, goodsReview.orderSeq)}
                                                             onProfileClick={onProfileClick.bind(this,  goodsReview.profileInfo.consumerNo)}
                                            />
                                        </Div>
                                    )
                                }
                                {
                                    (list.length < totalCount) && <MoreButton onClick={search.bind(this, false)}>더보기</MoreButton>
                                }
                            </>
                        ) :
                        <EmptyCard url={'/community/goodsReviewMain'} onClick={closeModal}/>

            }
        </Div>
    )
}
export default withRouter(GoodsReviewListContent)