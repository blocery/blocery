import React, {useState, useEffect, useRef} from 'react'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import Swiper from 'react-id-swiper'
import { getConsumerGoodsDefined } from '~/lib/goodsApi'
import { SpinnerBox } from '~/components/common'
import { Server } from '~/components/Properties'
import Css from './Best.module.scss'

import {Link} from 'react-router-dom'


import { IconNext } from '~/components/common/icons'
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {Div, Flex, GridColumns, Right, Space} from "~/styledComponents/shared";
import {GrandTitle, Title20} from "~/styledComponents/ShopBlyLayouts";
import {IoIosArrowRoundForward} from "react-icons/io";
import {color} from "~/styledComponents/Properties";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import {withRouter} from "react-router-dom"
import {isForceUpdate} from "~/lib/axiosCache";

//BEST
const Best = (props) => {
    const abortControllerRef = useRef(new AbortController());

    const { limitCount = 99, ...rest } = props

    const [data, setData] = useState()

    useEffect(() => {
        search()
        return(() => {
            abortControllerRef.current.abort()
        })
    }, [])

    async function search(cancelToken) {
        try{
            const { data } = await getConsumerGoodsDefined('bestSelling', isForceUpdate(props.history), abortControllerRef.current.signal)

            //7건만 보이도록
            if(data.length > limitCount){
                data.splice(limitCount, data.length);
            }

            setData(data)
        }catch (error) {
            if (error.message === 'canceled') {
                console.log("Request cancelled : Best")
            }else{
                console.log("Request error : Best")
            }
        }
    }

    const params = {
        // centeredSlides: true,   //중앙정렬
        slidesPerView: 2.2,
        spaceBetween: 10,
        // slidesPerGroup: 2,
        // freeMode: true,
        // rebuildOnUpdate: true,  //새로운 데이터 로드시 처음부터 읽어들이도록 함(0번째 인덱스로 자동 이동됨)
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true,
            // modifierClass: '.swiper-pagination',
            // currentClass: 'swiper-pagination2'

        },
        breakpoints: {
            // 1024: {
            //     slidesPerView: 4,
            //     spaceBetween: 40
            // },
            768: {
                slidesPerView: 4.2,
                spaceBetween: 16
            },
            640: {
                slidesPerView: 3.2,
                spaceBetween: 12
            },
            320: {
                slidesPerView: 2.2,
                spaceBetween: 10
            }
        },
        // scrollbar: {
        //     el: '.swiper-scrollbar',
        //     hide: false
        // },
        // navigation: {
        //     nextEl: '.swiper-button-next',
        //     prevEl: '.swiper-button-prev',
        // }
    }
    function onClick(item){
        props.history.push(`/goods?goodsNo=${item.goodsNo}`)
    }

    if(!data) return <SpinnerBox minHeight={160} />

    return(
        <div {...rest}>
            <Flex mb={16} px={16}>
                <Space spaceGap={4} >
                    <Title20>베스트</Title20>
                </Space>
                <Right><Link to={'/store/best'}><IoIosArrowRoundForward color={color.green} style={{lineHeight: 1}} size={24}/></Link></Right>
            </Flex>

            <Div px={16}>
                {/* swiper start */}
                <Swiper {...params}>
                    {/*<div className={Css.grandTitleBox}>*/}
                    {/*    <div>베스트</div>*/}
                    {/*    <div>Best</div>*/}
                    {/*    <Link to={'/store/best'}><IconNext/></Link>*/}
                    {/*</div>*/}
                    {
                        data.slice(0, 10)//첫화면에 Best 10개로 제한 - 20200316
                            .map((item, index) => (
                                <Div key={'bestGoods'+index}>
                                     <VerticalGoodsCard.Medium
                                         goods={item}//onClick={onClick.bind(this, item)}
                                         imageType={TYPE_OF_IMAGE.SQUARE}
                                     />
                                </Div>


                        ))
                    }
                    {/* swiper end */}
                </Swiper>
            </Div>
        </div>
    )
}
export default withRouter(Best)