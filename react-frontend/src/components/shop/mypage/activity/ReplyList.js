import React, { useState, useEffect } from 'react'
import {Div, Span, Flex, GridColumns, Button} from "~/styledComponents/shared";
import {ShopXButtonNav} from "~/components/common";
import ReplyCard from '~/components/common/cards/ReplyCard'
import {getMyReplyList} from '~/lib/shopApi'
import ComUtil from "~/util/ComUtil";
import BackNavigation from "~/components/common/navs/BackNavigation";
import Skeleton from "~/components/common/cards/Skeleton";
import {EmptyBox} from "~/styledComponents/ShopBlyLayouts";
import InfiniteScroll from "react-infinite-scroll-component";
import {Spinner} from "reactstrap";
import {withRouter} from 'react-router-dom'
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";
import queryString from "query-string";
const limit = 10;

const headers = [
    //'talk', 'review', 'vote'
    { value: 'board', label: '토크' },
    { value: 'review', label: '리뷰' },
    { value: 'vote', label: '투표' },
]

const ReplyList = ({location, history}) => {
    const params = queryString.parse(location.search)

    const [replyList, setReplyList] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    // const [menu, setMenu] = useState(params.menu ? params.menu : 'talk')
    const menu = params.menu ? params.menu : 'board'

    // useEffect(() => {
    //
    //     if (history.location.state) {
    //         const {data, hasMore} = history.location.state
    //
    //         setReplyList(data)
    //         setHasMore(hasMore)
    //
    //     }else{
    //         boardSearch()
    //     }
    // }, [])

    useEffect(() => {

        if (history.location.state) {
            const {data, hasMore} = history.location.state

            setReplyList(data)
            setHasMore(hasMore)

        }else{
            setReplyList(null)
            firstSearch()
        }

        //search
    }, [history.location])

    const firstSearch = async () => {

        const {data} = await getMyReplyList({
            tableName: menu,
            lastReplyId: 0,
            limit: limit
        })

        setReplyList(data)

        if (data.length < limit) {
            setHasMore(false)
        }else{
            setHasMore(true)
        }
    }

    const fetchMoreData = async () => {

        let newList = replyList || [];
        let newHasMore = hasMore

        // console.log({})

        const {data} = await getMyReplyList({
            tableName: menu,
            lastReplyId: !replyList ? 0 : replyList[replyList.length -1].replyId,
            limit: limit
        })

        console.log({data})

        if (data.length < limit) {
            setHasMore(false)
            newHasMore = false
        }

        if (data && data.length > 0) {
            newList = newList.concat(data)
            setReplyList(newList);
        }

        const url = ComUtil.makeQueryStringUrl(history.location.pathname,{menu: menu})

        history.replace(url, {data: newList, hasMore: newHasMore})
    }

    // const search = async () => {
    //
    //     const {data} = await getMyReplyList();
    //
    //     ComUtil.sortDate(data, 'replyDate', true);
    //
    //     console.log(data)
    //     setReplyList(data);
    // }

    const onHeaderClick = (value) => {

        // setReplyList(null)
        // setHasMore(true)

        // setMenu(value)
        const url = ComUtil.makeQueryStringUrl(history.location.pathname,{menu: value})

        history.replace(url)
    }


    return (
        <Div pb={40}>
            {/*<ShopXButtonNav historyBack fixed underline>내 댓글</ShopXButtonNav>*/}
            <BackNavigation>내 댓글</BackNavigation>
            <ButtonGroup buttonCount={3}>
                {
                    headers.map(item =>
                        <HeaderButton active={item.value === menu} onClick={onHeaderClick.bind(this, item.value)}>{item.label}</HeaderButton>
                    )
                }
            </ButtonGroup>
            { null == replyList ? (
                <Skeleton.List count={3} />
            ) : (
                replyList.length <= 0 ? (
                    <EmptyBox>댓글 내역이 없습니다.</EmptyBox>
                    // <div className='w-100 h-100 d-flex justify-content-center align-items-center p-5 text-dark'>댓글 내역이 없습니다.</div>
                ) : (

                    <InfiniteScroll
                        scrollableTarget="scrollableDiv"
                        dataLength={replyList.length}
                        next={fetchMoreData}
                        hasMore={hasMore}
                        loader={<Flex p={16} justifyContent={'center'}><Spinner color="success" /></Flex>}
                        // refreshFunction={boardSearch}
                    >
                        {
                            replyList.map(({consumerNo, nickname, title, content, repliesCount, replyDate, replyId, writingId, boardType, replyDeleted }) =>
                                <ReplyCard
                                    key={replyId}
                                    writingId={writingId}
                                    content={content}  //내 댓글
                                    title={title}      //게시물 제목
                                    repliesCount={repliesCount}
                                    writer={nickname}
                                    replyDate={ComUtil.timeFromNow(replyDate)}
                                    boardType={boardType}
                                    deleted={replyDeleted}
                                    // onClick={onRowClick}
                                />
                            )
                        }
                    </InfiniteScroll>
                )
            )
            }
        </Div>
    )
};

export default withRouter(ReplyList);


// function SearchComponent({menu, list}) {
//     const [replyList, setReplyList] = useState(list);
//     const [hasMore, setHasMore] = useState(true);
//
//     useEffect(() => {
//         if (list) {
//             setReplyList(list)
//             setHasMore(hasMore)
//
//         }else{
//             boardSearch()
//         }
//
//     }, [menu])
//
//     return(
//         <>
//
//         </>
//     )
// }

function ButtonGroup({children}) {
    return(
        <Div p={16}>
            <Flex
                cursor={1}
                bg={'white'} bc={'light'}  rounded={3} overflow={'hidden'} custom={`                    
                    & > div{
                        border-right: 1px solid ${color.light};                                                
                    }
                    & > div:last-child{
                        border: 0;
                    }
                `}
            >
                {children}
            </Flex>
        </Div>


    )
}

function HeaderButton({children, active, onClick}) {
    return(
        <Div flexGrow={1} py={10} textAlign={'center'} cursor={1}
            // bc={'light'}
             bg={active && 'green'} fg={active && 'white'}
             custom={`
                transition: 0.2s;
             `}
             onClick={onClick}
        >{children}</Div>
    )
}