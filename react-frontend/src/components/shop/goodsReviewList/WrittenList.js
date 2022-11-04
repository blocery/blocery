import React, { useState, useEffect } from 'react'
import {getGoodsReview} from "~/lib/shopApi";
import Skeleton from "~/components/common/cards/Skeleton";
import {Div, ListSpace} from "~/styledComponents/shared";
import GoodsReviewCard from "~/components/common/cards/GoodsReviewCard";
import {withRouter} from 'react-router-dom'
import {useRecoilState} from "recoil";
import {goodsReviewCountTrigger, refreshState} from "~/recoilState";
import InfiniteScroll from "react-infinite-scroll-component";

const WrittenList = ({history}) => {

    //goodsReviewList.js 에서 카운트를 변경하기 위한 트리거
    const [countTrigger, setCountTrigger] = useRecoilState(goodsReviewCountTrigger)

    const [refresh, setRefresh] = useRecoilState(refreshState)
    const [page,setPage] = useState(0);
    const [hasMore,setHasMore] = useState(false);
    const [list, setList] = useState([])

    useEffect(() => {
        //뒤로 앞으로 버튼을 통해 들어온 경우
        if (history.action === 'REPLACE') {
            fetchMoreData(true)
        }
        // 히스토리 state 값이 없거나, 글쓰기 에서 goBack() 으로 돌아 왔을때 재조회
        else if (refresh || !history.location.state) {
            fetchMoreData(true)
            setRefresh(false)
        }else{
            //히스토리 state에 저장된 값이 있으면 사용
            const {data, page, hasMore} = Object.assign({}, history.location.state)
            setList(data)
            setPage(page)
            setHasMore(hasMore)
        }
    }, [history.location.pathname])


    //const search = () => getGoodsReview().then(res => setList(res.data))

    const search = async () => {
        let addGoodsReviewList = [];
        setList(addGoodsReviewList)
        await fetchMoreData(true);
    }

    const fetchMoreData =  async (isNewSearch) => {
        let params = { page: 1, isPaging: true, limit: 10 }
        if (isNewSearch) {
            params.page = 1
        }else{
            params.page = page + 1
        }
        const {data} = await getGoodsReview(params);
        console.log(data);
        const tempList = isNewSearch ? [] : list;
        let dataGoodsReviewList = data.goodsReviews;

        // 기존행 + 신규행
        let newList = tempList.concat(dataGoodsReviewList)

        //더이상 로딩 되지 않도록
        let hasMore = true;
        if (newList.length >= data.totalCount) {
            hasMore = false;
        }
        setList(newList);
        setPage(params.page);
        setHasMore(hasMore);

        //최종 로드된 내용을 현재 히스토리 state 에 저장해서, history.goBack() 시 didMount 에서 저장된 history state 를 활용 하도록 한다.
        history.replace(undefined, {data: newList, page: params.page, hasMore: hasMore});
    }

    const onEditClick = ({orderSeq, goodsNo}, e) => {
        e.stopPropagation()
        history.push(`/goodsReview?action=U&orderSeq=${orderSeq}&goodsNo=${goodsNo}`)
    }
    // const onDeleteClick = async (orderSeq, e) => {
    //     e.stopPropagation()
    //     if (!window.confirm('구매확정일 기준 30일이 초과 하였을 경우 재작성 할 수 없습니다. 삭제 하시겠습니까?')) {
    //         return
    //     }
    //     await delGoodsReview(orderSeq)
    //     search()
    //
    //     //goodsReviewList.js 에서 카운트를 변경하기 위한 트리거
    //     setCountTrigger(Date.now())
    // }

    if (!list) return <Skeleton.ProductList count={3} />

    return list.length <= 0 ? null :
        <ListSpace>
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
            {
                list.map(goodsReview =>
                    <Div key={`goodsReview${goodsReview.orderSeq}`} bc={'light'} bt={0} bl={0} br={0}>
                        <GoodsReviewCard
                            data={goodsReview}
                            showGoodsNm
                            showDate
                            showLikesCount
                            showEdit
                            onEditClick={onEditClick.bind(this, goodsReview)}
                            // onDeleteClick={onDeleteClick.bind(this, goodsReview.orderSeq)}
                        />
                    </Div>
                )
            }
            </InfiniteScroll>
        </ListSpace>
};

export default withRouter(WrittenList);
