import React, {useEffect, useRef} from 'react'
import GoodsCard from "~/components/common/cards/GoodsCard";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import {Button, Div, Divider, Flex, Right, Span} from "~/styledComponents/shared";
import ReactIdSwiper from "react-id-swiper";


//TODO 미사용으로 변경함 (VerticalGoodsCard.Medium 로만 사용하기로 함)
const LocalGoodsCard = (props) => {
    const {data, viewType} = props

    useEffect(() => {
        console.log(data);
    }, [])

    return (
        <div>
            {
                data.map(goods =>
                    viewType === 'list' ?
                        <Div>
                            {/* 상품 이미지에 겹쳐야 하는데 일단 윗부분에 표시해둠  */}
                            {goods.objectUniqueFlag && <Div ml={16}>직접 확인가능</Div>}
                            <Flex>
                                <GoodsCard key={goods.goodsNo} goods={goods}/>
                                {goods.localfoodFarmerNo > 0 &&
                                <Right mr={16}>
                                    {goods.localfoodFarmer.farmerName}
                                </Right>
                                }

                            </Flex>
                        </Div>
                        :
                        <VerticalGoodsCard.Medium key={goods.goodsNo} goods={goods} isWide={true}
                                                  imageType={TYPE_OF_IMAGE.SQUARE} style={{p: 16}}/>
                )
            }
        </div>
    )
}
export default LocalGoodsCard