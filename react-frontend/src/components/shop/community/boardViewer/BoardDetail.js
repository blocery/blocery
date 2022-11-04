import React, {useEffect, useState, useMemo, useRef} from 'react';
import {deleteBoardWriting, getBoard, reportBoardWriting} from '~/lib/shopApi'
import {getLoginUser} from "~/lib/loginApi";
import {
    Div,
    Divider,
    Flex,
    Img,
    Link,
    Right,
    Space,
    WhiteSpace,
    Button,
    GridColumns,
    JustListSpace
} from "~/styledComponents/shared";
import Skeleton from "~/components/common/cards/Skeleton";
import {withRouter, useParams} from 'react-router-dom'

import Profile from "~/components/common/cards/Profile";
import ComUtil from "~/util/ComUtil";
import ReplyContainer from "~/components/common/replyContainer";

import HashTagList from "~/components/common/hashTag/HashTagList";

import {boardTagModalState, consumerState, refreshState} from "~/recoilState";
import {useRecoilState} from "recoil";
import {RiAlarmWarningLine} from 'react-icons/ri'
import {AiOutlineCodeSandbox, AiOutlineLike, AiOutlineShareAlt} from 'react-icons/ai'
import {BsBookmark} from 'react-icons/bs'
import {color} from "~/styledComponents/Properties";
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import ReportReasonContent from "~/components/common/contents/ReportReasonContent";
import {useModal} from "~/util/useModal";

// import Like from "~/components/shop/community/cmGoodsReviewDetail/Like";
//TODO RENEW LIKE 를 공통으로 빼야 할 듯..
import Like from "~/components/shop/goodsReviewDetail/Like";
import ReportButton from "~/components/common/buttons/ReportButton";
import ScrapButton from "~/components/common/buttons/ScrapButton";
import ShareButton from "~/components/common/buttons/ShareButton";
import useLogin from "~/hooks/useLogin";
import BackNavigation from "~/components/common/navs/BackNavigation"
import {Server} from "~/components/Properties";
import GoodsCard from "~/components/common/cards/GoodsCard";
import {getGoodsByGoodsNo} from "~/lib/goodsApi";
import useImageViewer from "~/hooks/useImageViewer";
import loadable from "@loadable/component";
import {getValue} from "~/styledComponents/Util";
import BOARD_STORE from "~/components/shop/community/BoardStore";
import Zoomable from "react-instagram-zoom";
import {SummerNoteIEditorViewer} from "~/components/common";
import {LazyLoadImage} from "react-lazy-load-image-component";

const ArView = loadable(() => import('~/components/common/Ar'))

