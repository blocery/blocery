import React, {useState, useEffect} from 'react';
import {Flex, Right} from "~/styledComponents/shared";
import {getOrderCountByOrderSubGroupNo} from '~/lib/shopApi'

const SubGroupLabel = ({orderSubGroupNo}) => {
    // const isNewSubGroup = (index === 0) || (orderDetailList[index-1] && orderDetail.orderSubGroupNo !== orderDetailList[index-1].orderSubGroupNo)
    //
    // let totalOrderCount = 0
    // if (isNewSubGroup) {
    //     const subGroupOrderList = orderDetailList.filter(item => item.orderSubGroupNo === orderDetail.orderSubGroupNo)
    //     totalOrderCount = subGroupOrderList.length
    // }
    //
    // if (!isNewSubGroup) return null


    const [count, setCount] = useState()

    //서버에서 정확히 조회하도록 변경
    useEffect(() => {
        getOrderCountByOrderSubGroupNo({orderSubGroupNo}).then(res => {
            setCount(res.data)
        })
    }, [])

    return (
        <Flex fontSize={14} bg={'black'} fg={'veryLight'} px={16} py={8}>
            <div>
                주문 그룹번호 <b>{orderSubGroupNo}</b>
            </div>
            <Right>
                {
                    count === undefined ? '...' : `${count} 건`
                }
            </Right>
        </Flex>
    );
};


// const SubGroupLabel = ({orderDetail, index, orderDetailList}) => {
//     const isNewSubGroup = (index === 0) || (orderDetailList[index-1] && orderDetail.orderSubGroupNo !== orderDetailList[index-1].orderSubGroupNo)
//
//     let totalOrderCount = 0
//     if (isNewSubGroup) {
//         const subGroupOrderList = orderDetailList.filter(item => item.orderSubGroupNo === orderDetail.orderSubGroupNo)
//         totalOrderCount = subGroupOrderList.length
//     }
//
//     if (!isNewSubGroup) return null
//
//     return (
//         <Flex fontSize={14} bg={'black'} fg={'veryLight'} px={16} py={8}>
//             <div>
//                 주문 그룹번호 <b>{orderDetail.orderSubGroupNo}</b>
//             </div>
//             <Right>
//                 <small>
//                     {totalOrderCount} 건
//                 </small>
//             </Right>
//         </Flex>
//     );
// };

export default SubGroupLabel;
