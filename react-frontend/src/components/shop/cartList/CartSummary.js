import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import ComUtil from '../../../util/ComUtil'

import styled from 'styled-components'
import { Div, Flex } from '~/styledComponents/shared/Layouts'
import { HrThin } from '~/styledComponents/mixedIn'
import {Bold} from "~/styledComponents/ShopBlyLayouts";

const Price = styled(Div)`
    flex-grow: 1;
    text-align: right;
`;

//결제내역 컨텐츠
const CartSummary = (props) => {

    const { totGoodsPrice, totDeliveryFee } = props


    return (
        <Fragment>
            <Div bg={'white'} px={16} py={30} fontWeight={'normal'}>
                <Flex p={1}>
                    <Div textAlign={'left'} fg={'darkBlack'}>총 상품금액</Div>
                    <Price><Bold>{ComUtil.addCommas(totGoodsPrice)}</Bold> 원</Price>
                </Flex>
                <Flex p={1}>
                    <Div textAlign={'left'} fg={'darkBlack'}>총 배송비</Div>
                    <Price>{totDeliveryFee > 0 ? <>+ <Bold>{ComUtil.addCommas(totDeliveryFee)}</Bold> 원</> : '무료배송'}</Price>
                </Flex>
                <HrThin mt={15} mb={16} bc={'black'} />
                <Flex p={1} fontSize={17}>
                    <Div textAlign={'left'}><b>총 결제금액</b></Div>
                    <Price><Bold fw={'bold'}>{ComUtil.addCommas(totGoodsPrice + totDeliveryFee )}</Bold> <b>원</b></Price>
                </Flex>
            </Div>

        </Fragment>
    )
}

CartSummary.propTypes = {
    sumGoodsPrice: PropTypes.number.isRequired,
    sumDeliveryFee: PropTypes.number.isRequired,
}
CartSummary.defaultProps = {
    sumGoodsPrice: 0,
    sumDeliveryFee: 0
}
export default CartSummary