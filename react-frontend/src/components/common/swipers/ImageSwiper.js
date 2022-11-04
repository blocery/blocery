import React, { useState, useEffect, useCallback, useRef } from 'react'
import Swiper from 'react-id-swiper'
import {Server} from '~/components/Properties'
import {Flex, Img} from "~/styledComponents/shared";
import Zoomable from "react-instagram-zoom";
import {responsive} from "~/styledComponents/Properties";
const ImageSwiper = (props) => {
    const { images, initialSlide} = props
    const [slideIndex, setSlideIndex = 0] = useState(initialSlide)

    const swipeOptions = {
        lazy: true,
        // centeredSlides: true,   //중앙정렬
        slidesPerView: 'auto',
        initialSlide: initialSlide, //디폴트 0
        // rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
        // slidesPerView: 1,
        // spaceBetween: 10,
        // rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
        // pagination: {
        //     el: '.swiper-pagination',
        //     clickable: true
        // },
        // navigation: {
        //     nextEl: '.swiper-button-next',
        //     prevEl: '.swiper-button-prev'
        // },
        on: {
            init: function(){
            },
            slideChange: function(){
                const { activeIndex } = this
                setSlideIndex(activeIndex)
            },
            slideChangeTransitionEnd: function(){
            },
            click: function(){
            }
        }
    }

    if(images.length <= 0) return null
    return <>
        <Flex absolute zIndex={2} top={'5vmin'} left={'50%'} xCenter height={40} fg={'white'} >{`${slideIndex + 1} / ${images.length}`}</Flex>
        <Swiper {...swipeOptions}>
            {
                images.map( (image, index) => (
                    <div key={'imageSwiper_'+index}
                         className={'vh-100 d-flex align-items-center justify-content-center'}>
                        <Zoomable releaseAnimationTimeout={200}>
                            <Img
                                width={'100%'}
                                height={'unset'}
                                maxWidth={responsive.maxWidth}
                                className={'swiper-lazy'}
                                src={
                                    !image.imageUrlPath ?
                                        image.imageUrl ? Server.getImageURL() + image.imageUrl : ''
                                        :
                                        image.imageUrl ? Server.getImgTagServerURL() + image.imageUrlPath + image.imageUrl:''
                                }
                                alt="img"/>
                        </Zoomable>
                        <div className="swiper-lazy-preloader swiper-lazy-preloader-white" />
                    </div>
                ))
            }
        </Swiper>
    </>
}
export default ImageSwiper


