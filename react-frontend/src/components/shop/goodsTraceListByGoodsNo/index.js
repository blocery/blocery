import React, {useEffect, useState} from 'react';
import {withRouter, useParams} from 'react-router-dom'
import {getProducerBoardGoodsStepList} from "~/lib/shopApi";
import BackNavigation from "~/components/common/navs/BackNavigation";
import DealGoodsStepContent from '~/components/shop/goods/dealGoodsDetail/DealGoodsStepContent'
import Skeleton from "~/components/common/cards/Skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import {Div} from "~/styledComponents/shared";
import VoteCard from "~/components/common/cards/VoteCard";
import ComUtil from "~/util/ComUtil";

//상품번호로 이력추적 전체 조회 뷰어
const GoodsTraceListByGoodsNo = (props) => {
    const {goodsNo} = useParams()

    const [goodsSteps, setGoodsSteps] = useState()
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(0)

    useEffect(() => {
        fetchMoreData(true)
    }, [])

    //페이지별 로드
    const fetchMoreData =  async (isNewSearch) => {

        const nextPage = isNewSearch ? 1 : page + 1;

        const params = {
            goodsNo: goodsNo,
            limit: 10,
            page: nextPage
        }

        const {data} = await getProducerBoardGoodsStepList(params)

        console.log({data})

        const tempList = isNewSearch ? [] : goodsSteps
        const newList = tempList.concat(data.boards)

        setGoodsSteps(newList)
        setPage(nextPage)

        //더이상 로딩 되지 않도록
        if (newList.length >= data.totalCount) {
            setHasMore(false)
        }else{
            setHasMore(true)
        }
    }

    return (
        <>
            <BackNavigation>이력추적 현황</BackNavigation>
            {
                !goodsSteps ? <Skeleton.ProductList count={5} /> : (
                    <InfiniteScroll
                        dataLength={goodsSteps.length}
                        next={fetchMoreData.bind(this, false)}
                        hasMore={hasMore}
                        loader={<Skeleton.ProductList count={1} />}
                        // endMessage={
                        //     <p style={{ textAlign: "center" }}>
                        //         <b>Yay! You have seen it all</b>
                        //     </p>
                        // }
                        refreshFunction={fetchMoreData.bind(this, true)}
                        pullDownToRefresh
                        pullDownToRefreshThreshold={100}
                        pullDownToRefreshContent={
                            <Div textAlign={'center'} fg={'green'}>
                                &#8595; 아래로 당겨서 업데이트
                            </Div>
                        }
                        releaseToRefreshContent={
                            <Div textAlign={'center'} fg={'green'}>
                                &#8593; 업데이트 반영
                            </Div>
                        }
                    >
                        {
                            goodsSteps && (
                                <DealGoodsStepContent
                                    goodsSteps={goodsSteps}
                                />
                            )
                        }
                    </InfiniteScroll>
                )
            }
        </>
    );
};

export default GoodsTraceListByGoodsNo;
