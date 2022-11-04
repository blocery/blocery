import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {Button, Div, Divider, Flex, Link, Sticky} from "~/styledComponents/shared";
import {NavLink, Route, Switch, useParams} from 'react-router-dom'
import {useHistory} from 'react-router-dom'

import BOARD_STORE from "~/components/shop/community/BoardStore";
import useLogin from "~/hooks/useLogin";
import BoardMain from "~/components/shop/community/boardMain/BoardMain";
import BoardWriteButton from "~/components/common/buttons/BoardWriteButton";
import {getValue} from "~/styledComponents/Util";
import CommunitySidebarButton from "~/components/shop/community/CommunitySidebarButton";
import BackNavigation from "~/components/common/navs/BackNavigation";

//const store = Object.values(BOARD_STORE).filter(board => board.boardType !== 'producer').map(board => ({
const store = Object.values(BOARD_STORE).map(board => ({
    boardType: board.boardType,
    url: '/community/boardMain/'+board.boardType,
    name: board.name
}))

const RightContent = () => {
    return (
        <CommunitySidebarButton px={16} absolute top={0} right={0} height={'100%'} bg={'#00ff0000'} />
    )
}

const Item = ({to, name}) =>
    <Link to={to} fg={'dark'}>
        <b>#{name}</b>
    </Link>




const Community = (props) => {

    const {boardType} = useParams()
    const history = useHistory()
    const {consumer} = useLogin()
    const [tabId, setTabId] = useState(boardType)

    const tabRef = useRef([])

    const onLinkClick = () => {
        history.replace('/community')
    }

    useEffect(() => {
        setTabId(boardType)
    }, [boardType])

    useLayoutEffect(() => {
        setScrollTo(tabId)
        window.scrollTo({y:0});
    }, [tabId])

    const onTabClick = (boardType) => {
        console.log("onTabClick",boardType)
        setTabId(boardType)
        history.replace('/community/boardMain/'+boardType)
    }


    const onWritingClick = () => {
        if (consumer && consumer.producerFlag)
            history.push(`/mypage/producer/feed`)
        else
            history.push(`/community/board/writing/free`) //기본 자유게시판으로 연결.
    }

    const setScrollTo = (tabId) => {
        const selectedIndex = store.findIndex(item => item.boardType === tabId)
        tabRef.current[selectedIndex].scrollIntoView({block: 'center', inline: 'center'})
    }

    return (
        <Div>
            {/* 탭 START */}
            <BackNavigation rightContent={<RightContent/>}>
                토크
            </BackNavigation>
            <Sticky top={56} zIndex={3}>
                <Div relative>
                    <Flex overflow={'auto'} minHeight={60} bg={'white'}

                          custom={`
                        & > * {
                            flex-shrink: 0;
                            padding-left: 8px;
                            padding-right: 8px;
                            // margin-right: 16px;                        
                            font-size: ${getValue(14)};
                        }
                        // & > *:first-child {
                        //     margin-left: 16px;
                        // }
                        & > *:last-child {
                            padding-right: calc(61px + 16px);
                        }
                    `}
                    >
                        {//생산자로그인이면, 생산자 게시판 노출
                            //   consumer && consumer.producerFlag &&
                            //   <Item to={'/community/boardMain/producer'} name={'생산자'} />
                        }

                        <div>

                            { //항상 생산자게시판 노출 버전.
                                store.map( (board,i) => {
                                    return (
                                        <Button ref={el => tabRef.current[i] = el} bg={tabId===board.boardType && 'green'} fg={tabId===board.boardType ? 'white' : 'dark'}
                                                px={10} rounded={25} fontSize={14} onClick={onTabClick.bind(this, board.boardType)}>#{board.name}</Button>
                                    )
                                })
                            }
                        </div>

                    </Flex>

                    {/*<CommunitySidebarButton px={16} absolute top={0} right={0} height={'100%'} bg={'rgba(255, 255, 255, 0.8)'}/>*/}
                </Div>
            </Sticky>

            {/* 탭 END */}

            <Divider />
            <BoardMain boardType={tabId} />

            <BoardWriteButton onClick={onWritingClick}/>

        </Div>
    );
};

export default Community;
