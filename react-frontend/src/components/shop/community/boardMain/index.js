import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom'
import {Div, Link, Flex, Fixed, Space, Right} from '~/styledComponents/shared'
import BoardMain from "~/components/shop/community/boardMain/BoardMain";
import ComUtil from '~/util/ComUtil'
import {Redirect} from 'react-router-dom'

import BOARD_STORE from "~/components/shop/community/BoardStore";
import {withRouter} from 'react-router-dom'
import BackNavigation from '~/components/common/navs/BackNavigation'
import {Button} from "reactstrap";
import {useRecoilState} from "recoil";
import {consumerState} from "~/recoilState";
import BoardWriteButton from "~/components/common/buttons/BoardWriteButton";
import {BsPinAngle} from 'react-icons/bs'
import {BiLeftArrow, BiRightArrow} from 'react-icons/bi'
import {color} from "~/styledComponents/Properties";
import CommunitySidebarButton from "~/components/shop/community/CommunitySidebarButton";


const index = ({history}) => {
    const [consumer] = useRecoilState(consumerState)
    const {boardType} = useParams()

    let boardName = BOARD_STORE[boardType].name // (params && params.boardType) ? (BOARD_NAME[boardType] || BOARD_NAME.free) : BOARD_NAME.free

    // 강제로 자유게시판으로 리다이렉트
    if(!boardName)
        return <Redirect to={'/community/boardMain/free'} />

    const onWritingClick = () => {
        if (boardType==='producer')
            history.push(`/mypage/producer/feed`)
        else
            history.push(`/community/board/writing/${boardType}`)
    }


    return (
        <Div pb={40}>
            {/*<BackNavigation*/}
            {/*    rightContent={*/}
            {/*        <CommunitySidebarButton absolute top={0} right={0} px={16} height={'100%'} bg={'rgba(255, 255, 255, 0.8)'}/>*/}
            {/*    }*/}
            {/*>*/}
            {/*    {boardName}*/}
            {/*</BackNavigation>*/}
            {/*<BackNavigation><BoardHeader boardType={boardType} /></BackNavigation>*/}

            <Space px={16} py={8} fontSize={12} spaceGap={8} bg={'green'} fg={'white'}>
                <BsPinAngle />
                <div>
                    {BOARD_STORE[boardType].desc}
                </div>
            </Space>

            <BoardMain boardType={boardType} />

            { //생산자게시판 아니면 무조건 노출, 생산자게시판이면 생산자로 로그인했을 경우만 노출
                (boardType !== 'producer' || (boardType === 'producer' && consumer && ComUtil.isProducer(consumer.consumerNo)) )  &&
                <BoardWriteButton  onClick={onWritingClick}/>
            }

        </Div>
    );
};

export default withRouter(index);

const BoardHeader = withRouter(({boardType, history}) => {

    let nowIndex = Object.keys(BOARD_STORE).findIndex(key => key === boardType)
    let prevKey = Object.keys(BOARD_STORE)[nowIndex -1]
    let nextKey = Object.keys(BOARD_STORE)[nowIndex +1]

    const movePage = (position) => {
        const __boardType = position === 'prev' ? BOARD_STORE[prevKey].boardType : BOARD_STORE[nextKey].boardType
        history.replace(`/community/boardMain/${__boardType}`)
    }

    return(
        <Flex justifyContent={'center'}>
            {
                ((nowIndex - 1) >= 0) &&
                <Div bg={'white'} doActive px={16} cursor={1} onClick={movePage.bind(this, 'prev')}>
                    <BiLeftArrow size={20} color={color.dark}/>
                </Div>
            }
            <div>{BOARD_STORE[boardType].name}</div>
            {
                (nowIndex < Object.keys(BOARD_STORE).length -1) &&
                <Div bg={'white'} doActive px={16} cursor={1} onClick={movePage.bind(this, 'next')}>
                    <BiRightArrow size={20} color={color.dark}/>
                </Div>
            }
        </Flex>
    )
})
