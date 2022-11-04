import React, { useState, useEffect } from 'react'
import {Div, Span, Button, Flex} from "~/styledComponents/shared";
import { withRouter} from 'react-router-dom'

import {getProducerGoods} from '~/lib/producerApi'
import BackNavigation from "~/components/common/navs/BackNavigation";
import ComUtil from "~/util/ComUtil";
import ProducerGoodsCard from "~/components/producer/mobile/common/ProducerGoodsCard";
import Skeleton from "~/components/common/cards/Skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import {EmptyBox} from "~/styledComponents/ShopBlyLayouts";

//private
const ProducerGoodsList = ({data, refreshCallback}) => {
    if (data.length <= 0) {
        return <EmptyBox>조회 내역이 없습니다.</EmptyBox>
        // <Div textAlign={'center'} p={16}>조회 내역이 없습니다.</Div>
    }

    return data.map(goods => {
            return(
                <ProducerGoodsCard
                    key = {goods.goodsNo}
                    goods = {goods}
                />
            )
        }

    )
};

const GoodsList = () => {
    const [goodsList, setGoodsList] = useState([])
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(0)
    const [filter, setFilter] = useState('onSale');

    useEffect(() => {
        fetchMoreData(true);
    }, [filter])

    const fetchMoreData = async (isNewSearch) => {

        let params = { isPaging: true, limit: 20, filter: filter }

        if (isNewSearch) {
            params.page = 1
        }else{
            params.page = page + 1
        }
        const {data} = await getProducerGoods(params);
        //console.log(data);

        const tempList = isNewSearch ? [] : goodsList
        const newList = tempList.concat(data.goodsList)

        setGoodsList(newList)
        setPage(params.page)

        //더이상 로딩 되지 않도록
        if (newList.length >= data.totalCount) {
            setHasMore(false)
        }else{
            setHasMore(true)
        }
    }

    const onStateChange = (e) => {
        if (e.target.value === '0') {           // 전체
            setFilter('all');
        }  else if (e.target.value === '1') {    // 판매중
            setFilter('onSale');
        }  else if (e.target.value === '2') {    // 미판매
            setFilter('notSale');
        }
        //fetchMoreData(true); => useEffect([filter])자동호출
    }

    // const clickSearch = () => {
    //     console.log("clickSearch");
    //     fetchMoreData(true);
    // }

    return (
        <Div>
            {/*<ShopXButtonNav historyBack fixed underline>내 게시글</ShopXButtonNav>*/}
            <BackNavigation showShopRightIcons>상품목록</BackNavigation>
            <Flex className='pt-4 pb-2 pl-3'>
                {/*<Span className='textBoldLarge f3'>상품상태 </Span>*/}
                <Span className='pl-1'>
                    <input defaultChecked type="radio" id="state1" name="state" onChange={onStateChange} value={'1'}/>
                    <label htmlFor="state1" className='pl-1 mr-3 mb-0'>판매중</label>

                    <input type="radio" id="state2" name="state" onChange={onStateChange} value={'2'}/>
                    <label htmlFor="state2" className='pl-1 mr-3 mb-0'>미판매</label>
                    <input type="radio" id="stateAll" name="state" onChange={onStateChange} value={'0'} />
                    <label htmlFor="stateAll" className='pl-1 mr-3 mb-0'>전체</label>
                </Span>
                {/*<Button bg={'green'} fg={'white'} size='sm' onClick={clickSearch}>검색</Button>*/}
            </Flex>
            <Div>
                {
                    !goodsList ? <Skeleton.List count={4}/> :
                        (goodsList.length === 0) ?
                            <Div textAlign={'center'} p={16}>조회 내역이 없습니다.</Div> :
                            <InfiniteScroll
                                dataLength={goodsList.length}
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
                                <ProducerGoodsList data={goodsList}/>
                            </InfiniteScroll>
                }
            </Div>
        </Div>
    )

}


export default withRouter(GoodsList);