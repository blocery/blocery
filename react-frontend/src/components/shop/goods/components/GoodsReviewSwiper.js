import React from 'react';
import BasicSwiper from "~/components/common/swipers/BasicSwiper";
import {Div, Flex} from "~/styledComponents/shared";
import {EmptyBox} from '~/styledComponents/ShopBlyLayouts'
import Swiper from 'react-id-swiper';
import Skeleton from "~/components/common/cards/Skeleton";
import GoodsReviewCard from "~/components/common/cards/GoodsReviewCard";

const params = {
    // slidesPerView: 1.4,
    // scrollbar: {
    //     el: '.swiper-scrollbar',
    //     hide: false
    // },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        // dynamicBullets: true
    },
}

const GoodsReviewSwiper = ({goodsReviews}) => {
    if (!goodsReviews) return <Skeleton.List count={1} />

    return goodsReviews.length <= 0 ? <EmptyBox>아직 리뷰가 없습니다.</EmptyBox> : (
        <Swiper {...params}>
            {
                goodsReviews.map(goodsReview =>
                    <Div key={`bestGoodsReview${goodsReview.orderSeq}`} pb={20}>
                        <GoodsReviewCard data={goodsReview} />
                    </Div>
                )
            }
        </Swiper>
    )
};

export default GoodsReviewSwiper;
