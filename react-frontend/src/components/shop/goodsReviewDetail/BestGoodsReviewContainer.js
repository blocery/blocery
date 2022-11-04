import React, {useEffect, useState} from 'react';
import {getCommunityBestGoodsReviewList} from "~/lib/shopApi";
import {Div, Flex} from "~/styledComponents/shared";
import BasicSwiper from "~/components/common/swipers/BasicSwiper";
import Skeleton from "~/components/common/cards/Skeleton";
import GoodsReviewCard from "~/components/common/cards/GoodsReviewCard";

//긍정적 리뷰 (8점 이상)
const BestGoodsReviewContainer = ({reviewerConsumerNo, goodsNo, orderSeq}) => {

    const [state, setState] = useState()

    useEffect(() => {
        search()
    }, [orderSeq])

    const search = async () => {
        const {status, data} = await getCommunityBestGoodsReviewList(goodsNo)
        if (status === 200) {
            //리뷰 작성자가 작성한 리뷰는 제외
            const newState = data.filter(goodsReview => goodsReview.consumerNo !== reviewerConsumerNo)

            setState(newState)
        }else{
            setState([])
        }
    }


    if (!state) return <Skeleton.ProductList count={1} />

    return (
        <Div>
            {
                (state.length <= 0) ? (
                    <Flex minHeight={110} justifyContent={'center'} fg={'secondary'}>등록된 리뷰가 없습니다.</Flex>
                ) : (
                    <BasicSwiper options={{
                        pagination: {
                            el: '.swiper-pagination',
                        }
                    }}>
                        {
                            state.map((goodsReview, index) =>
                                <Div key={`bestGoodsReview${index}`}>
                                    <GoodsReviewCard
                                        data={goodsReview}
                                    />
                                </Div>
                            )
                        }
                    </BasicSwiper>
                )
            }
        </Div>
    )
}

export default BestGoodsReviewContainer;
