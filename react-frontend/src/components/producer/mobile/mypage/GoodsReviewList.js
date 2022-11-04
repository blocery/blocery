import React, { useState, useEffect } from 'react'
import {Div} from "~/styledComponents/shared";

import {getConsumer} from '~/lib/shopApi'
import {setLastSeenGoodsReview, getProducerReviewList} from '~/lib/producerApi';
import BackNavigation from "~/components/common/navs/BackNavigation";
import GoodsReviewCard from "~/components/common/cards/GoodsReviewCard";
import Skeleton from "~/components/common/cards/Skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import {EmptyBox} from "~/styledComponents/ShopBlyLayouts";

//private
const ProducerRiviewList = ({data, onRowClick, isFeed}) => {
    return data.map(oneReview => {
            return(
                <GoodsReviewCard
                    data = {oneReview}
                    isProducer = {true}
                />
            )
        }
    )
};

const GoodsReviewList = () => {
    const [loginUser, setLoginUser] = useState(null)
    const [reviewList, setReviewList] = useState()
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(0)

    useEffect(() => {
        fetch();
    }, [])

    const fetch = async() => {
        setLastSeenGoodsReview();
        const {data:consumer} = await getConsumer();
        setLoginUser(consumer)
        await fetchMoreData(true, consumer.consumerNo)
    }

    //페이지별 로드
    const fetchMoreData =  async (isNewSearch) => {

        let params = { isPaging: true, limit: 10 } //, producerNo:`${consumerNo-900000000}` }

        if (isNewSearch) {
            params.page = 1
        }else{
            params.page = page + 1
        }

        const {data} = await getProducerReviewList(params)
        const tempList = isNewSearch ? [] : reviewList
        const newList = tempList.concat(data.goodsReviews)

        setReviewList(newList)
        setPage(params.page)

        //더이상 로딩 되지 않도록
        if (newList.length >= data.totalCount) {
            setHasMore(false)
        }else{
            setHasMore(true)
        }
    }

    return (
        <Div>
            {/*<ShopXButtonNav historyBack fixed underline>내 게시글</ShopXButtonNav>*/}
            <BackNavigation showShopRightIcons>상품리뷰</BackNavigation>
            <Div>
                {
                    !reviewList ? <Skeleton.List count={4}/> :
                        (reviewList.length === 0) ?
                            <EmptyBox>조회 내역이 없습니다.</EmptyBox> :
                            <InfiniteScroll
                                dataLength={reviewList.length}
                                next={fetchMoreData.bind(this, false, loginUser.consumerNo)}
                                hasMore={hasMore}
                                loader={<Skeleton.List count={1} />}
                                refreshFunction={fetchMoreData.bind(this, true, loginUser.consumerNo)}
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
                                <ProducerRiviewList data={reviewList}/>
                            </InfiniteScroll>
                    }
            </Div>
        </Div>
    )

}


export default GoodsReviewList;