const BoardViewer = ({history,writingId}) => {
    const abortControllerRef = useRef(new AbortController())
    const [board, setBoard] = useState()
    // const [consumer, setConsumer] = useRecoilState(consumerState)
    const {consumer, isServerLoggedIn} = useLogin()

    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)
    const [refresh, setRefresh] = useRecoilState(refreshState)
    const {openImageViewer} = useImageViewer()

    useEffect(() => {
        return(() => {
            abortControllerRef.current.abort()
        })
    }, [])

    useEffect(() => {
        search()
    }, [writingId])


    const search = async () => {
        try {
            const {data} = await getBoard(writingId, abortControllerRef.current.signal)

            if (!data || data.deleted) {
                if (!data)
                    alert('잘못된 접근 입니다.')
                else if (data.deleted)
                    alert('삭제된 게시물입니다.')

                history.goBack()
                return
            }

            setBoard(data)

            console.log({data})
        }catch (error){

        }

    }

    // const setLoginUser = async () => {
    //     const loginUser = await getLoginUser()
    //     if (loginUser){
    //         setConsumer({
    //             consumerNo: loginUser.uniqueNo,
    //             userType: loginUser.userType,
    //         })
    //         console.log({loginUser})
    //     }
    // }

    const onModifyClick = () => {

        let v_Url = `/community/board/modify/`;
        if(board.boardType === 'producer'){
            v_Url = `/mypage/producer/feed/`;
        }
        history.push(`${v_Url}${board.writingId}`)
    }

    const onTagClick = ({index, tag}) => {
        console.log({index, tag})

        setTagModalState({
            isOpen: true,
            tag: tag
        })
    }

    const onShareClick = (writingId) => {
        console.log(writingId)
        ComUtil.kakaoLinkBoardShare(writingId, board.content)
    }

    const onDeleteClick = async () => {
        try {
            if (window.confirm('게시물을 삭제하시겠습니까?')) {
                const {status, data} = await deleteBoardWriting(board.writingId, abortControllerRef.current.signal)
                //data === true
                if (status === 200 && data) {
                    // 리스트 페이지의 페이지로드에서 강제 새로고침 하도록 함
                    // (리스트 페이지는 didMount 시 스크롤 유지를 위해 data를 history state 에 저장해 놓는데 이 부분의 데이터를 새로고칠려고 하는것임)
                    // ## 현재 사용중인 두가지 상황에 따른 방법 ##
                    // 1. 뷰어 페이지에서 단순 뒤로가기 했을때는 => 리스트 페이지에서 기억된 state 를 사용해서 바인딩을 하고, 또한 스크롤이 유지가 됨
                    // 2. 뷰어 페이지에서 삭제를 하여 데이터가 변경되었을 경우 => 리스트 페이지에서 강제 새로고침을 통해 state를 업데이트하되, 스크롤은 초기화(최상단)

                    if (data.resCode) {
                        alert(data.errMsg);
                        return
                    }

                    setRefresh(true)
                    history.goBack()
                }
            }
        }catch (error){

        }
    }

    const [reportModalOpen, setReportModalOpen] = useState()

    //신고하기 클릭
    const onReportClick = async () => {
        try {
            //신고처리여부
            if (getReported()) {
                alert('이미 신고처리 되었습니다.')
                return
            }
            if (await isServerLoggedIn()){
                reportToggle()
            }
        }catch (error) {

        }
    }

    //신고하기 모달 토글
    const reportToggle = async () =>{
        setReportModalOpen(!reportModalOpen)
    }

    //신고하기
    const report = async (reason) => {
        try {
            const res = await reportBoardWriting({writingId: board.writingId, reason: reason, signal: abortControllerRef.current.signal})
            if (res.status !== 200) {
                alert('에러가 발생 하였습니다. 다시 시도해 주세요.')
                return
            }
            if (res.data.resCode) {
                alert(res.data.errMsg);
                return
            }
            search()
            reportToggle()
        }catch (error){

        }
    }

    //이미 신고 했는지 여부
    const getReported = () => {
        if (consumer) {
            const report = board.reports.find(report => report.consumerNo === consumer.consumerNo)
            if (report) {
                return true
            }
        }
        return false
    }

    const onImageClick = (index) => {
        openImageViewer(board.images, index)
    }

    return (
        <>
            {/*<ShopXButtonNav historyBack fixed underline rightContent={<CommunitySidebarButton />} >글보기</ShopXButtonNav>*/}
            <BackNavigation>글보기</BackNavigation>
            {
                !board ?
                    <Skeleton.List count={4} /> :
                    <Div>
                        <Div p={16} bc={'light'} bt={0} br={0} bl={0}>
                            {/*<Div fw={500}>{board.title}</Div>*/}
                            <Flex>
                                {/*<Div fg={'green'} fontSize={13}>{BOARD_STORE[board.boardType].name}</Div>*/}
                                {
                                    (consumer && consumer.consumerNo === board.consumerNo) && (
                                        <Right>
                                            <Space>
                                                <Button fontSize={12} bg={'danger'} fg={'white'} px={10}
                                                        onClick={onDeleteClick}>삭제</Button>
                                                <Button fontSize={12} bg={'green'} fg={'white'} px={10}
                                                        onClick={onModifyClick}>글수정</Button>
                                            </Space>
                                        </Right>
                                    )
                                }
                            </Flex>

                            <Flex mt={10} alignItems={'flex-start'}>
                                <Profile {...board.profileInfo} />
                                <Right fontSize={12} flexShrink={0} fg={'secondary'} mt={4}>
                                    <Div mb={6} textAlign={'right'}>
                                        {ComUtil.timeFromNow(board.writeDate)}
                                    </Div>
                                    <Div fg={'green'} textAlign={'right'} fontSize={13}>{BOARD_STORE[board.boardType].name}</Div>
                                </Right>
                            </Flex>

                            {/*<Flex mt={10}>*/}
                            {/*    <Space fontSize={12}>*/}
                            {/*        /!*<Div>{BOARD_STORE[board.boardType].name}</Div>*!/*/}
                            {/*        <Profile {...board.profileInfo} />*/}
                            {/*        <Div fg={'secondary'}>{ComUtil.timeFromNow(board.writeDate)}</Div>*/}
                            {/*    </Space>*/}
                            {/*    {*/}
                            {/*        (consumer && consumer.consumerNo === board.consumerNo) && (*/}
                            {/*            <Right>*/}
                            {/*                <Space>*/}
                            {/*                    <Button fontSize={12} bg={'danger'} fg={'white'} px={10} onClick={onDeleteClick}>삭제</Button>*/}
                            {/*                    <Button fontSize={12} bg={'green'} fg={'white'} px={10} onClick={onModifyClick} >글수정</Button>*/}
                            {/*                </Space>*/}
                            {/*                /!*<Link fg={'green'} to={`/community/board/modify/${board.writingId}`} >글수정</Link>*!/*/}
                            {/*            </Right>*/}
                            {/*        )*/}
                            {/*    }*/}
                            {/*</Flex>*/}
                        </Div>

                        {
                            board.boardType === 'producer' && <ProducerBoardView board={board} consumer={consumer} />
                        }



                        {

                            board.images.map((image, index) =>
                                <Zoomable key={image.imageNo} releaseAnimationTimeout={200}>
                                    <LazyLoadImage
                                        alt={'photo review'}
                                        src={Server.getImageURL() + image.imageUrl} // use normal <img> attributes as props
                                        width={'100%'}
                                        effect="blur"
                                        style={{objectFit: 'cover', cursor: 'pointer'}}
                                        placeholderSrc={'/lazy/gray_lazy_1_1.jpg'}
                                        onClick={onImageClick.bind(this, index)}
                                    />
                                </Zoomable>
                            )

                        }
                        <WhiteSpace lineHeight={34} p={16}>
                            <SummerNoteIEditorViewer initialValue={board.content} />
                        </WhiteSpace>


                        {
                            board.jjalImages.map((image, index) =>
                                <Img key={index} src={image.imageUrl} alt={image.imageNm} width={'100%'} />
                            )
                        }


                        <Div p={16}>
                            {
                                board.tags.length > 0 && (
                                    <HashTagList tags={board.tags} isViewer={true} onClick={onTagClick} />
                                )
                            }
                            <Flex justifyContent={'space-between'} pt={12}>
                                <Space>
                                    <Like type={'board'} myLike={board.myLike} uniqueKey={board.writingId} />
                                    <ScrapButton
                                        //bookmarked={true}
                                        type={'board'}
                                        uniqueKey={board.writingId} />
                                    <ShareButton onClick={onShareClick.bind(this, board.writingId)}/>
                                </Space>
                                <Space>
                                    {
                                        (!consumer || consumer.consumerNo !== board.consumerNo) && <ReportButton onClick={onReportClick} reported={getReported()} />
                                    }
                                </Space>
                            </Flex>

                        </Div>



                        {/*{*/}
                        {/*    board.images.length > 0 && (*/}
                        {/*        <Div p={16} custom={`*/}
                        {/*            & > img {*/}
                        {/*                margin-bottom: ${getValue(5)};*/}
                        {/*                border-radius: ${getValue(3)};*/}
                        {/*            }*/}
                        {/*            & > img:last-child {*/}
                        {/*                margin: 0;*/}
                        {/*            }*/}
                        {/*        `}>*/}
                        {/*            {*/}
                        {/*                board.images.map((image, index) =>*/}
                        {/*                    <Zoomable key={image.imageNo} releaseAnimationTimeout={200}>*/}
                        {/*                        <Img*/}
                        {/*                             style={{maxWidth:'100%', zIndex: 1}} cover*/}
                        {/*                             src={Server.getImageURL() + image.imageUrl}*/}
                        {/*                             onClick={onImageClick.bind(this, index)}*/}
                        {/*                        />*/}
                        {/*                    </Zoomable>*/}
                        {/*                )*/}
                        {/*            }*/}
                        {/*        </Div>*/}
                        {/*    )*/}
                        {/*}*/}

                        {/*<WhiteSpace lineHeight={34} p={16}>*/}
                        {/*    {board.content}*/}
                        {/*</WhiteSpace>*/}


                        {/*{*/}
                        {/*    board.jjalImages.length > 0 && (*/}
                        {/*        <Div p={16} custom={`*/}
                        {/*            & > img {*/}
                        {/*                margin-bottom: ${getValue(5)};*/}
                        {/*                border-radius: ${getValue(3)};*/}
                        {/*            }*/}
                        {/*            & > img:last-child {*/}
                        {/*                margin: 0;*/}
                        {/*            }*/}
                        {/*        `}>*/}
                        {/*            {*/}
                        {/*                board.jjalImages.map((image, index) =>*/}
                        {/*                    <Img key={index} src={image.imageUrl} alt={image.imageNm} width={'100%'} />*/}
                        {/*                )*/}
                        {/*            }*/}
                        {/*        </Div>*/}
                        {/*    )*/}
                        {/*}*/}

                        {/*{*/}
                        {/*    board.tags.length > 0 && (*/}
                        {/*        <Div p={16}>*/}
                        {/*            <HashTagList tags={board.tags} isViewer={true} onClick={onTagClick} />*/}
                        {/*        </Div>*/}
                        {/*    )*/}
                        {/*}*/}

                        {/*<Flex p={16} justifyContent={'space-between'}>*/}
                        {/*    <Space>*/}
                        {/*        <Like type={'board'} myLike={board.myLike} uniqueKey={board.writingId} />*/}
                        {/*        <ScrapButton*/}
                        {/*            //bookmarked={true}*/}
                        {/*            type={'board'}*/}
                        {/*            uniqueKey={board.writingId} />*/}
                        {/*        <ShareButton onClick={onShareClick.bind(this, board.writingId)}/>*/}
                        {/*    </Space>*/}
                        {/*    <Space>*/}

                        {/*        {*/}
                        {/*            (!consumer || consumer.consumerNo !== board.consumerNo) && <ReportButton onClick={onReportClick} reported={getReported()} />*/}
                        {/*        }*/}
                        {/*    </Space>*/}
                        {/*</Flex>*/}

                        <Divider />
                        <ReplyContainer
                            // consumer={consumer}
                            // goodsReview={goodsReview}
                            onReplied={search}
                            replies={board.replies}
                            boardType={board.boardType} //review vote board
                            uniqueKey={board.writingId}
                            refresh={search}
                        />
                    </Div>
            }

            <Modal isOpen={reportModalOpen} centered>
                <ModalHeader toggle={reportToggle}>
                    댓글 신고
                </ModalHeader>
                <ModalBody>
                    <ReportReasonContent //selected={selected}
                        onReportClick={report}
                        // onClose={reportToggle}
                    />
                </ModalBody>
            </Modal>
        </>
    );
};

