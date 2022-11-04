import React from 'react'
import Swiper from 'react-id-swiper'
import { Link } from 'react-router-dom'
import {LazyLoadImage} from "react-lazy-load-image-component";
import {Div} from "~/styledComponents/shared";

const BannerSwiper = (props) => {
    const { data } = props
    const swipeOptions = {
        lazy: true,
        // centeredSlides: true,   //중앙정렬
        // slidesPerView: 'auto',
        // slidesPerView: 1,
        // spaceBetween: 10,
        loop: (data.length <= 1)? false: true, //배너1개일때는 rolling쭝단.
        // loop: true,
        rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
        autoplay: {
            delay: 3000,
            disableOnInteraction: false
        },
        pagination: {
            el: '.swiper-pagination',
            // type: 'fraction',
            // clickable: true,
            // dynamicBullets: true
            // modifierClass: '.swiper-pagination'
            // currentClass: 'swiper-pagination2'

        },
        // navigation: {
        //     nextEl: '.swiper-button-next',
        //     prevEl: '.swiper-button-prev'
        // }
    }
    if(data.length <= 0) return null
    return <div>
        <Swiper {...swipeOptions}>
            {
                data.map( (event, index) => (
                    <div key={'eventBanner'+index}>
                        <Link to={event.url}>
                            <LazyLoadImage
                                alt={'banner'}
                                // height={image.height}
                                src={event.imageUrl} // use normal <img> attributes as props
                                // width={image.width}
                                effect="blur"
                                width={'100%'}
                                placeholderSrc={'/lazy/gray_lazy_1_1.jpg'}
                            />
                        </Link>
                    </div>
                ))
            }
        </Swiper>
    </div>
}
export default BannerSwiper