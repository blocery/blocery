import React, {useEffect, useRef} from 'react'
import GoodsCard from "~/components/common/cards/GoodsCard";
import VerticalGoodsCard from "~/components/common/cards/VerticalGoodsCard";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import {Button, Div, Divider, Flex, Link, Right, Space, Span} from "~/styledComponents/shared";
import ReactIdSwiper from "react-id-swiper";
import {getValue} from "~/styledComponents/Util";
import ComUtil from "~/util/ComUtil";
import NoProfile from "~/images/icons/renewal/mypage/no_profile.png";
import {GradeBadgeSmall, ProfileImageStrokeSmall} from "~/styledComponents/ShopBlyLayouts";
import {gradeStore} from "~/store";
import {color} from "~/styledComponents/Properties";
import {SiHotjar} from 'react-icons/si'


const LocalFarmerCard = ({farmer, onFarmerClick}) => {

    const goodsList = farmer.goodsList

    return(
        <div>
            <Flex p={16} bg={'white'} doActive cursor={1} onClick={onFarmerClick}>
                <Div relative>
                    {
                        farmer.starred && <Div absolute right={0} bottom={0}><SiHotjar size={17} color={color.danger}/></Div>
                    }
                    <img style={{objectFit: 'cover', width: 50, height: 50,borderRadius: '50%',
                        // border: `2px solid ${color.green}`
                    }}
                         src={ComUtil.getFirstImageSrc(farmer.farmerImages)? ComUtil.getFirstImageSrc(farmer.farmerImages, TYPE_OF_IMAGE.SMALL_SQUARE):ComUtil.getRandomProfileImg()}
                         alt="농가 프로필"
                    />
                </Div>

                {/*<Space ml={12} alignItems={'flex-start'} justifyContent={'center'} flexDirection={'column'}>*/}
                    {/*<Div width={100} lineClamp={1} fontSize={14} mb={6} bold>*/}
                    {/*    {farmer.farmName}*/}
                    {/*</Div>*/}
                    {/*<Space spaceGap={10}>*/}
                    <Div ml={14}>
                        <Div fontSize={17} mb={2}>
                            {farmer.farmerName}
                        </Div>
                        <Space fg={'gray'} fontSize={13}>
                            {
                                // farmer.desc || ''
                            }
                            {
                                farmer.mainItems || ''
                            }
                            {/*{farmer.desc? farmer.desc:farmer.mainItems}*/}
                        </Space>
                    </Div>

                    {/*</Space>*/}
                {/*</Space>*/}

            </Flex>

            {goodsList && goodsList.length > 0 &&
            <Flex ml={80} overflow={'auto'}>
                {
                    goodsList.map(goods =>
                        <Link to={`/goods?goodsNo=${goods.goodsNo}`} mr={16}>
                            {/*<div>{goods.goodsNm}</div>*/}
                            <img style={{width: getValue(60), height: getValue(60), borderRadius: 4, objectFit: 'cover'}} src={ComUtil.getFirstImageSrc(goods.goodsImages, 'small')} alt={'로컬푸드 상품이미지'}/>
                        </Link>
                    )
                }
            </Flex>
            }
        </div>
    )
}
export default LocalFarmerCard