import React, {useEffect, useState, useMemo, useCallback} from 'react';
import {getBoardVoteList} from '~/lib/shopApi'
import {withRouter} from 'react-router-dom'
import Skeleton from "~/components/common/cards/Skeleton";
import {Div} from "~/styledComponents/shared";
import InfiniteScroll from "react-infinite-scroll-component";
import GoodsReviewCard from "~/components/common/cards/GoodsReviewCard";
import ComUtil from "~/util/ComUtil";
import VoteCard from "~/components/common/cards/VoteCard";
import {Server} from "~/components/Properties";
import BackNavigation from "~/components/common/navs/BackNavigation"
const imageUrl = Server.getImageURL()


const BoardVoteMain = ({history}) => {

    const [boardVoteList, setBoardVoteList] = useState()
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(0)

    useEffect(() => {
        //히스토리에 저장된 값이 있다면 우선시 한다
        if (history.location.state) {
            const {data, page} = history.location.state
            setBoardVoteList(data)
            setPage(page)


        }else{
            fetchMoreData(true)
        }
    }, [])

    //페이지별 로드
    const fetchMoreData =  async (isNewSearch) => {

        let params = { isPaging: true, limit: 4 }

        if (isNewSearch) {
            params.page = 1
        }else{
            params.page = page + 1
        }

        const {data} = await getBoardVoteList(params)

        console.log({data})

        const tempList = isNewSearch ? [] : boardVoteList
        const newList = tempList.concat(data.boardVotes)

        setBoardVoteList(newList)
        setPage(params.page)

        //최종 로드된 내용을 현재 히스토리 state 에 저장해서, history.goBack() 시 didMount 에서 저장된 history state 를 활용 하도록 한다.
        history.replace(undefined, {data: newList, page: params.page});

        //더이상 로딩 되지 않도록
        if (newList.length >= data.totalCount) {
            setHasMore(false)
        }else{
            setHasMore(true)
        }
    }

    return (
        <div>
            {/*<ShopXButtonNav historyBack fixed underline rightContent={<CommunitySidebarButton />} >당신의 선택은?</ShopXButtonNav>*/}
            <BackNavigation>당신의 선택은?</BackNavigation>
            {
                !boardVoteList ? <Skeleton.ProductList count={5} /> : (
                    <InfiniteScroll
                        dataLength={boardVoteList.length}
                        next={fetchMoreData.bind(this, false)}
                        hasMore={hasMore}
                        loader={<Skeleton.ProductList count={1} />}
                        // endMessage={
                        //     <p style={{ textAlign: "center" }}>
                        //         <b>Yay! You have seen it all</b>
                        //     </p>
                        // }
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
                            boardVoteList.map((vote, index) =>
                                <VoteCard
                                    key={`boardvote${index}`}
                                    writingId={vote.writingId}
                                    src1={imageUrl + vote.items[0].image.imageUrl}
                                    src2={imageUrl + vote.items[1].image.imageUrl}
                                    alt1={vote.items[0].image.imageNm}
                                    alt2={vote.items[1].image.imageNm}
                                    startDate={ComUtil.intToDateString(vote.startDate)}
                                    endDate={ComUtil.intToDateString(vote.endDate)}
                                    title={vote.title}
                                    runningFlag={vote.runningFlag}
                                />
                            )
                        }
                    </InfiniteScroll>
                )
            }
        </div>
    );
};

export default withRouter(BoardVoteMain);