const ProducerBoardView = ({consumer, board}) => {

    const [goods, setGoods] = useState(null)
    const [arOpen, setArOpen] = useState(false)

    useEffect(() => {
        searchGoods(board.goodsNo);
    }, [board.goodsNo])

    //상품 조회
    const searchGoods = async (goodsNo) => {
        const {data} = await getGoodsByGoodsNo(goodsNo)
        setGoods(data)
    }

    const arOpenToggle = () => {
        setArOpen(!arOpen)
    }

    return (<>
        {
            board.stepTitle &&
            <Flex pl={16} pt={16} pb={16}>
                <Space fontSize={13}>
                    <Div fw={500} fg={'secondary'}>작업명</Div>
                    <Div fw={500}>{board.stepTitle}</Div>
                </Space>
            </Flex>
        }
        {
            board.stepIndex > 0 &&
            <Flex pl={16}>
                <Space fontSize={13}>
                    <Div fw={500} fg={'secondary'}>단계</Div>
                    <Div fw={500}>
                        {board.stepIndex === 100 && '생산'}
                        {board.stepIndex === 200 && '포장'}
                        {board.stepIndex === 300 && '출하'}
                    </Div>
                </Space>
            </Flex>
        }
        <div>
            {
                goods && <GoodsCard goods={goods} movePage={true} />
            }
        </div>


        {
            board.arGlbFile && board.arGlbFile.imageUrl && (
                <Flex px={16} pt={16} justifyContent={'flex-end'}>
                    <Space spaceGap={3} onClick={arOpenToggle}>
                        <AiOutlineCodeSandbox size={20}/>
                        <div><u>
                            {
                                arOpen ? 'AR 닫기' : 'AR 보기'
                            }
                        </u></div>
                    </Space>
                </Flex>
            )
        }


        {
            arOpen && (
                <div style={{width:'100vmin',maxWidth:'768px',height:'100vmin', marginTop: 16, padding: '0 16px 0 16px'}}>
                    <ArView
                        isTest={false}
                        arSrc={board.arGlbFile.imageUrl}
                        arIosSrc={board.arUsdzFile ? board.arUsdzFile.imageUrl:null}
                        arName={'A 3D model'} />

                </div>
            )
        }

    </>);
}

export default withRouter(BoardViewer);
