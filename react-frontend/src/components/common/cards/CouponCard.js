import React from 'react';

import {Div, Span, Flex, Link, Hr, Right} from "~/styledComponents/shared";
import {CardText, CardTitle} from "reactstrap";
import ComUtil from "~/util/ComUtil";
import MathUtil from "~/util/MathUtil";
import styled from "styled-components";

//만료 쿠폰
const ExpiredCoupon = ({coupon, usedFlag}) => {
    const startDay = coupon.useStartDay.toString()
    const useStartDay = startDay.substr(0,4) + '.' + startDay.substr(4,2) + '.' + startDay.substr(6,2)
    const endDay = coupon.useEndDay.toString()
    const useEndDay = endDay.substr(0,4) + '.' + endDay.substr(4,2) + '.' + endDay.substr(6,2)
    return(
        <Div mb={10} p={20} bc={'light'} bg={'white'} rounded={2} fg={'darkBlack'}>
            <Div fontSize={12}>{usedFlag ? '쿠폰사용' : '기간만료'}</Div>
            <Div fontSize={20} my={15}><b>{coupon.couponTitle}</b></Div>
            <Div fontSize={15}>{useStartDay} ~ {useEndDay}</Div>
        </Div>
    )
}

const VerticalLine = styled(Div)`
    border-left: 3px solid lightgray;
    align-self: stretch;
    width: 1px;
    height: 79px
    // display: block;
    // margin-left: 200px;
    // margin-right: 120px;
`;

const CouponCard = ({coupon, isExpired, history, blctToWon}) => {
    const {available, usedFlag, potenCouponGoodsNo, potenCouponDiscount, onlyAppCoupon} = coupon
    const startDay = coupon.useStartDay.toString()
    const useStartDay = startDay.substr(0,4) + '.' + startDay.substr(4,2) + '.' + startDay.substr(6,2)
    const endDay = coupon.useEndDay.toString()
    const useEndDay = endDay.substr(0,4) + '.' + endDay.substr(4,2) + '.' + endDay.substr(6,2)
    const won = MathUtil.roundHalf(MathUtil.multipliedBy(coupon.couponBlyAmount,blctToWon));

    return (
        <Div my={15} p={15} bc={'light'} bg={'white'} minHeight={110} alignItems={'center'}>
            <Div>
                <Flex fg={!isExpired ? available ? 'black' : 'dark' : 'dark'} justifyContent={'space-between'} alignItems={'center'}>
                    <Div fontSize={12}>
                        {
                            // isExpired ? usedFlag ? <Div bold fontSize={14} mb={10}>{coupon.couponTitle} [사용완료]</Div>
                            //     : <Div bold fontSize={14} mb={10}>{coupon.couponTitle}</Div>
                            //     :
                            (
                                coupon.prodGoodsProducerNo ?
                                    (
                                        <Link to={{
                                            pathname: '/couponGoodsList',
                                            state: {
                                                couponNo: coupon.couponNo
                                            }
                                        }} mb={10} cursor>
                                            <Div fontSize={14} mb={10} fg={'primary'}><u><b>{coupon.couponTitle}</b></u></Div>
                                        </Link>
                                    )
                                    : <Div fontSize={14} mb={10}><b>{coupon.couponTitle}</b>{onlyAppCoupon ? <Span fontSize={11}> [APP전용]</Span> : null }</Div>
                            )
                        }
                        <Div>{useStartDay} ~ {useEndDay}</Div>
                        {
                            (!coupon.prodGoodsProducerNo && !potenCouponGoodsNo) && (
                                coupon.minGoodsPrice > 0 ?
                                    <Div>{ComUtil.addCommas(coupon.minGoodsPrice)} 원 이상 상품구매시 사용가능</Div>
                                    :
                                    <Div>
                                        {
                                            coupon.minOrderBlyAmount !== 0 ? ComUtil.addCommas(coupon.minOrderBlyAmount) + 'BLY 이상 상품구매시 사용가능'
                                                :
                                                coupon.wonCoupon ? ComUtil.addCommas(coupon.fixedWon) + '원 이상 상품구매시 사용가능' :
                                                    coupon.couponType == 'deliveryCoupon' ? '상품금액에서 배송비 할인 적용' :
                                                    '제한없음'
                                        }
                                    </Div>
                            )
                        }
                    </Div>

                    {
                        (!coupon.prodGoodsProducerNo && !potenCouponGoodsNo) && (
                            // <VerticalLine />
                            <Div fontSize={20} flexShrink={0}>
                                <div>
                                    {
                                        coupon.couponType == 'deliveryCoupon' ?
                                            <Div bold fg={!isExpired && 'green'}>무료배송</Div> :
                                            coupon.wonCoupon ?
                                                <Div bold fg={!isExpired && 'green'}>{ComUtil.addCommas(coupon.fixedWon)} 원</Div>
                                                :
                                                <Div bold fg={!isExpired && 'green'}>{ComUtil.addCommas(coupon.couponBlyAmount)} BLY</Div>
                                    }
                                    {
                                        (!isExpired && available && !coupon.wonCoupon && coupon.couponType != 'deliveryCoupon') &&
                                        <Div fg={'dark'} fontSize={14}>{ComUtil.addCommas(won)}원</Div>
                                    }
                                    {
                                        (!isExpired && coupon.wonCoupon && coupon.couponType != 'deliveryCoupon') && // 원화쿠폰은 매일 시세에 따라 변동되는 BLY 표시
                                        <Div fg={'dark'} fontSize={14}>{ComUtil.addCommas(ComUtil.roundDown(MathUtil.dividedBy(coupon.fixedWon,blctToWon),2))} BLY</Div>
                                    }
                                    {
                                        isExpired && usedFlag && <Div fontSize={14} bold textAlign={'center'}>[사용완료]</Div>
                                    }
                                </div>

                            </Div>
                        )
                    }
                </Flex>
            </Div>
            {
                (coupon.couponGoods && !isExpired && !usedFlag) ? (
                    <Link to={`/goods?goodsNo=${coupon.couponGoods.targetGoodsNo}`} mt={15} display={'block'}>
                        <Div textAlign={'center'} bg={'darkBlack'} fg={'white'} fontSize={14} minHeight={30} lineHeight={30}>
                            상품 바로가기
                        </Div>
                    </Link>
                ) : null
            }
            {
                (coupon.targetProducerNo > 0 && !isExpired && !usedFlag) && (
                    <Link to={`/producersGoodsList?producerNo=${coupon.targetProducerNo}`} mt={15} display={'block'}>
                        <Div textAlign={'center'} bg={'darkBlack'} fg={'white'} fontSize={14} minHeight={30} lineHeight={30}>
                            생산자 상품 바로가기
                        </Div>
                    </Link>
                )
            }
        </Div>
    );
};

export default CouponCard
