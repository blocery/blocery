import React from 'react';
import {withRouter} from "react-router-dom";
import Skeleton from "~/components/common/cards/Skeleton";
import {AbsoluteMask, Button, Div, Flex, Img, Span} from "~/styledComponents/shared";
import ComUtil from "~/util/ComUtil";
import {IconStarGroup} from "~/components/common";
import {Bold} from "~/styledComponents/ShopBlyLayouts";
import GoodsBadges from "~/components/common/badges/GoodsBadges";
import useImg from "~/hooks/useImg";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import RoundedZzimButton from "~/components/common/buttons/RoundedZzimButton";
import LocalfoodIconCard from "~/components/common/cards/LocalfoodIconCard";



const GoodsCard = withRouter(({goods, showProducer = false, onClick, movePage = true, history, ...rest}) => {
    if (!goods) return <Skeleton.ProductList count={1} />

    const {producerNo, goodsNm, goodsNo, goodsImages, producerFarmNm, avgScore, discountRate, consumerPrice, currentPrice, remainedCnt} = goods

    const {imageUrl, onError} = useImg(goodsImages, TYPE_OF_IMAGE.SQUARE)


    //이미지의 정 사각형을 비유 유지하기 위해
    const height = '25vmin'
    //큰 사이즈로 될 경우 이미지 최대치 한계 설정
    const maxHeight = 100;

    const onGoodsClick = () => {
        if (onClick && typeof onClick === 'function') {
            onClick()
        }else {
            if (movePage) {
                history.push(`/goods?goodsNo=${goodsNo}`)
            }
        }
    }
    const onProducerNoClick = (e) => {
        e.stopPropagation()
        if (movePage) {
            // history.push(`/farmersDetailActivity?producerNo=${producerNo}`)
            history.push(`/consumersDetailActivity?consumerNo=${900000000 + producerNo}`)
        }
    }

    const goodsEventName = ComUtil.getGoodsEventName(goods)


    return(
        <Flex px={16}
              py={20} //minHeight={142}
              doActive
              bg={'white'}
              cursor={1}
              alignItems={'flex-start'}
              onClick={onGoodsClick}
              {...rest}
        >
            <Div relative width={height} height={height} maxWidth={maxHeight} maxHeight={maxHeight} flexShrink={0}
                 rounded={4}
                 overflow={'hidden'}
            >
                {/* z-index 3 */}
                <Div absolute zIndex={2} right={10} bottom={10} >
                    <RoundedZzimButton goodsNo={goodsNo} active={goods.myLike} />
                </Div>
                {
                    remainedCnt <= 0 && <AbsoluteMask><Div fontSize={20} fg={'white'}>품절</Div></AbsoluteMask>
                }
                <Img width={'100%'} height={'100%'} rounded={5}
                     cover
                     onError={onError}
                     src={imageUrl} alt={goodsNm} />
            </Div>
            <Flex
                // height={height} maxHeight={maxHeight}
                ml={16} flexDirection={'column'} alignItems={'flex-start'}
                // justifyContent={'space-between'}
            >
                <Div>
                    {
                        showProducer && <Button p={0} bg={'white'} fg={'green'} fontSize={12} onClick={onProducerNoClick}>{producerFarmNm}</Button>
                    }
                    {
                        (goods.localfoodFarmerNo || goods.objectUniqueFlag) && <LocalfoodIconCard goods={goods} />
                    }
                    <Div lineClamp={1} fontSize={14}>{goodsNm}</Div>
                </Div>
                <Flex fontSize={14}>
                    {
                        (discountRate > 0 && !goods.inSuperRewardPeriod ) ? (
                            <>
                                <Bold bold fg={'danger'} bold>{ComUtil.roundDown(discountRate, 0)}%</Bold>
                                <Div fg={'dark'} mx={10}><strike>{ComUtil.addCommas(consumerPrice)}</strike></Div>
                            </>
                        ) : null
                    }
                    <Flex ml={6}>
                        <Bold bold fontSize={17}>{ComUtil.addCommas(currentPrice)}</Bold>
                        <div>원{goods.realOptionSize > 1 ? '~' : ''}</div>
                    </Flex>
                </Flex>
                {
                    goodsEventName && <GoodsBadges eventName={goodsEventName} />
                }
                <Flex mt={5}>
                    <IconStarGroup score={avgScore} size={14} />
                    <Div fontSize={13} ml={2} mb={-3}>({goods.goodsReviewsCount})</Div>
                    {/*{*/}
                    {/*    avgScore ? <Div ml={10} bold>{avgScore.toFixed(1)}</Div> : null*/}
                    {/*}*/}
                    {/*<Div ml={10} fg={'green'} >리뷰<Span ml={3} >{goods.goodsReviewsCount}</Span></Div>*/}
                </Flex>
            </Flex>
        </Flex>
    )
})

export default GoodsCard;
