import React from 'react';
import GoodsCard from "~/components/common/cards/GoodsCard";
import Skeleton from "~/components/common/cards/Skeleton";

const ProducerGoodsList = ({goodsList}) => {
    if (!goodsList) return <Skeleton.ProductList count={3} />
    return (
        goodsList.map(goods =>
            <GoodsCard key={goods.goodsNo} goods={goods} showProducer={false} />
        )
    );
};

export default ProducerGoodsList;
