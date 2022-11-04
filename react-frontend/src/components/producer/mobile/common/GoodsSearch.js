import React, {useEffect, useState} from 'react';
import GoodsCard from "~/components/common/cards/GoodsCard";
import {getProducerGoods} from "~/lib/shopApi";
import {Div, Flex} from "~/styledComponents/shared";

const GoodsSearch = ({isDealGoods = false, onChange = () => null, onClose = () => null}) => {

    const [goodsList, setGoodsList] = useState([])

    useEffect(() => {
            search()
    }, [isDealGoods])

    const search = async () => {
        const {data} = await getProducerGoods(isDealGoods ? 2:0); //0=all 1=direct 2=dealGoods
        setGoodsList(data)
    }

    const onClick = (goods) => {
        onChange(goods);
    }

    return (
        <Div //maxHeight={450} overflow={'auto'}
        >
            {
                goodsList.map(goods =>
                    <div>
                        <GoodsCard goods={goods} movePage={false} onClick={onClick.bind(this,goods)} showProducer/>
                    </div>
                )
            }
            {
                goodsList.length === 0 &&
                <div ml={16} mt={20}> 판매중인 상품이 없습니다.</div>
            }
        </Div>
    );
};

export default GoodsSearch;
