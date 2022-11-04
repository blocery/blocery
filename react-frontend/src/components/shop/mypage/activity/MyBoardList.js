import React, { useState, useEffect } from 'react'
import {Div, Span, Flex, Fixed} from "~/styledComponents/shared";
// import {ShopXButtonNav} from "~/components/common";
import BoardList from "~/components/common/lists/BoardList";
import {getBoardListByConsumerNo, getMyBoardList} from '~/lib/shopApi'
import BackNavigation from "~/components/common/navs/BackNavigation";
import Skeleton from "~/components/common/cards/Skeleton";
import {useHistory} from "react-router-dom";
import BoardWriteButton from "~/components/common/buttons/BoardWriteButton";
import {EmptyBox} from "~/styledComponents/ShopBlyLayouts";
import InfiniteScroll from "react-infinite-scroll-component";
import {useRecoilState} from "recoil";
import {refreshState} from "~/recoilState";
import {Spinner} from "reactstrap";
import ComUtil from "~/util/ComUtil";

const MyBoardList = (props) => {

    const params = ComUtil.getParams(props);
    const consumerNo = params.consumerNo;

    //하단 고정 버튼용
    const history = useHistory()
    const [boardList, setBoardList] = useState(null)
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)

    const [refresh, setRefresh] = useRecoilState(refreshState)


    useEffect(() => {

        console.log(history.location.state)

        //뒤로 앞으로 버튼을 통해 들어온 경우
        if (history.action === 'REPLACE') {
            console.log('replace')
            fetchMoreData(true)
        }

        // 히스토리 state 값이 없거나, 글쓰기 에서 goBack() 으로 돌아 왔을때 재조회
        else if (refresh || !history.location.state) {
            console.log('글쓰기')
            fetchMoreData(true)
            setRefresh(false)
        }else{
            console.log('저장된값있음')
            //히스토리 state에 저장된 값이 있으면 사용
            const {data, page, hasMore} = Object.assign({}, history.location.state)
            setBoardList(data)
            setPage(page)
            setHasMore(hasMore)
        }
    }, [history.location.pathname])


    const fetchMoreData = async (isNewSearch) => {

        let params = {boardType: 'all', isPaging: true, limit: 15 }

        //새로고침(처음부터 조회)
        if (isNewSearch) {
            params.page = 1
        }else{
            params.page = page + 1
        }

        if (consumerNo) {
            params.consumerNo = consumerNo
        }

        const {data} = consumerNo ? await getBoardListByConsumerNo(params) : await getMyBoardList(params);

        const list = data.boards
        const totalCount = data.totalCount
        const tempList = isNewSearch ? [] : boardList

        let newList = tempList.concat(list)

        const newHasMore = newList.length === totalCount ? false : true

        //리스트 추가
        setBoardList(newList);

        const newPage = list.length ? params.page : page

        //페이지 기록
        setPage(newPage)

        //조회된 총 카운트와 전체 카운트가 맞으면
        if (newList.length >= totalCount) {
            setHasMore(newHasMore)
        }

        //최종 로드된 내용을 현재 히스토리 state 에 저장해서, history.goBack() 시 didMount 에서 저장된 history state 를 활용 하도록 한다.
        if (consumerNo) {
            //소비자 번호가 있을때는 url(consumerNo=xx) + 데이터 기억
            const url = ComUtil.makeQueryStringUrl(props.history.location.pathname, {consumerNo: consumerNo})
            props.history.replace(url, {data: newList, page: newPage, hasMore: newHasMore})
        }else{
            //없을때는 기 조회된 데이터만 기록
            history.replace(undefined, {data: newList, page: newPage, hasMore: newHasMore});
        }
    }

    const onWritingClick = () => {
        history.push(`/community/board/writing/free`)
    }
    const goTop = () => {
        window.scrollTo(0,0)
    }


    return (
        <div>
            <BackNavigation>{consumerNo ? '게시글': '내 게시글'}</BackNavigation>
            {
                !boardList ? <Skeleton.ProductList count={5} />  : (
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
            {
                (boardList && boardList.length <= 0) && (
                    <EmptyBox>등록된 게시글이 없습니다.</EmptyBox>
                )
            }

            {/*{ null == boardList ?*/}
            {/*    (*/}
            {/*        <Skeleton.List count={3}/>*/}
            {/*    ) : (*/}
            {/*        boardList.length <= 0 ? (*/}
            {/*                <EmptyBox>게시글이 없습니다.</EmptyBox>*/}
            {/*                // <div className='w-100 h-100 d-flex justify-content-center align-items-center p-5 text-dark'>게시글이 없습니다.</div>*/}
            {/*            )*/}
            {/*            : (<BoardList data={boardList}/>)*/}
            {/*    )*/}
            {/*}*/}

            <BoardWriteButton  onClick={onWritingClick}/>
            {/*<Fixed bottom={0} width={'100%'}>*/}
            {/*    <Flex cursor={1} bg={'dark'} fg={'white'}>*/}
            {/*        <Flex width={'50%'} height={40} justifyContent={'center'} bc={'light'} bt={0} bl={0} bb={0} onClick={onWritingClick}>글쓰기</Flex>*/}
            {/*        <Flex width={'50%'} height={40} justifyContent={'center'} textAlign={'center'} onClick={goTop}>맨위로</Flex>*/}
            {/*    </Flex>*/}
            {/*</Fixed>*/}

        </div>
    )

}

export default MyBoardList;