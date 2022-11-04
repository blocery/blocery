import React, {useEffect, useState} from 'react';
import {getPagedOrderDetailListByConsumerNo} from "~/lib/shopApi";
import {Button, Div, ListBorder} from "~/styledComponents/shared";
import OrderGoodsCard from './OrderGoodsCard'

//주문상품(모달 속) 리스트
const OrderListContent = ({orderSeq, onChange}) => {

    const [list, setList] = useState([])
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(0)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchMoreData()
    }, [])

    //페이지별 로드
    const fetchMoreData =  async () => {

        setLoading(true)

        let params = { isPaging: true, limit: 10, page: page + 1 } //, producerNo:`${consumerNo-900000000}` }

        const {data} = await getPagedOrderDetailListByConsumerNo(params)
        const newList = list.concat(data.orderDetailList)

        setList(newList)
        setPage(params.page)

        //더이상 로딩 되지 않도록
        if (newList.length >= data.totalCount) {
            setHasMore(false)
        }else{
            setHasMore(true)
        }

        setLoading(false)
    }

    return (
        <>
            <ListBorder>
                {
                    list.map(order =>
                        <OrderGoodsCard key={order.orderSeq} {...order} onClick={onChange.bind(this, order)}/>
                    )
                }
            </ListBorder>
            {
                hasMore &&
                <Div p={16} bg={'background'}>
                    <Button noHover bg={'white'} bc={'light'} height={55} fontSize={17} block onClick={fetchMoreData} disabled={loading}>
                        {loading ? '...' : '더보기'}
                    </Button>
                </Div>
            }
        </>
    );
};

export default OrderListContent;
