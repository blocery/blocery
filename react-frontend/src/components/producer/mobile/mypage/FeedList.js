import React, { useState, useEffect } from 'react'
import {Div, Span, Flex, Fixed} from "~/styledComponents/shared";

import BoardList from "~/components/common/lists/BoardList";
import { getMyBoardList } from '~/lib/shopApi'
import BackNavigation from "~/components/common/navs/BackNavigation";
import {useHistory} from "react-router-dom";
import BoardWriteButton from "~/components/common/buttons/BoardWriteButton";
import {EmptyBox} from "~/styledComponents/ShopBlyLayouts";

const FeedList = () => {
    const [boardList, setBoardList] = useState([])

    useEffect(() => {
        search();
    }, [])

    const search = async () => {

        //const {data} = await getMyBoardList({boardType:'producer'});
        const {data} = await getMyBoardList({boardType:'all'});

        //console.log(data);
        setBoardList(data.boards);
    }

    //하단 고정 버튼용
    const history = useHistory()
    const onWritingClick = () => {
        history.push(`/mypage/producer/feed`)
    }
    const goTop = () => {
        window.scrollTo(0,0)
    }

    return (
        <Div>
            {/*<ShopXButtonNav historyBack fixed underline>내 게시글</ShopXButtonNav>*/}
            <BackNavigation>피드목록</BackNavigation>

            {(boardList.length <= 0) ?
                <EmptyBox>조회 내역이 없습니다.</EmptyBox>
                :
                <BoardList data={boardList} isFeed={true}/>
            }

            <BoardWriteButton  onClick={onWritingClick}/>
            {/*<Fixed bottom={0} width={'100%'}>*/}
            {/*    <Flex cursor={1} bg={'dark'} fg={'white'}>*/}
            {/*        <Flex width={'50%'} height={40} justifyContent={'center'} bc={'light'} bt={0} bl={0} bb={0} onClick={onWritingClick}>글쓰기</Flex>*/}
            {/*        <Flex width={'50%'} height={40} justifyContent={'center'} textAlign={'center'} onClick={goTop}>맨위로</Flex>*/}
            {/*    </Flex>*/}
            {/*</Fixed>*/}

        </Div>
    )

}

export default FeedList;