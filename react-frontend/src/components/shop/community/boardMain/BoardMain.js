import React, {useEffect, useState, useRef} from 'react';
import {getBoardNewestList, getBoardList} from '~lib/shopApi';

import {Div, Flex} from "~/styledComponents/shared";
import Skeleton from "~/components/common/cards/Skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import VoteCard from "~/components/common/cards/VoteCard";
import ComUtil from "~/util/ComUtil";
import {withRouter} from 'react-router-dom'
import BoardCard from "~/components/common/cards/BoardCard";
import {useRecoilState} from "recoil";
import {communitySidebarState, refreshState} from "~/recoilState";
import {Server} from "~/components/Properties";
import BoardList from "~/components/common/lists/BoardList";
import _ from 'lodash'
import {Spinner} from "reactstrap";

const BoardMain = ({boardType, history}) => {
    //console.log(boardType)

    // const [sidebarOpen, setSidebarOpen] = useRecoilState(communitySidebarState)

    const abortControllerRef = useRef(new AbortController())

    const [refresh, setRefresh] = useRecoilState(refreshState)
    const [boardList, setBoardList] = useState()
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(0)
    let dupCount = useRef(0); // ajax 호출 후 중복된 카운트

    useEffect(() => {
        return(() => {
            abortControllerRef.current.abort()
        })
    }, [])

    useEffect(() => {
        async function fetch() {

            try {
                //뒤로 앞으로 버튼을 통해 들어온 경우
                if (history.action === 'REPLACE') {
                    await fetchMoreData(true)
                    console.log("REPLACE")
                }
                // 히스토리 state 값이 없거나, 글쓰기 에서 goBack() 으로 돌아 왔을때 재조회
                else if (refresh || !history.location.state) {
                    await fetchMoreData(true)
                    setRefresh(false)
                }else{
                    //히스토리 state에 저장된 값이 있으면 사용
                    const {data, page, hasMore} = Object.assign({}, history.location.state)
                    setBoardList(data)
                    setPage(page)
                    setHasMore(hasMore)
                }
            }catch (error) {
                console.log("BoardMain fetch canceled")
            }
        }

        fetch();

    }, [boardType])

    //페이지별 로드
    const fetchMoreData =  async (isNewSearch) => {

        try {
            console.log("boardType===",boardType)
            let params = {boardType, isPaging: true, limit: 15, signal: abortControllerRef.current.signal }

            //새로고침(처음부터 조회)
            if (isNewSearch) {
                dupCount.current = 0 //중복된 카운트 클리어
                params.page = 1
            }else{
                params.page = page + 1
            }

            //boardType 이 있으면 해당 게시판만, 없으면 전체 게시판()에서
            let {data} = boardType==='all' ?  await getBoardNewestList(params) : await getBoardList(params)
            //console.log({data})
            const tempList = isNewSearch ? [] : boardList

            // 기존행 + 신규행
            let newList = tempList.concat(data.boards)
            // 카운트(중복행 포함)
            const concatCount = newList.length

            // 중복 행 제거
            newList = _.uniqBy(newList, 'writingId')
            // 카운트(중복행 제거)
            const mergedCount = newList.length

            // 중복된 행의 개수 업데이트
            dupCount.current = dupCount.current + concatCount - mergedCount

            setBoardList(newList)
            setPage(params.page)

            const newHasMore = (mergedCount + dupCount.current) === data.totalCount ? false : true

            //최종 로드된 내용을 현재 히스토리 state 에 저장해서, history.goBack() 시 didMount 에서 저장된 history state 를 활용 하도록 한다.
            history.replace(undefined, {data: newList, page: params.page, hasMore: newHasMore});

            setHasMore(newHasMore)

            //더이상 로딩 되지 않도록

            // if (newList.length >= data.totalCount) {
            //     setHasMore(false)
            // }else{
            //     setHasMore(true)
            // }
        }catch (error){
            console.log("BoardMain fetchMoreData canceled")
        }
    }

    return (
        <div>
            {
                !boardList ? <Skeleton.ProductList count={5} /> : (
                    <InfiniteScroll
                        dataLength={boardList.length}
                        next={fetchMoreData.bind(this, false)}
                        hasMore={hasMore}
                        loader={<Flex p={16} justifyContent={'center'}><Spinner color="success" /></Flex>}
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

                        <BoardList data={boardList} />


                    </InfiniteScroll>
                )
            }
        </div>
    );
};

export default withRouter(BoardMain);
