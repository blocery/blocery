import React from 'react';
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import ReactIdSwiper from "react-id-swiper";
import {Div} from "~/styledComponents/shared";

const SPACE_BETWEEN = 10

const options = {
    lazy: true,
    slidesPerView: 2.3,
    spaceBetween: SPACE_BETWEEN,
    // rebuildOnUpdate: true, //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true
    },
    breakpoints: {
        // 1024: {
        //     slidesPerView: 4,
        //     spaceBetween: 40
        // },
        768: {
            slidesPerView: 4.3,
            spaceBetween: SPACE_BETWEEN
        },
        640: {
            slidesPerView: 3.3,
            spaceBetween: SPACE_BETWEEN
        },
        320: {
            slidesPerView: 2.3,
            spaceBetween: SPACE_BETWEEN
        }
    },
}

const GoodsListSwiper = ({
                             goodsList,
                             styledWrapperStyle={},
                             wrapperStyle = {},
                             styledCardStyle={},
                             cardStyle = {}}) => {
    return (
        <Div p={16} {...styledWrapperStyle} style={wrapperStyle}>
            <ReactIdSwiper {...options} >
                {
                    goodsList.map(goods =>
                        <div key={goods.goodsNo} {...styledCardStyle} style={{paddingBottom: 30, ...cardStyle} }>
                            <VerticalGoodsCard.Medium goods={goods} // isThumnail={true}
                                                      imageType={TYPE_OF_IMAGE.SQUARE} />
                        </div>
                    )
                }
            </ReactIdSwiper>
        </Div>
    )
    // return (
    //     <Swiper {...options}>
    //         {
    //             goodsList.map(goods =>
    //                 <VerticalGoodsCard key={goods.goodsNo} goods={goods} />
    //             )
    //         }
    //     </Swiper>
    // )
};

export default GoodsListSwiper;
