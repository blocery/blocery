import React, { Fragment } from 'react'
import ComUtil from '~/util/ComUtil'
import { NoSearchResultBox, IconStarGroup, HeaderTitle } from '~/components/common'
import MoreButton from '~/components/common/buttons/MoreButton'
import {Server} from '~/components/Properties'
import {Hr} from "~/styledComponents/shared";
import GoodsReviewCard from "~/components/common/cards/GoodsReviewCard";
import {EmptyBox} from "~/styledComponents/ShopBlyLayouts";

const GoodsReviewContent = ({goodsReviews, showGoodsNm, totalCount, isVisibleStar, onMoreClick, isVisibleTitle}) => {

    if (!goodsReviews) return null

    if (goodsReviews.length <= 0) return <EmptyBox>아직 리뷰가 없습니다.</EmptyBox>

    return(
        <>
            {
                goodsReviews.map((goodsReview, index) =>
                    <Fragment key={goodsReview.orderSeq}>
                        {index !== 0 && <Hr mx={16} />}
                        {/*<GoodsReviewItem  {...goodsReview} showGoodsNm={showGoodsNm} />*/}
                        <GoodsReviewCard data={goodsReview} showGoodsNm={showGoodsNm} />
                    </Fragment>
                )
            }
            {
                (goodsReviews.length < totalCount && goodsReviews.length <= 10) && <MoreButton onClick={onMoreClick} />
            }
            {
                (goodsReviews.length > 10) && <MoreButton onClick={onMoreClick} >더보기</MoreButton>
            }
        </>
    )
}

export default GoodsReviewContent