import React, {useEffect, useState} from 'react';
import {ShopXButtonNav} from "~/components/common";
import {getBoardVote, processPointClaim} from '~/lib/shopApi'
import {Button, Div, Divider, Fixed, Flex, Img, Space, Span} from "~/styledComponents/shared";
import vsIcon from "~/images/icons/etc/vs@3x.png";
import Skeleton from "~/components/common/cards/Skeleton";
import {Server} from "~/components/Properties";
import {FiCheckCircle} from 'react-icons/fi'
import Goods from './Goods'
import {color} from "~/styledComponents/Properties";
import ComUtil from "~/util/ComUtil";
import {consumerVote, getPointClaimStatus} from "~/lib/shopApi";
import useScroll from "~/hooks/useScroll";
import {RiChatQuoteLine} from 'react-icons/ri'
import ReplyContainer from "~/components/common/replyContainer";
import {getLoginUser} from "~/lib/loginApi";
import Tag from "~/components/common/hashTag/HashTagInput";
import HashTagList from "~/components/common/hashTag/HashTagList";
import {useRecoilState} from "recoil";
import {boardTagModalState, consumerState} from "~/recoilState";
import {GiCheckMark} from 'react-icons/gi'
import useLogin from "~/hooks/useLogin";
import {getValue} from "~/styledComponents/Util";
import BackNavigation from "~/components/common/navs/BackNavigation"
const Vs = () =>
    <Flex absolute left={'calc(100% + 5px)'} center justifyContent={'center'}
          bg={'#ff4545'} rounded={'50%'}
          width={'15vw'} height={'15vw'}
          custom={`border: 3px solid white;`} zIndex={1}
          shadow={'md'}
          maxWidth={67}
          maxHeight={67}>
        <Img src={vsIcon} width={'70%'} height={'unset'}/>
    </Flex>

const size = 'calc(50vw - 16px - 5px)'
const VoteImageBox = React.memo(({src, alt}) =>
    <Div width={size} height={size} maxWidth={200} maxHeight={200} >
        <Img cover shadow={'sm'}
             custom={`
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
             `}
             src={src} alt={alt} />
    </Div>
)

const FixedText = ({text}) => {
    const {y} = useScroll()
    const hide = y <= 300 ? true : false;
    return <Fixed custom={`
                            transition: 0.2s;                            
                            opacity: ${hide ? '0' : '1'};
                            visibility: ${hide ? 'hidden' : 'visible'};
                            display: flex;
                            align-items: center;
                            background: rgba(255, 255, 255, 0.9);
                            
                        `}
                  zIndex={2} top={60} left={20} p={5} px={12} rounded={10} shadow={'lg'} bc={'light'}>
        <Div><RiChatQuoteLine /></Div>
        <Div ml={5}>{text}</Div>
    </Fixed>
}

