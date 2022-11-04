import React, {useEffect, useState, useCallback} from 'react';
import {getLoungeTop10} from '~/lib/shopApi'
import FeedCard from "~/components/common/cards/FeedCard";
import {FEED_TYPE} from "~/store";
import {Div, Flex} from "~/styledComponents/shared";
import HashTagGroup from "~/components/common/hashTag/HashTagGroup";
import {getHashTagGroupListByVisiblePage} from '~/lib/commonApi'
import Skeleton from "~/components/common/cards/Skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import {withRouter} from 'react-router-dom'
import {Spinner} from "reactstrap";

const limitPage = 10

const FeedList = ({history}) => {

    const [feedList, setFeedList] = useState()
    const [hashTagGroupList, setHashTagGroupList] = useState()
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(1)

    useEffect(() => {

        async function fetch() {
            const res = await Promise.all([searchLoungeList(), searchHashTagGroupList()])
            console.log({res})
            setFeedList(res[0])
            setHashTagGroupList(res[1])

            //최종 로드된 내용을 현재 히스토리 state 에 저장해서, history.goBack() 시 didMount 에서 저장된 history state 를 활용 하도록 한다.
            history.replace(undefined, {data: {list: res[0], groupList: res[1], page: page, hasMore: hasMore}});
        }

        //검수영
        fetch()

        //비검수시:  히스토리 state 값이 없으면
        // if (!history.location.state) {
        //     fetch()
        //     // fetchMoreData(true)
        //     // setRefresh(false)
        // }else{
        //     //히스토리 state에 저장된 값이 있으면 사용
        //     const {data} = history.location.state
        //
        //     setFeedList(data.list)
        //     setHashTagGroupList(data.groupList)
        //     setPage(data.page)
        //     setHasMore(data.hasMore)
        // }





    }, [])


    const searchLoungeList = async (page) => {
        const res = await getLoungeTop10({page: page})
        return res.data
    }

    const searchHashTagGroupList = async () => {
        const res = await getHashTagGroupListByVisiblePage('home')
        return res.data
    }

    const fetchMoreData = async (refresh) => {

        let newList;
        let newHasMore = true;
        const nextPage = refresh ? 1 : page +1

        if (nextPage <= limitPage) {
            const list = await searchLoungeList(nextPage)

            if (list && list.length > 0) {
                newList = refresh ? [].concat(list) : feedList.concat(list)
                // console.log({newList, nextPage})
                setFeedList(newList)
                setPage(nextPage)
            }else{
                newHasMore = false
                // setHasMore(false)
            }

        }else{
            newHasMore = false
            // setHasMore(false)
        }

        setHasMore(newHasMore)

        //최종 로드된 내용을 현재 히스토리 state 에 저장해서, history.goBack() 시 didMount 에서 저장된 history state 를 활용 하도록 한다.
        history.replace(undefined, {data: {list: newList, groupList: hashTagGroupList, page: nextPage, hasMore: newHasMore}});
    }

    if (!feedList || !hashTagGroupList) return <Flex justifyContent={'center'} height={'calc(100vh - 56px - 56px - 52px)'}><Spinner color="success" /></Flex>

    //console.log(feedList) //todo comment
    return (
        <Div p={16}>

            <InfiniteScroll
                dataLength={feedList.length}
                next={fetchMoreData.bind(this, false)}
                hasMore={hasMore}
                loader={<Skeleton.ProductList count={5} />}
                // endMessage={
                //     <p style={{ textAlign: "center" }}>
                //         <b>Yay! You have seen it all</b>
                //     </p>
                // }
                refreshFunction={fetchMoreData.bind(this, true)}
                pullDownToRefresh={true}
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
                    feedList.map((feed, index) =>
                        <div key={`feed${index}`}>
                            <FeedCard {...getFilteredFeedData(feed)} />
                            {
                                (index > 0 && ((index +1) % 3) === 0) && <HashTagGroup.Main hashTagGroup={hashTagGroupList[((index+1) / 3) -1]}/>
                            }
                        </div>
                    )
                }
            </InfiniteScroll>


        </Div>
    );
};

export default withRouter(FeedList);

function getFilteredFeedData({type, board, goodsReview}) {
    if (type === FEED_TYPE.PRODUCER || type === FEED_TYPE.BOARD) {
        return {
            uniqueKey: board.writingId, //writingId, orderSeq
            type: type, //board, , goodsReview,
            images: board.images,
            myLike: board.myLike,
            likesCount: board.likesCount,
            repliesCount: board.repliesCount,
            content: board.content,
            tags:  board.tags,
            date: board.writeDate,
            profileInfo: board.profileInfo,
            maxLength: 60,
            boardType: board.boardType,
            stepIndex: board.stepIndex,
            consumerNo: board.consumerNo
        }
    }else if (type === FEED_TYPE.GOODS_REVIEW) {
        return {
            uniqueKey: goodsReview.orderSeq, //writingId, orderSeq
            type: type, //board, , goodsReview,
            images: goodsReview.goodsReviewImages,
            myLike: goodsReview.myLike,
            likesCount: goodsReview.likesCount,
            repliesCount: goodsReview.repliesCount,
            content: goodsReview.goodsReviewContent,
            tags:  goodsReview.tags,
            date: goodsReview.goodsReviewDate,
            profileInfo: goodsReview.profileInfo,
            bestReview: goodsReview.bestReview,
            maxLength: 60,
        }
    }
}