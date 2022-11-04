import React, { useState, useEffect, Fragment } from 'react'
import {Div, Span, Flex} from "~/styledComponents/shared";
import { withRouter} from 'react-router-dom'

import {getOrderCancelList, getProducerGoods, setLastSeenOrderCancel} from '~/lib/producerApi'

import BackNavigation from "~/components/common/navs/BackNavigation";
import ComUtil from "~/util/ComUtil";
import ProducerOrderCard from "~/components/producer/mobile/common/ProducerOrderCard";
import Skeleton from "~/components/common/cards/Skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import {EmptyBox} from "~/styledComponents/ShopBlyLayouts";
import SubGroupLabel from "~/components/producer/mobile/common/SubGroupLabel";

//private
const ProducerCancelList = ({data}) => {
    if (data.length <= 0) {
        return <EmptyBox>조회 내역이 없습니다.</EmptyBox>
        // <Div textAlign={'center'} p={16}>조회 내역이 없습니다.</Div>
    }

    return data.map((orderDetail, index, orderDetailList) => {
            return(
                <Fragment key = {orderDetail.orderSeq}>
                    {
                        ComUtil.isNewGroup('orderSubGroupNo', orderDetail, index, orderDetailList) &&
                        <SubGroupLabel orderSubGroupNo={orderDetail.orderSubGroupNo} />
                    }
                    <ProducerOrderCard
                        orderDetail = {orderDetail}
                        cancelList = {true}
                    />
                </Fragment>
            )
        }

    )
};

const CancelList = () => {
    const [list, setList] = useState([])
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(0)

    useEffect(() => {
        fetch();
    }, [])

    const fetch = async () => {

        fetchMoreData(true);
        setLastSeenOrderCancel();
    }

    const fetchMoreData = async (isNewSearch) => {

        let params = { isPaging: true, limit: 10}

        if (isNewSearch) {
            params.page = 1
        }else{
            params.page = page + 1
        }

        const {data} = await getOrderCancelList(params); //by producerNo
        console.log(data);

        const tempList = isNewSearch ? [] : list
        const newList = tempList.concat(data.orderDetailList)

        setList(newList)
        setPage(params.page)

        //더이상 로딩 되지 않도록
        if (newList.length >= data.totalCount) {
            setHasMore(false)
        }else{
            setHasMore(true)
        }
    }


    return (
        <Div pb={200}>
            {/*<ShopXButtonNav historyBack fixed underline>내 게시글</ShopXButtonNav>*/}
            <BackNavigation>주문취소목록</BackNavigation>
            <div>
                {
                    !list ? <Skeleton.List count={4}/> :
                        (list.length === 0) ?
                            <Div textAlign={'center'} p={16}>조회 내역이 없습니다.</Div> :
                            <InfiniteScroll
                                dataLength={list.length}
                                next={fetchMoreData.bind(this, false)}
                                hasMore={hasMore}
                                loader={<Skeleton.List count={1} />}
                                refreshFunction={fetchMoreData.bind(this, true)}
                                pullDownToRefresh
                                pullDownToRefreshThreshold={100}
                                pullDownToRefreshContent={
                                    <Div textAlign={'center'} fg={'green'}>
                                        &#8595; 아래로 당겨서 업데이트
                                    </Div>
                                }
                                releaseToRefreshContent={
                                    <Div textAlign={'center'} fg={'green'}>
                                        &#8593; 업데이트 반영
                                    </Div>
                                }
                            >
                                <ProducerCancelList data={list}/>
                            </InfiniteScroll>
                }
            </div>
        </Div>
    )

}


export default withRouter(CancelList);