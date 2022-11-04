import React, {useState, useEffect, useRef} from 'react'
import { SpinnerBox } from '~/components/common'
import { getSpecialDealGoodsList } from '~/lib/shopApi'         //특가 Deal
import {Link} from 'react-router-dom'
import {Div, Flex, Right, Space} from "~/styledComponents/shared";
import Swiper from "react-id-swiper";
import {Title20} from '~/styledComponents/ShopBlyLayouts'
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {IoIosArrowRoundForward} from "react-icons/io";
import {color} from "~/styledComponents/Properties";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import {withRouter} from "react-router-dom"
import {isForceUpdate} from "~/lib/axiosCache";
//특가 Deal
const SpecialPriceDeal = (props) => {
    const abortControllerRef = useRef(new AbortController());
    const [goodsList, setGoodsList] = useState()

    useEffect(() => {
        search()
        return(() => {
            abortControllerRef.current.abort()
        })
    }, [])

    async function search() {
        try{
            const res = await getSpecialDealGoodsList(isForceUpdate(props.history), abortControllerRef.current.signal)

            if (res) {
                setGoodsList(res.data)
            }

            // if(data && data.length > 0){
            //     const index = Math.floor(Math.random() * data.length)
            //     setGoods(data[index])
            // }
        }catch (error) {
            if (error.message === 'canceled') {
                console.log("Request cancelled : SpecialPriceDeal")
            }else{
                console.log("Request error : SpecialPriceDeal")
            }
        }

    }

    function onClick(item){
        props.history.push(`/goods?goodsNo=${item.goodsNo}`)
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

    if(!goodsList) return <SpinnerBox minHeight={160} />

    /*
      padding: 59px 0px 0px 20px;
      background-color: white;
      display: flex;
    * */

    return(
        <Div pt={25}>
            <Flex mb={16} px={16}>
                <Space spaceGap={4} >
                    <Title20>특가 Deal</Title20>
                </Space>
                <Right><Link to={'/store/specialPriceDeal'}><IoIosArrowRoundForward color={color.green} style={{lineHeight: 1}} size={24}/></Link></Right>
            </Flex>

            <Div px={16}>
                <Swiper {...params}>
                    {
                        goodsList.map(goods =>
                            <Div key={goods.goodsNo} pb={20}>
                                <VerticalGoodsCard.Medium goods={goods} imageType={TYPE_OF_IMAGE.SQUARE} />
                            </Div>
                        )
                    }
                </Swiper>
            </Div>
        </Div>
    )
}

export default withRouter(SpecialPriceDeal)