import React, { Fragment, useState, useEffect } from 'react';
import { ShopXButtonNav, HeaderTitle } from '~/components/common'
import {Div, Fixed, Flex, Link} from '~/styledComponents/shared'
import {getProducerBoardList} from '~/lib/shopApi'
import { getItems } from '~/lib/adminApi'
import { BoardCard, NoSearchResultBox, BlocerySpinner } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import ModalCheckListGroup from '~/components/common/modals/ModalCheckListGroup'
import { Webview } from '~/lib/webviewApi'
import BackNavigation from "~/components/common/navs/BackNavigation";
import Skeleton from "~/components/common/cards/Skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import _ from "lodash";
import {getLoginUser} from "~/lib/loginApi";
import {EmptyBox} from "~/styledComponents/ShopBlyLayouts";
import {Button} from "reactstrap";
import BoardWriteButton from "~/components/common/buttons/BoardWriteButton";

const initFilter = {value: -1, label: '전체품목'}

const ProducersFarmDiaryList = (props) => {
    const { producerNo, stepOnly } = ComUtil.getParams(props)
    const [producerBoard, setProducerBoard] = useState([])                          //재배일지목록
    const [producerBoardTotalCount, setProducerBoardTotalCount] = useState(0)       //재배일지목록 카운트(전체)
    const [myList, setMyList] = useState(false);
    const [loading, setLoading] = useState(true)

    const [page, setPage] = useState(0)


    useEffect(() => {
        async function fetch(){
            search()

            // 생산자 본인인 경우에만 글쓰기 버튼 나오도록 로그인 유저 비교
            const loginUser = await getLoginUser();
            // console.log({loginUser});

            setMyList(parseInt(loginUser.producerNo) === parseInt(producerNo));

            // window.scrollTo(0,0)
        }
        fetch()
    }, [])

    async function search() {
        setLoading(true)

        if(producerNo){
            console.log('stepOnly', stepOnly)
            // const itemNo = filter.value === -1 ? undefined : filter.value
            const {data} = await getProducerBoardList({producerNo, stepOnly}) //stepOnly가 true이면 재배이력만 조회.

            console.log(data)
            setProducerBoardTotalCount(data.totalCount)
            setProducerBoard(data.boards)
        }

        setLoading(false)
    }


    // function movePage(writingId) {
    //     Webview.openPopup(`/producersFarmDiary?writingId=${writingId}`, false)
    //     // props.history.push(`/producersFarmDiary?diaryNo=${diaryNo}`)
    // }

    const onWritingClick = () => {
        //props.history.push(`/community/board/writing/producer`)

        props.history.push(`/producer/feed`)
    }

    const goTop = () => {
        window.scrollTo(0,0)
    }

    return(
        <Div pb={40}>
            {
                loading && <BlocerySpinner/>
            }
            <BackNavigation>{(stepOnly)?'재배 이력':'생산자 게시글'}</BackNavigation>
            <Div>
                {
                    producerBoard.length <= 0 ? <EmptyBox>아직 작성된 글이 없어요!</EmptyBox> : (
                        producerBoard.map((producerBoard, index) =>
                            <BoardCard {...producerBoard}
                                // onClick={movePage.bind(this, producerBoard.writingId)}
                            />
                        )
                    )
                }
            </Div>

            {myList &&
                <BoardWriteButton onClick={onWritingClick}/>
            }

            {/*<Fixed bottom={0} width={'100%'}>*/}
            {/*    {myList ?*/}
            {/*        <Flex cursor={1} bg={'dark'} fg={'white'}>*/}
            {/*            <Flex width={'50%'} height={40} justifyContent={'center'} bc={'light'} bt={0} bl={0} bb={0} onClick={onWritingClick}>*/}
            {/*                글쓰기*/}
            {/*            </Flex>*/}
            {/*            <Flex width={'50%'} height={40} justifyContent={'center'} textAlign={'center'} onClick={goTop}>맨위로</Flex>*/}
            {/*        </Flex>*/}
            {/*    }*/}
            {/*</Fixed>*/}
        </Div>
    )
}

export default ProducersFarmDiaryList