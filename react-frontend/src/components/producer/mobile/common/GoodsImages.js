import React, {useEffect, useState} from 'react';
import {getGoodsByGoodsNo} from "~/lib/goodsApi";
import ComUtil from "~/util/ComUtil";
import {Server} from "~/components/Properties";
import {Div, Flex} from "~/styledComponents/shared";
import Zoomable from "react-instagram-zoom";
const GoodsImages = ({goodsNo}) => {
    const [goods, setGoods] = useState()
    useEffect(() => {
        searchGoods()
    }, [])

    const searchGoods = async () => {
        try {
            const {status, data} = await getGoodsByGoodsNo(goodsNo)
            if (status === 200) {
                if (data) {
                    setGoods(data)
                }
            }
        }catch (err) {
            console.error(err.message)
        }
    }

    if (!goods) return null
    return (
        <Flex overflow={'auto'}>
            {
                goods.goodsImages.map(image =>
                    <Zoomable key={image.imageNo} releaseAnimationTimeout={200}>
                        <img style={{height: '50vmin'}} src={Server.getImageURL() + image.imageUrl} />
                    </Zoomable>
                )
            }
        </Flex>
    );
};

export default GoodsImages;
