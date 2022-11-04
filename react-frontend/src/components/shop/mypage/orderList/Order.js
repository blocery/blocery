import React, {useState, useEffect, Fragment} from 'react'
import { getOrderDetailByOrderSeq } from '~/lib/shopApi'
import OrderDetail from './OrderDetail'
import {ShopXButtonNav} from '~/components/common'
import BackNavigation from "~/components/common/navs/BackNavigation";

const Order = (props) => {

    const [orderSeqs, setOrderSeqs] = useState()

    //파라미터로 주문정보 가져오기
    const params = new URLSearchParams(props.location.search);
    const orderSeq = params.get('orderSeq');

    useEffect(() => {
        //DB 조회
        async function fetch(){
            let orderList;
            orderList = [(await getOrderDetailByOrderSeq(orderSeq)).data]
            //미사용 묶음상품 조회가 되지 않았다면 일반적인 주문상세 조회
            // if(orderList[0].producerWrapDelivered){
            //     //묶음상품 조회
            //     orderList = (await getOrderWrapListByOrderSeq(orderSeq)).data
            // }
            setOrderSeqs(orderList.map(order => order.orderSeq))
        }

        fetch()
    }, [])

    if(!orderSeqs) return null

    return(
        <>
        {/*<ShopXButtonNav fixed underline historyBack> 주문 상세내역 </ShopXButtonNav>*/}
            <BackNavigation>주문내역</BackNavigation>
            {
                orderSeqs.map(orderSeq => <OrderDetail key={`orderDetail_${orderSeq}`} orderSeq={orderSeq}/>)
            }
        </>
    )

}
export default Order