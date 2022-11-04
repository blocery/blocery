import React from 'react';
import {useParams} from "react-router-dom";
// import CmGoodsReviewDetail from "~/components/shop/community/cmGoodsReviewDetail/CmGoodsReviewDetail";
import GoodsReviewDetail from "./CmGoodsReviewDetail";


const index = (props) => {
    const {orderSeq} = useParams()
    return (
        <GoodsReviewDetail orderSeq={orderSeq} />
    );
};

export default index;
