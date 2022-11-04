import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import ComUtil from '~/util/ComUtil'

import styled from 'styled-components'
import {Button, Div, Flex, Right, Strong, WordBalon} from '~/styledComponents/shared'
import {Bold} from "~/styledComponents/ShopBlyLayouts";
import {color} from "~/styledComponents/Properties";
import Toast from "~/components/common/toast/Toast";

const Circle = styled(Div)`
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 100%;
    top: 50%;
    right: 0;
    transport: translateY(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
    top: 50%;
    right: -10px;
    transform: translateY(-50%);
    font-size: 15px;
`;
const SumBox = styled(Div)`
    position: relative;
    padding: 16px;
    flex-grow: 1;
`;

const DeliveryInfo = styled(WordBalon)`
    position: absolute;
    top: -22px;
    left: 50%;
    transform: translateX(-50%);      
    width: 186px;
    text-align: center;
    padding: 5px 9px;
`;

const CartGroupSummary = (props) => {
    const { producer, sumGoodsPrice, sumDeliveryFee, result, deliveryDealMsg, additionalDeliveryInfo} = props

    return (
        <Div pb={32}>
            <Div fontSize={14}
                // minHeight={88}
                // custom={`border-top: 1px solid ${color.light};`}
                 bc={'light'}
                 bg={'veryLight'}
                 p={10}
            >
                <Flex fg={'dark'}>
                    <div>상품금액</div>
                    <Right fg={'darkBlack'}><Bold fw={'normal'}>{ComUtil.addCommas(sumGoodsPrice)}</Bold> 원</Right>
                </Flex>
                <Flex fg={'dark'}>
                    <div>
                        배송비 {additionalDeliveryInfo && additionalDeliveryInfo}
                    </div>
                    <Right fg={'darkBlack'}>
                        <Bold fw={'normal'}>{sumDeliveryFee > 0 ? '+' : null} {ComUtil.addCommas(sumDeliveryFee)}</Bold> 원
                    </Right>
                </Flex>
                <Flex bold>
                    <div>주문금액</div>
                    <Right><Bold>{ComUtil.addCommas(result)}</Bold> 원</Right>
                </Flex>
            </Div>
        </Div>
    )

    return (
        <Fragment>

            <Div bg={'background'} fontWeight={'normal'} mb={15}>
                <Flex fontSize={10}>
                    <SumBox>
                        <Div fg={'secondary'}>상품금액</Div>
                        <Div fontSize={12}>{ComUtil.addCommas(sumGoodsPrice)} 원</Div>
                        <Circle fg={'white'} bg={'dark'}>＋</Circle>
                    </SumBox>
                    <SumBox>
                        {
                            //미사용 producer.producerWrapDeliver && <DeliveryInfo bg={'green'}>배송비 {ComUtil.addCommas(producer.producerWrapFee)}원 / {ComUtil.addCommas(producer.producerWrapLimitPrice)}원 이상 무료</DeliveryInfo>
                        }
                        <Div fg={'secondary'}>배송비</Div>
                        <Div fontSize={12}>{ComUtil.addCommas(sumDeliveryFee)} 원</Div>
                        <Circle fg={'white'} bg={'dark'}>＋</Circle>
                    </SumBox>
                    {/*<SumBox>*/}
                    {/*    <Div fg={'secondary'}>예약상품배송비</Div>*/}
                    {/*    <Div fontSize={12}>{ComUtil.addCommas(sumReservationDeliveryFee)} 원</Div>*/}
                    {/*    <Circle fg={'white'} bg={'dark'}>=</Circle>*/}
                    {/*</SumBox>*/}
                    <SumBox>
                        <Div fg={'secondary'}>결제금액</Div>
                        <Div fontSize={12}>{ComUtil.addCommas(result)} 원</Div>
                    </SumBox>
                </Flex>
            </Div>


        </Fragment>
    )
}

CartGroupSummary.propTypes = {
    sumGoodsPrice: PropTypes.number.isRequired,
    sumDeliveryFee: PropTypes.number.isRequired,
    sumDiscountDeliveryFee: PropTypes.number.isRequired,
    result: PropTypes.number.isRequired
}
CartGroupSummary.defaultProps = {
    sumGoodsPrice: 0,
    sumDeliveryFee: 0,
    sumDiscountDeliveryFee: 0,
    result: 0
}

export default CartGroupSummary