import React, {useEffect, useState, useMemo, useCallback, useRef} from 'react';
import {Div, Flex, ListSpace} from "~/styledComponents/shared";
import GoodsReviewCard from "~/components/common/cards/GoodsReviewCard";
import {getGoodsScore, getGoodsReviewByGoodsNo} from '~/lib/shopApi'
import Checkbox from "~/components/common/checkboxes/Checkbox";
import InfiniteScroll from "react-infinite-scroll-component";
import Skeleton from "~/components/common/cards/Skeleton";
import {withRouter, useParams} from 'react-router-dom'
import _ from "lodash";
import BackNavigation from "~/components/common/navs/BackNavigation";
import GoodsScore from "~/components/common/cards/GoodsScore";
import {getGoodsByGoodsNo} from "~/lib/goodsApi";

const GoodsReviewListByGoodsNo = withRouter(({history}) => {

    let { goodsNo } = useParams();

    const [goods, setGoods] = useState()

    const [photoChecked, setPhotoChecked] = useState(false)

    const [goodsReviewList, setGoodsReviewList] = useState(null)
    //const [loading, setLoading] = useState(true)
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(0)

    let dupCount = useRef(0); // ajax 호출 후 중복된 카운트

    const onCheckboxChange = useCallback(



        ({target}) => {
            const {name, checked} = target
            setPhotoChecked(checked)

            //다시 조회하기 위해 초기화
            setGoodsReviewList(null)
            setPage(0)
            setHasMore(true)

            //백엔드 처음부터 다시 조회
            fetchMoreData(true, checked)
        },
        [],
    );
    // ({target}) => {
    //     const {name, checked} = target
    //     setPhotoChecked(checked)
    //
    //     //다시 조회하기 위해 초기화
    //     setGoodsReviewList(null)
    //     setPage(0)
    //     setHasMore(true)
    //
    //     //백엔드 처음부터 다시 조회
    //     fetchMoreData(true, checked)
    // }



    useEffect(() => {
        //히스토리에 저장된 값이 있다면 우선시 한다
        if (history.location.state) {

            const {photoChecked, data, page} = history.location.state

            setPhotoChecked(photoChecked)
            setGoodsReviewList(data)
            setPage(page)

        }else{
            fetchMoreData(true, photoChecked)
        }

        //스코어 조회
        searchGoods()

    }, [])



    //스코어 조회
    const searchGoods = async () => {
        // const {data} = await getGoodsScore(goodsNo)
        const {data} = await getGoodsByGoodsNo(goodsNo)
        console.log({goods: data})
        setGoods(data)
    }

    //페이지별 로드
    const fetchMoreData =  async (isNewSearch, photoChecked) => {

        let params = { goodsNo: goodsNo, onlyPhotoReview: photoChecked, isPaging: true, limit: 5 }

        //새로고침(처음부터 조회)
        if (isNewSearch) {
            dupCount.current = 0 //중복된 카운트 클리어
            params.page = 1
        }else{
            params.page = page + 1
        }

        const {data} = await getGoodsReviewByGoodsNo(params.goodsNo, params.isPaging, params.limit, params.page)
        console.log({data})
        const tempList = isNewSearch ? [] : goodsReviewList

        // 기존행 + 신규행
        let newList = tempList.concat(data.goodsReviews)
        // 카운트(중복행 포함)
        const concatCount = newList.length

        // 중복 행 제거
        newList = _.uniqBy(newList, 'orderSeq')
        // 카운트(중복행 제거)
        const mergedCount = newList.length

        // 중복된 행의 개수 업데이트
        dupCount.current = dupCount.current + concatCount - mergedCount


        setGoodsReviewList(newList)
        setPage(params.page)

        const newHasMore = (mergedCount + dupCount.current) === data.totalCount ? false : true

        //최종 로드된 내용을 현재 히스토리 state 에 저장해서, history.goBack() 시 didMount 에서 저장된 history state 를 활용 하도록 한다.
        history.replace(undefined, {data: newList, page: params.page, hasMore: newHasMore, photoChecked: params.onlyPhotoReview});

        setHasMore(newHasMore)

        //더이상 로딩 되지 않도록
        // if (newList.length >= data.totalCount) {
        //     setHasMore(false)
        // }else{
        //     setHasMore(true)
        // }
    }



    return (
        <Div>
            {/*<ShopXButtonNav historyBack fixed underline rightContent={<CommunitySidebarButton />} >실시간 리뷰</ShopXButtonNav>*/}
            <BackNavigation showShopRightIcons>상품 리뷰</BackNavigation>
            {
                goods && <GoodsScore avgScore={goods.avgScore} scoreRates={goods.scoreRates} />
            }
            <Flex bc={'light'} bt={0} bl={0} br={0} bg={'veryLight'} px={16} py={12}>
                <Div>
                    <Checkbox bg={'green'} checked={photoChecked} onChange={onCheckboxChange}>포토 리뷰만 보기</Checkbox>
                </Div>
                <Flex ml={'auto'}>
                    {/*<Div>유용한순</Div>*/}
                    {/*<Div mx={3}>|</Div>*/}
                    {/*<Div>최신순</Div>*/}
                </Flex>
            </Flex>
            {
                !goodsReviewList ? <Skeleton.ProductList count={5} /> : (
                    <InfiniteScroll
                        dataLength={goodsReviewList.length}
                        next={fetchMoreData.bind(this, false, photoChecked)}
                        hasMore={hasMore}
                        loader={<Skeleton.ProductList count={1} />}
                        // endMessage={
                        //     <p style={{ textAlign: "center" }}>
                        //         <b>Yay! You have seen it all</b>
                        //     </p>
                        // }
                        refreshFunction={fetchMoreData.bind(this, true, photoChecked)}
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
                        <ListSpace>
                            {
                                goodsReviewList.map((goodsReview, index) =>
                                    <Div key={`goodsReview${index}`} bc={'light'} bt={0} bl={0} br={0}>
                                        <GoodsReviewCard data={goodsReview} showGoodsNm={false} />
                                    </Div>
                                )
                            }
                        </ListSpace>
                    </InfiniteScroll>
                )
            }
        </Div>
    );
});

export default GoodsReviewListByGoodsNo;