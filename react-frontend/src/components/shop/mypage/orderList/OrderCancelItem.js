import React, {Fragment} from 'react'
import Style from './OrderDetail.module.scss'
import { Server } from '~/components/Properties'
import {Div, Flex} from '~/styledComponents/shared'

const OrderCancelItem = (props) => {
    const orderDetail = props.orderDetail
    return (
        <Fragment>
            <div className={Style.wrap}>
                <Flex p={16}>
                        <Div flexBasis={'8em'} flexShrink={0} mr={10}>
                            <img style={{width:'100%', height:'100%', objectFit:'cover'}}
                                 src={Server.getThumbnailURL() + orderDetail.orderImg} alt={'사진'}/>
                        </Div>
                        <div style={{flexDirection:'column', flexGrow: 1, justifyContent:'center'}}>
                            <Div>{orderDetail.goodsNm} {orderDetail.packAmount}{orderDetail.packUnit}</Div>
                            <Div><small>수량 : {orderDetail.orderCnt}개</small></Div>
                        </div>
                </Flex>
            </div>
        </Fragment>
    )
}
export default OrderCancelItem