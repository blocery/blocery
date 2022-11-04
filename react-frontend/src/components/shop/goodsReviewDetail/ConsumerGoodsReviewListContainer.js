import React, {useEffect, useState} from 'react';
import {Div, Flex, ListSpace, Span} from "~/styledComponents/shared";
import IconStarGroup from "~/components/common/icons/IconStarGroup";
import GoodsReviewCard from "~/components/common/cards/GoodsReviewCard";
import {getGoodsReviewByConsumerNo} from "~/lib/shopApi";
import Skeleton from "~/components/common/cards/Skeleton";
import InfiniteScroll from "react-infinite-scroll-component";

const ConsumerGoodsReviewListContainer = ({consumerNo, orderSeq}) => {
    const [state, setState] = useState([])
    const [hasMore, setHasMore] = useState(true)
    const [loading, setLoading] = useState(true)

    //history.push() 로 이동시 강제로 데이터 새로고침 하기 위해
    useEffect(() => {
        if (!loading){
            setLoading(true)
            setHasMore(true);
            fetchMoreData()
        }
    }, [orderSeq])

    const fetchMoreData = async () => {

        console.log("fetchMoreData >>>>>")

        const {status, data} = await getGoodsReviewByConsumerNo({consumerNo, isPaging: true, limit: 5})

        if (status === 200) {

            const {goodsReviews} = data

            //현재 보고있는 상품리뷰와 겹치지 않도록 제거
            const newState = goodsReviews.filter(goodsReview => goodsReview.orderSeq !== orderSeq)
            setState(newState)
        }

        //최초 한번만 조회되면 이후는 조회되지 않도록 함
        setLoading(false)
        setHasMore(false);
    }

    if (!state) return null


    return (
        <Div minHeight={110}>
            {
                (!loading && state.length <= 0) && (
                    <Flex minHeight={110} justifyContent={'center'} fg={'secondary'}>등록된 리뷰가 없습니다.</Flex>
                )
            }
            <InfiniteScroll
                dataLength={state.length}
                next={fetchMoreData}
                hasMore={hasMore}
                loader={<Skeleton.ProductList count={1} />}
                // endMessage={
                //     <p style={{ textAlign: "center" }}>
                //         <b>Yay! You have seen it all</b>
                //     </p>
                // }

            >
                {
                    state.map((goodsReview, index) =>
                        <Div key={`consumerGoodsReview${goodsReview.orderSeq}`} bc={'light'} bt={0} bl={0} br={0}>
                            <GoodsReviewCard data={goodsReview} showGoodsNm={true}/>
                        </Div>
                    )
                }
            </InfiniteScroll>
        </Div>
    );
};

export default ConsumerGoodsReviewListContainer;
