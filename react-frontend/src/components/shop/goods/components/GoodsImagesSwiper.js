import React from 'react';
import Zoomable from "react-instagram-zoom";
import {Img} from "~/styledComponents/shared";
import {Server} from "~/components/Properties";
import BasicSwiper from "~/components/common/swipers/BasicSwiper";

const swipeOptions = {
    lazy: true,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true
    },
    autoHeight: true
}

const GoodsImagesSwiper = ({goodsImages}) => {
    return (
        <BasicSwiper options={swipeOptions}>
            {
                goodsImages.map(image =>
                    <Zoomable key={'goodsImages'+image.imageNo} releaseAnimationTimeout={200}>
                        <Img
                            width={'100vmin'} height={'100vmin'}
                            cover
                            src={Server.getImageURL() + image.imageUrl} alt={image.imageNm} />
                    </Zoomable>
                )
            }
        </BasicSwiper>
    );
};

export default GoodsImagesSwiper;