const BoardVoteDetail = ({writingId}) => {
    const login = useLogin()
    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)

    const imageUrl = Server.getImageURL()

    // const {writingId} = useParams()
    const [boardVote, setBoardVote] = useState()
    const [myVotedIndex, setMyVotedIndex] = useState()
    const [pointClaimStatus, setPointClaimStatus] = useState()

    useEffect(() => {
        search()
        // setLoginUser()
        console.log(login.consumer)
    }, [login.consumer])

    useEffect(() => {
        if (boardVote) {
            searchPointClainStatus()
        }
    }, [boardVote])

    const search = async () => {
        const {data} = await getBoardVote(writingId)
        console.log(data)
        setBoardVote(data)

        setMyVotedIndex(data.myVotedIndex)
    }

    const searchPointClainStatus = async () => {
        const {data} = await getPointClaimStatus({type: 'vote', id: boardVote.writingId})
        console.log({status: data})
        setPointClaimStatus(data)
    }

    const onReplied = async () => {
        const {data} = await getBoardVote(writingId)
        setBoardVote(data)
    }

    //투표 선택
    const onVoteSelectClick = (index) => {
        //모바일앱 에서만 가능한 서비스
        if (ComUtil.checkAndMoveDownloadAppPage()) {
            //진행중이고 투표 안했을때만 선택 가능
            if (boardVote.runningFlag && !boardVote.myVote) {
                setMyVotedIndex(index)
            }
        }
    }

    //투표 저장
    const onVoteClick = async () => {

        //모바일앱 에서만 가능한 서비스
        if (ComUtil.checkAndMoveDownloadAppPage()) {
            if (await login.isServerLoggedIn()) {
                if (myVotedIndex === -1) {
                    alert('투표할 곳을 먼저 선택해 주세요')
                    return
                }

                if (!window.confirm(`"${boardVote.items[myVotedIndex].text}"에 투표 하시겠습니까?`)) {
                    return;
                }

                console.log(writingId, myVotedIndex)
                await consumerVote(writingId, myVotedIndex)

                search()
            }
        }
    }

    //포인트 요청
    const onPointClaimClick = async () => {

        //모바일앱 에서만 가능한 서비스
        if (ComUtil.checkAndMoveDownloadAppPage()) {
            if (await login.isServerLoggedIn()) {

                if (pointClaimStatus === 2) {
                    alert('이미 지급 받았습니다.');
                    return
                }
                if ([0,1].includes(pointClaimStatus)) {
                    const {status, data} = await processPointClaim({
                        type: 'vote',
                        id: boardVote.writingId
                    })
                    console.log({data, writingId: boardVote.writingId})
                    if (status === 200) {
                        alert('포인트를 요청 하였습니다. 포인트는 다음날 일괄 지급됩니다.');
                        search()
                    }else{
                        alert('에러가 발생 하였습니다. 다시 시도해 주세요.');
                    }
                }
            }
        }
    }

    // const setLoginUser = async () => {
    //     const consumer = await getLoginUser()
    //     if (consumer) {
    //         setConsumer({
    //             consumerNo: consumer.uniqueNo,
    //             name: consumer.name,
    //             userType: consumer.userType
    //         })
    //     }
    // }

    const onTagClick = ({tag}) => {
        setTagModalState({
            isOpen: true,
            tag: tag
        })
    }

    const getPercentage = () => {
        if (!boardVote)
            return 0
        let vote1Count = boardVote.itemVoters[0].length
        let vote2Count = boardVote.itemVoters[1].length
        if (vote1Count <= 0) {
            return 0;
        }
        return (vote1Count / (vote1Count + vote2Count)) * 100
    }

    const percentage = getPercentage()

    return (
        <>
            {/*<ShopXButtonNav historyBack fixed underline rightContent={<CommunitySidebarButton />} >당신의 선택은?</ShopXButtonNav>*/}
            <BackNavigation>당신의 선택은?</BackNavigation>
            {
                !boardVote ? (<Skeleton.ProductList count={6} />) : (
                    <>
                        <FixedText text={boardVote.title}/>


                        <Div p={16}>
                            <Div fontSize={15} mb={10} bold>
                                {boardVote.title}
                            </Div>
                            <Space fg={'dark'} fontSize={13}>
                                <Div>참여수 : {ComUtil.addCommas(boardVote.voteCount)}</Div>
                                <Div>댓글수 : {ComUtil.addCommas(boardVote.repliesCount)}</Div>
                            </Space>
                        </Div>

                        {
                            (boardVote.displayContentFlag && boardVote.content) && (
                                <>
                                    <Divider />
                                    <Div p={16} dangerouslySetInnerHTML={{__html: boardVote.content}} />
                                </>
                            )
                        }


                        {
                            boardVote.refGoods.length > 0 && (
                                <>
                                    <Divider />
                                    <Div
                                        px={16}
                                        custom={`
                                        & > div {
                                            border-bottom: 1px solid ${color.light};
                                            padding-left: 0;
                                            padding-right: 0;                               
                                        }
                                        & > div:last-child {
                                            border: 0;
                                        }
                                    `}>
                                        {
                                            boardVote.refGoods.map(goodsNo =>
                                                <Goods goodsNo={goodsNo}/>
                                            )
                                        }
                                    </Div>
                                </>
                            )
                        }


                        <Divider />
                        <Div p={16} pt={32}>
                            <Div bc={'light'} rounded={4} py={22} textAlign={'center'} mb={10}>
                                <Div fontSize={15} bold>{boardVote.runningFlag ? '투표 진행중' : '투표가 마감되었습니다'}</Div>
                                <Space fontSize={16} fg={'green'} justifyContent={'center'}>
                                    <Div>{ComUtil.intToDateString(boardVote.startDate)}</Div>
                                    <Div>~</Div>
                                    <Div>{ComUtil.intToDateString(boardVote.endDate)}</Div>
                                </Space>
                            </Div>

                            <Div relative display={'inline-block'}>
                                <Space spaceGap={10} alignItems={'flex-start'}>
                                    <Div maxWidth={200} onClick={onVoteSelectClick.bind(this, 0)} cursor>
                                        <Div relative>
                                            <Vs />
                                            <VoteImageBox src={imageUrl + boardVote.items[0].image.imageUrl} alt={boardVote.items[0].image.imageNm} />
                                        </Div>
                                        <Flex px={16} py={16} alignItems={'flex-start'} justifyContent={'center'} fg={myVotedIndex === 0 ? 'green' : 'secondary'}>
                                            <Div flexShrink={0}><FiCheckCircle size={22} /></Div>
                                            <Div ml={5}>{boardVote.items[0].text}</Div>
                                        </Flex>
                                    </Div>
                                    <Div onClick={onVoteSelectClick.bind(this, 1)} cursor>
                                        <Div>
                                            <VoteImageBox src={imageUrl + boardVote.items[1].image.imageUrl} alt={boardVote.items[0].image.imageNm} />
                                        </Div>
                                        <Flex px={16} py={16} alignItems={'flex-start'} justifyContent={'center'} fg={myVotedIndex === 1 ? 'green' : 'secondary'}>
                                            <Div flexShrink={0}><FiCheckCircle size={22} /></Div>
                                            <Div ml={5}>{boardVote.items[1].text}</Div>
                                        </Flex>
                                    </Div>
                                </Space>
                            </Div>

                            {
                                //총 x명 투표 참여, 프로그래스 바
                                (boardVote.itemVoters[0].length > 0 || boardVote.itemVoters[1].length > 0) && (
                                    <Div mt={16} textAlign={'center'}>
                                        <Div bold fontSize={16.5}>총 <Span fg={'green'}>{ComUtil.addCommas(boardVote.itemVoters[0].length + boardVote.itemVoters[1].length)}</Span>명 투표 참여</Div>
                                        <Div my={10}>
                                            <Div bg={percentage < 50 ? 'green' : '#C3D4C5'} height={8} rounded={5} relative custom={`
                                                &::after {
                                                    content: "";
                                                    position: absolute;
                                                    left: 0;
                                                    border-radius: ${getValue(5)};
                                                    width: ${percentage}%;
                                                    height: 100%;                                            
                                                    background-color: ${percentage > 50 ? color.green : '#C3D4C5'};                                            
                                                }
                                            `}>
                                                <Div absolute width={11} height={11} rounded={'50%'} bc={'white'} bw={2} bg={'green'} left={`${percentage}%`} top={-2} zIndex={1} custom={`transform: translateX(-50%);`}></Div>
                                            </Div>
                                        </Div>
                                        <Flex justifyContent={'space-between'} fontSize={13}>
                                            <Div fg={percentage > 50 ? 'black' : 'secondary'}>{ComUtil.addCommas(boardVote.itemVoters[0].length)}표 {percentage.toFixed(1)}%</Div>
                                            <Div fg={percentage < 50 ? 'black' : 'secondary'}>{ComUtil.addCommas(boardVote.itemVoters[1].length)}표 {(100 - percentage).toFixed(1)}%</Div>
                                        </Flex>
                                    </Div>
                                )
                            }

                            <Button mt={16} bg={'green'} fg={'white'} rounded={4} height={55} block onClick={onVoteClick} disabled={!boardVote.runningFlag || boardVote.myVote}>
                                {
                                    boardVote.myVote ? <Space justifyContent={'center'}><GiCheckMark /><Div>투표 참여 완료</Div></Space> : '투표하기'
                                }
                            </Button>
                            {
                                boardVote.runningFlag &&
                                <Div mt={16} fg={'dark'} fontSize={13} textAlign={'center'}>
                                    투표참여 후 투표가 마감되면 포인트를 요청 할 수 있습니다.
                                </Div>
                            }

                            <Button mt={10} bg={'green'} fg={'white'} rounded={4} height={55} block onClick={onPointClaimClick} disabled={boardVote.runningFlag || !boardVote.myVote || pointClaimStatus === 2}>
                                {
                                    [-1,0,1].includes(pointClaimStatus) && (<>포인트 주세요 <Span fg={'#fff192'}>{ComUtil.addCommas(boardVote.rewardPoint)}P</Span></>)
                                }
                                {
                                    pointClaimStatus === 2 && <Space justifyContent={'center'}><GiCheckMark /><Div>포인트 요청 완료 <Span fg={'#fff192'}>{ComUtil.addCommas(boardVote.rewardPoint)}P</Span></Div></Space>
                                }

                            </Button>
                        </Div>

                        <Div px={16} my={20}>
                            <HashTagList tags={boardVote.tags} isViewer={true} onClick={onTagClick} />
                        </Div>

                        <Divider />
                        <ReplyContainer boardType={'vote'} //review vote board
                                        replies={boardVote.replies}
                                        uniqueKey={boardVote.writingId}
                                        onReplied={onReplied}
                                        refresh={onReplied}
                        />
                    </>
                )
            }

        </>
    );
};

export default BoardVoteDetail;
