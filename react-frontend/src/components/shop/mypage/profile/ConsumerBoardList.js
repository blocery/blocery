import React, {useEffect, useState} from 'react';
import Skeleton from "~/components/common/cards/Skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import {Div, Flex} from "~/styledComponents/shared";
import BoardList from "~/components/common/lists/BoardList";
import {getBoardListByConsumerNo} from "~/lib/shopApi";
import ComUtil from "~/util/ComUtil";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {Spinner} from "reactstrap";

//더이상 사용안함 => MyBoardList.js 로 교체됨
const ConsumerBoardList = (props) => {
    const params = ComUtil.getParams(props);
    const consumerNo = params.consumerNo;
    const [boardList, setBoardList] = useState()
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(0)

    useEffect(() => {
        fetchMoreData(true, consumerNo)
    }, [])

    const fetchMoreData =  async (isNewSearch, consumerNo) => {
        let params = { consumerNo:consumerNo, boardType:'all', isPaging: true, limit: 15 }

        if (isNewSearch) {
            params.page = 1
        }else{
            params.page = page + 1
        }
        const {data} = await getBoardListByConsumerNo(params);
        console.log(data);

        const tempList = isNewSearch ? [] : boardList
        const newList = tempList.concat(data.boards)

        setBoardList(newList)
        setPage(params.page)

        //더이상 로딩 되지 않도록
        if (newList.length >= data.totalCount) {
            setHasMore(false)
        }else{
            setHasMore(true)
        }
    }

    return (
        <Div>
            <BackNavigation>게시글</BackNavigation>
            <Div>
                {
                    (boardList && boardList.length <= 0) && (
                        <Flex minHeight={110} justifyContent={'center'} fg={'secondary'}>등록된 게시글이 없습니다.</Flex>
                    )
                }
                {
                    !boardList ? <Skeleton.ProductList count={5} /> : (
                        <InfiniteScroll
                            dataLength={boardList.length}
                            next={fetchMoreData.bind(this, false, consumerNo)}
                            hasMore={hasMore}
                            loader={<Flex p={16} justifyContent={'center'}><Spinner color="success" /></Flex>}
                            refreshFunction={fetchMoreData.bind(this, true, consumerNo)}
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
                            <BoardList data={boardList} />
                        </InfiniteScroll>
                    )
                }
            </Div>
        </Div>

    )
}

export default ConsumerBoardList;