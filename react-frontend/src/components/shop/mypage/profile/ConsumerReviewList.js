import React, {useCallback, useEffect, useState} from 'react';
import Skeleton from "~/components/common/cards/Skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import {Div, Flex} from "~/styledComponents/shared";
import {getGoodsReviewByConsumerNo} from "~/lib/shopApi";
import ComUtil from "~/util/ComUtil";
import BackNavigation from "~/components/common/navs/BackNavigation";
import GoodsReviewCard from "~/components/common/cards/GoodsReviewCard";

const ConsumerReviewList = (props) => {
    const params = ComUtil.getParams(props);
    const consumerNo = params.consumerNo;
    const [reviewList, setReviewList] = useState([])
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(0)

    useEffect(() => {
        fetchMoreData(true, consumerNo)
    }, [])

    const fetchMoreData = async (isNewSearch) => {
        let params = { consumerNo:consumerNo, isPaging: true, limit: 10 }

        if (isNewSearch) {
            params.page = 1
        }else{
            params.page = page + 1
        }
        const {data} = await getGoodsReviewByConsumerNo(params);
        console.log({params});

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
            <BackNavigation showShopRightIcons>리뷰</BackNavigation>
            <Div minHeight={110}>
                {
                    (reviewList.length <= 0) && (
                        <Flex minHeight={110} justifyContent={'center'} fg={'secondary'}>등록된 리뷰가 없습니다.</Flex>
                    )
                }
                <InfiniteScroll
                    dataLength={reviewList.length}
                    next={fetchMoreData}
                    hasMore={hasMore}
                    loader={<Skeleton.ProductList count={1} />}
                >
                    {
                        reviewList.map((goodsReview, index) =>
                            <Div key={`consumerGoodsReview${goodsReview.orderSeq}`} bc={'light'} bt={0} bl={0} br={0}>
                                <GoodsReviewCard showGoodsNm data={goodsReview} />
                            </Div>
                        )
                    }
                </InfiniteScroll>
            </Div>
        </Div>
    )

}

export default ConsumerReviewList;