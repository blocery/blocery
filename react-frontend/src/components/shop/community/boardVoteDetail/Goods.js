import React, {useEffect, useState, useMemo, useCallback} from 'react';
import GoodsCard from "~/components/common/cards/GoodsCard";
import {getGoodsByGoodsNo} from "~/lib/goodsApi";

const Goods = ({goodsNo}) => {
    const [goods, setGoods] = useState()
    useEffect(() => {
        search()
    }, [])
    const search = async () => {
        const {data} = await getGoodsByGoodsNo(goodsNo)
        console.log({data})
        setGoods(data)
    }
    return (
        <GoodsCard goods={goods} />
    );
};

export default Goods;
