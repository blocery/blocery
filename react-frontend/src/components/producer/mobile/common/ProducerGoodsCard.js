import React from 'react';
import {withRouter} from "react-router-dom";
import Skeleton from "~/components/common/cards/Skeleton";
import {Button, Div, Flex, Img, Span} from "~/styledComponents/shared";
import ComUtil from "~/util/ComUtil";
import {IconStarGroup} from "~/components/common";

const ProducerGoodsCard = React.memo(withRouter(({goods,  movePage = true, history}) => {
    if (!goods) return <Skeleton.ProductList count={1} />

    const { goodsNm, goodsNo, goodsImages,avgScore, discountRate, consumerPrice, currentPrice, remainedCnt, saleEnd} = goods

    //이미지의 정 사각형을 비유 유지하기 위해
    const height = '25vmin'
    //큰 사이즈로 될 경우 이미지 최대치 한계 설정
    const maxHeight = 100;

    const onGoodsClick = () => {

        if (movePage) {
            history.push(`/goods?goodsNo=${goodsNo}`)
        }
    }

    //WebGoodsList에서 복사.
    const getStatus = (rowData) => {
        let toDate = ComUtil.utcToString(new Date());
        let saleDateEnd = rowData.saleEnd ? ComUtil.utcToString(rowData.saleEnd) : null;

        let status;

        if (!rowData.confirm) {
            status = '임시저장'
        } else {
            status = '판매중'
            if (rowData.salePaused) {
                status = '일시중지'
            }
            if (rowData.saleStopped) {
                status = '판매중단'
            }
            if (rowData.remainedCnt <= 0) {
                status += '|품절'
            }

            if (saleDateEnd) {
                let newResult = saleDateEnd.replace(/\./gi, "-")
                let diffSaleResult = ComUtil.compareDate(newResult, toDate);
                if (diffSaleResult === -1) {
                    status += '|판매기한만료'
                }
            }
        }
        return status
    }

    return(
        <Flex px={16}
              py={20} //minHeight={142}
              bg={'white'} cursor={1} onClick={onGoodsClick}>
            <Div width={height} height={height} maxWidth={maxHeight} maxHeight={maxHeight} flexShrink={0}>
                <Img width={'100%'} height={'100%'} rounded={5}
                     cover
                     src={ComUtil.getFirstImageSrc(goodsImages)} alt={goodsNm} />
            </Div>
            <Flex height={height} maxHeight={maxHeight} ml={16} flexDirection={'column'} alignItems={'flex-start'}
                  // justifyContent={'space-between'}
            >
                <Div>
                    <Div lineClamp={1} fontSize={14}>{goodsNm}</Div>
                </Div>
                {/*<Flex >*/}
                {/*    <IconStarGroup score={avgScore} size={14} />*/}
                {/*    {*/}
                {/*        avgScore ? <Div ml={10} bold>{avgScore.toFixed(1)}</Div> : null*/}
                {/*    }*/}
                {/*    <Div ml={10} fg={'green'}>리뷰<Span ml={3} >{goods.goodsReviewsCount}</Span></Div>*/}
                {/*</Flex>*/}
                <Flex fontSize={14}>
                    <Div fw={900} fg={'danger'} bold>{ComUtil.roundDown(discountRate, 0)}%</Div>
                    <Div fg={'dark'} mx={10}><strike>{ComUtil.addCommas(consumerPrice)}</strike></Div>
                    <Div ml={6}><Span fw={900} fontSize={17}>{ComUtil.addCommas(currentPrice)}</Span>원</Div>
                </Flex>
                <Div>
                    <Div lineClamp={1} fontSize={14}>상태: {getStatus(goods)}</Div>
                </Div>
                <Div>
                    <Div lineClamp={1} fontSize={14}>재고: {remainedCnt}개, 판매종료: {ComUtil.utcToString(saleEnd)}</Div>
                </Div>
            </Flex>
        </Flex>
    )
}))

export default ProducerGoodsCard;
