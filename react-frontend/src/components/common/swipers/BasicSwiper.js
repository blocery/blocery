import Swiper from "react-id-swiper";
import {Server} from "~/components/Properties";
import React from "react";

const BasicSwiper = ({options, children}) => {
    const swipeOptions = {
        lazy: false,
        slidesPerView: 'auto',
        spaceBetween: 16,
        // pagination: {
        //     el: '.swiper-pagination',
        //     clickable: true,
        //     dynamicBullets: true
        //
        // },
        ...options
    }

    return (
        <Swiper {...swipeOptions}>
            {children}
        </Swiper>
    )
}

export default BasicSwiper