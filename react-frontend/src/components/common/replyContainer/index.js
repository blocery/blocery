import React, {useEffect, useState, useRef, useMemo, useCallback} from 'react';
import {useModal} from "~/util/useModal";
import {getLoginUser, getLoginUserType} from "~/lib/loginApi";
import {Webview} from "~/lib/webviewApi";

import {addGoodsReviewReply, addGoodsReviewReReply, addBoardReply, addBoardReReply, modBoardReply, delBoardReply, reportGoodsReviewReply, reportBoardReply} from "~/lib/shopApi";

import {Button, Div, Flex, Hr, Img, Input, Right, Span, Link} from "~/styledComponents/shared";
import {Modal, ModalBody, ModalHeader} from "reactstrap";
import ComUtil from "~/util/ComUtil";
import {AiOutlineInfoCircle, AiTwotoneAlert} from 'react-icons/ai'
import {BiCommentDetail} from 'react-icons/bi'
import {color} from "~/styledComponents/Properties";
import Textarea from 'react-textarea-autosize'
import {FiCornerDownRight} from 'react-icons/fi'
import {RiAlarmWarningLine} from 'react-icons/ri'
import styled from 'styled-components'
import {getValue} from "~/styledComponents/Util";
import Profile from "~/components/common/cards/Profile";
import {Server} from "~/components/Properties";
import {Collapse} from "reactstrap";
import {IoIosArrowUp, IoIosArrowDown} from "react-icons/io";

import ReportReasonContent from "~/components/common/contents/ReportReasonContent";
import useLogin from "~/hooks/useLogin";
import {FiRefreshCw} from 'react-icons/fi'

const StyledTextarea = styled(Textarea)`
    ::placeholder { /* Chrome, Firefox, Opera, Safari 10.1+ */
      color: ${color.dark};
      opacity: 1; /* Firefox */
    }
    
    :-ms-input-placeholder { /* Internet Explorer 10-11 */
      color: ${color.dark};
    }
    
    ::-ms-input-placeholder { /* Microsoft Edge */
      color: ${color.dark};
    }

    width: 100%;
    min-height: ${getValue(150)};
    border: 1px solid ${color.light};
`

const ReplyCard = ({consumerNo, reply, onReplyClick, onReplyModClick, onReplyDelClick, onReportClick}) => {

    if (reply.deleted) {
        if(reply.reReplyCount == 0){
            return null
        }
    }

    const Wrapper = ({children}) => {
        const height = 56//최상단 네비게이션 바 height
        if (reply.reReply) {
            return (
                <Flex m={16} mt={16} mr={16} mb={16} alignItems={'flex-start'}>
                    <Div flexShrink={0} mr={13} textAlign={'right'}>
                        <FiCornerDownRight />
                    </Div>
                    {children}
                </Flex>
            )
        }else{
            return (
                <Div m={16}>
                    {children}
                </Div>
            )
        }
    }


    //신고 가능한지 체크
    const ReportButton = () => {

        //이미 신고 했으면
        if (consumerNo && reply.reports.find(report => report.consumerNo === consumerNo)) {
            return(
                <Div fg={'secondary'}>
                    {/*<Div lineHeight={0}><RiAlarmWarningLine /></Div>*/}
                    <Div ml={5}>신고됨</Div>
                </Div>
            )
        }

        //로그인 하지 않았거나, 작성자가 본인이 아닐 경우 신고가능
        else if (!consumerNo || reply.consumerNo !== consumerNo) {
            return (
                <Flex fg={'secondary'} cursor>
                    <Div lineHeight={0}><RiAlarmWarningLine /></Div>
                    <Div ml={5}>신고</Div>
                </Flex>
            )
        }
        else return null
    }

    // if (reply.deleted) {
    //     return (<Wrapper>
    //         <Div flexGrow={1}
    //             //lineHeight={0}
    //         >
    //             삭제된 댓글입니다.
    //         </Div>
    //     </Wrapper>)
    // }

    return (
        <Wrapper>
            <Div flexGrow={1}
                //lineHeight={0}
            >

                {
                    !reply.deleted &&
                    <Flex fontSize={12} alignItems={'flex-end'}>
                        <Profile {...reply.profileInfo} />

                        {/*<Div width={25} height={25}>*/}
                        {/*    <Img width={'100%'} height={'100%'} rounded={'50%'} src="https://images.christiantoday.co.kr/data/images/full/323947/2.jpg?w=654" alt=""/>*/}
                        {/*</Div>*/}
                        {/*<Div ml={8} fontSize={14}>{reply.name}</Div>*/}
                        <Div ml={8}>{ComUtil.timeFromNow(reply.replyDate)}</Div>
                        <Div ml={'auto'} fontSize={13} onClick={onReportClick}>

                            <ReportButton />
                            {/*<Div lineHeight={0}><RiAlarmWarningLine /> </Div>*/}
                            {/*<Div ml={5}>신고</Div>*/}

                        </Div>
                    </Flex>
                }

                <Div
                    mt={8}
                    bg={reply.deleted?'veryLight':'veryLight'}
                    rounded={4}
                    py={20} px={16}
                    fontSize={14}
                    style={{whiteSpace: 'pre-line', wordBreak: 'break-word'}} pr={16}
                    lineHeight={22}
                    custom={`
                        &:active {
                            transition: 0.1s;
                            background-color: ${color.light};
                        }
                    `}
                    onClick={!reply.deleted ? onReplyClick:null}
                >
                    {
                        !reply.deleted ? reply.at && (<Span fg={'green'} >{`@${reply.at} `}</Span>):null
                    }
                    {
                        reply.deleted ?
                            <><AiOutlineInfoCircle/> 삭제된 댓글입니다.</>
                            :
                            reply.content
                    }
                </Div>
                {
                    !reply.deleted &&
                        <Div mt={8}
                             fg={'dark'}
                             fontSize={13}
                             display={'inline-block'}
                             cursor={1}
                             custom={`
                                    &:active {
                                        color: ${color.primary};
                                    }
                                 `}
                             onClick={onReplyClick}
                        >답글달기</Div>
                }
                {
                    !reply.deleted && consumerNo == reply.consumerNo &&
                    <Div mt={8} ml={8}
                         fg={'dark'}
                         fontSize={13}
                         display={'inline-block'}
                         cursor={1}
                         custom={`
                                    &:active {
                                        color: ${color.primary};
                                    }
                                 `}
                         onClick={onReplyModClick}
                    >수정</Div>
                }
                {
                    !reply.deleted && consumerNo == reply.consumerNo &&
                    <Div mt={8} ml={8}
                         fg={'dark'}
                         fontSize={13}
                         display={'inline-block'}
                         cursor={1}
                         custom={`
                                    &:active {
                                        color: ${color.primary};
                                    }
                                 `}
                         onClick={onReplyDelClick}
                    >삭제</Div>
                }
            </Div>
        </Wrapper>
    )
}

const ReplyContainer = ({
                            boardType,
                            replies,
                            uniqueKey,       //orderSeq, writingId
                            onReplied,
                            refresh
                        }) => {

    const {consumer, isServerLoggedIn} = useLogin()

    //댓글 입력 모달
    const [modalOpen, , selected, setSelected, setModalState] = useModal()

    //댓글 신고 모달
    const [reportModalOpen, , reportSelected, setReportSelected, setReportModalState] = useModal()

    const [replyGroup, setReplyGroup] = useState([])

    // const [consumer, setConsumer] = useState()

    useEffect(() => {
        // searchConsumer()
    }, [])

    useEffect(() => {
        if (replies) {
            console.log({uniqueKey})
            const newReplyGroup = getReplyGroup()
            setReplyGroup(newReplyGroup)
        }
    }, [replies])

    // const searchConsumer = async () => {
    //     const consumer = await getLoginUser()
    //     if (consumer) {
    //         setConsumer({
    //             consumerNo: consumer.uniqueNo,
    //             nickname: consumer.nickname,
    //             userType: consumer.userType
    //         })
    //     }
    // }


    //댓글
    const onReplyClick = async () => {
        //로그인 체크
        if (await isServerLoggedIn()) {
            setSelected({
                at: '',
                act:'I',
                replyType: 'reply',
                nickname: consumer.nickname,
                content: null
            });
            setModalState(!modalOpen);
        }
    }

    //대댓글
    const onReReplyClick = async (reply) => {
        //로그인 체크
        if (await isServerLoggedIn()) {
            const params = {
                ...reply,
                act:'I',
                replyType: 'reReply',
                at: reply.reReply ? reply.nickname : '', //대댓글 일 경우 at 첨부
                nickname: consumer.nickname,
                content: null
            }
            setSelected(() => params);
            setModalState(!modalOpen);
        }
    }

    const onReplyModClick = async (reply) => {
        //로그인 체크
        if (await isServerLoggedIn()) {
            setSelected({
                ...reply,
                act:'U',
                replyId:reply.replyId,
                content : reply.content
            })
            setModalState(!modalOpen)
        }
    }

    //댓글삭제
    const onReplyDelClick = async (reply, e) => {
        //로그인 체크
        if (await isServerLoggedIn()) {
            if (reply.consumerNo !== consumer.consumerNo) {
                alert('본인만 삭제 할 수 있습니다.')
                return
            }
            if(window.confirm("댓글을 삭제하시겠습니까?")) {
                const response = await delBoardReply({
                    boardType: boardType,
                    writingId: uniqueKey,
                    replyId: reply.replyId
                });
                if (response.data.resCode != 0) {
                    alert(response.data.errMsg);
                }
                //부모의 goodsReview 새로고침
                onReplied()
            }
        }
    }

    //신고
    const onReportClick = async (reply, e) => {
        e.stopPropagation()

        if (await isServerLoggedIn()) {

            if (reply.consumerNo === consumer.consumerNo) {
                alert('본인은 신고 할 수 없습니다.')
                return
            }
            if (reply.reports) {

                const myReport = reply.reports.find(report => report.consumerNo === consumer.consumerNo)
                if (myReport) {
                    alert('이미 신고 하였습니다.')
                    return
                }
            }
            setReportSelected(reply)
            setReportModalState(!reportModalOpen)
        }
        // e.stopPropagation()
        // if (await getConsumer()) {
        //
        //     if (reply.reports) {
        //         reply.reports.find(report => report.consumerNo === )
        //     }
        //
        //     setReportSelected(reply)
        //     setReportModalState(!reportModalOpen)
        // }
    }

    // const isLoggedIn = () => {
    //     if (consumer && consumer.userType === 'consumer') {
    //         return true
    //     }else{
    //         Webview.openPopup('/login')
    //         return null
    //     }
    // }

    //모달로 부터 넘어온 content
    const addReply = async (content) => {

        const act = selected.act;

        switch (boardType) {
            //상품리뷰
            case "review" : {
                let status;
                let retData;

                //일반댓글 추가
                if (selected.replyType === 'reply') {
                    if(act === 'U'){
                        const response = await modBoardReply({
                            boardType: boardType,
                            writingId: uniqueKey,
                            replyId: selected.replyId,
                            content: content
                        });
                        status = response.status
                        retData = response.data
                    }else {
                        const response = await addGoodsReviewReply({
                            orderSeq: uniqueKey,//goodsReview.orderSeq,
                            content: content
                        });
                        status = response.status
                        retData = response.data
                    }
                }
                //대댓글 추가
                else{
                    if(act === 'U'){
                        const response = await modBoardReply({
                            boardType: boardType,
                            writingId: uniqueKey,
                            replyId: selected.replyId,
                            content: content
                        });
                        status = response.status
                        retData = response.data
                    }else {
                        const response = await addGoodsReviewReReply({
                            orderSeq: uniqueKey, //goodsReview.orderSeq,
                            at: selected.at ? selected.at : '',
                            content: content,
                            refReplyId: selected.reReply ? selected.refReplyId : selected.replyId,// selected.refReplyId
                            realRefId: selected.replyId
                        })
                        status = response.status
                        retData = response.data
                    }
                }
                if (retData.resCode != 0) {
                    alert(retData.errMsg);
                }
                break;
            }
            //투표 게시판 및 일반 게시판
            //case "vote" :
            //case "free" : {
            default : {
                let status;
                let retData;

                //일반댓글 추가
                if (selected.replyType === 'reply') {
                    if(act === 'U'){
                        const response = await modBoardReply({
                            boardType: boardType,
                            writingId: uniqueKey,
                            replyId: selected.replyId,
                            content: content
                        })
                        status = response.status
                        retData = response.data
                    }else {
                        const response = await addBoardReply({
                            boardType: boardType,
                            writingId: uniqueKey,
                            content: content
                        })
                        status = response.status
                        retData = response.data
                    }
                }
                //대댓글 추가
                else{
                    if(act === 'U'){
                        const response = await modBoardReply({
                            boardType: boardType,
                            writingId: uniqueKey,
                            replyId: selected.replyId,
                            content: content,
                        })
                        status = response.status
                        retData = response.data
                    }else {
                        const response = await addBoardReReply({
                            boardType: boardType,
                            writingId: uniqueKey,
                            at: selected.at ? selected.at : '',
                            content: content,
                            refReplyId: selected.reReply ? selected.refReplyId : selected.replyId,// selected.refReplyId
                            realRefId: selected.replyId
                        })
                        status = response.status
                        retData = response.data
                    }
                }
                if (retData.resCode != 0) {
                    alert(retData.errMsg);
                }

                break;
            }

        }

        //모달 닫기
        setModalState(!modalOpen)

        //부모의 goodsReview 새로고침
        onReplied()
    }

    const reportReply = async (reason) => {
        let res = null;
        if (boardType === "review") {
            res = await reportGoodsReviewReply({
                orderSeq: uniqueKey,// goodsReview.orderSeq,
                replyId: reportSelected.replyId,
                reason: reason
            });
        }else {
            res = await reportBoardReply({
                boardType: boardType,
                writingId: uniqueKey,
                replyId: reportSelected.replyId,
                reason: reason
            })
        }

        if (res.status !== 200) {
            alert('에러가 발생 하였습니다. 다시 시도해 주세요.')
            return
        }
        if (res.data.resCode) {
            alert(res.data.errMsg);
            return
        }

        //모달 닫기
        setReportModalState(!reportModalOpen)
        //부모의 goodsReview 새로고침
        onReplied()
    }

    const getReplyGroup = () => {
        const arr = [];

        replies.map(reply => {
            if (!reply.reReply) {
                arr.push([])
            }

            arr[arr.length-1].push(reply)
        })

        console.log({arr})
        return arr
    }
    const [isOpen, setIsOpen] = useState(true)

    const replyToggle = () => setModalState(!modalOpen)
    const reportToggle = () => setReportModalState(!reportModalOpen)

    return(
        <Div pb={29}>
            <Flex
                //m={16} mt={29} mb={20}
                p={16}
            >
                <Div fontSize={17} cursor={1} display={'inline-block'} onClick={()=>setIsOpen(()=>!isOpen)}>
                    <strong>댓글 <Span fg={'green'}>{ComUtil.addCommas(replies && replies.length > 0 ? replies.filter(reply=>reply.deleted === false).length:0)}</Span>개</strong>
                    {
                        isOpen ? <IoIosArrowDown size={16} /> : <IoIosArrowUp size={16} />
                    }
                </Div>
                <Right bg={'white'} doActive p={8}>
                    <FiRefreshCw onClick={refresh}/>
                </Right>
            </Flex>


            <Collapse isOpen={isOpen}>
                <Div p={16}>
                    <Button bc={'light'} bg={'white'} fg={'secondary'} rounded={4} p={8}  block onClick={onReplyClick}>
                        <Flex>
                            <Div fg={'dark'} ml={16}>
                                댓글을 남겨보세요. :D
                            </Div>
                            <Flex ml={'auto'} px={10} height={34} bg={'secondary'} fg={'white'} rounded={4} fontSize={14}>
                                등록
                            </Flex>
                        </Flex>
                    </Button>
                </Div>
                {
                    replyGroup.map((replies, xIndex) =>
                        <Div
                            key={`replyGroup${xIndex}`}
                            // style={{borderBottom: replies.length > 1 && `1px solid ${color.light}`}}
                        >
                            {
                                replies.map((reply, yIndex) =>
                                    <ReplyCard
                                        key={`reply${xIndex}${yIndex}`}
                                        consumerNo={consumer ? consumer.consumerNo : 0}
                                        reply={reply}
                                        onReplyClick={onReReplyClick.bind(this, reply)}
                                        onReplyModClick={onReplyModClick.bind(this, reply)}
                                        onReplyDelClick={onReplyDelClick.bind(this, reply)}
                                        onReportClick={onReportClick.bind(this, reply)}
                                    />
                                )
                            }
                        </Div>
                    )
                }
            </Collapse>

            <Modal isOpen={modalOpen} centered>
                <ModalHeader toggle={replyToggle}>
                    공개댓글 {selected && selected.act === 'U'?'수정':'입력'}
                </ModalHeader>
                <ModalBody>
                    <ReplyModalContent selected={selected}
                                       onSaveClick={addReply}
                                       onClose={replyToggle}/>
                </ModalBody>
            </Modal>

            <Modal isOpen={reportModalOpen} centered>
                <ModalHeader toggle={reportToggle}>
                    댓글 신고
                </ModalHeader>
                <ModalBody>
                    <ReportReasonContent //selected={selected}
                        onReportClick={reportReply}
                        onClose={reportToggle}/>
                </ModalBody>
            </Modal>

        </Div>
    )
}

const ReplyModalContent = ({selected, onSaveClick, onClose}) => {


    if (!selected) return null

    //const [] = useState(reply)
    const [content, setContent] = useState(selected.content ? selected.content:'')

    const onInputChange = ({target}) => {
        setContent(target.value)
    }

    const onClick = () => {
        onSaveClick(content)
        onClose()
    }

    const {nickname, at} = selected

    return(
        <Div>
            <Div fontSize={12} lighter mb={16}>
                {nickname}
            </Div>
            <Div mb={8}>
                {
                    at && <Div fg={'green'} mb={8}>@{at}</Div>
                }
                <StyledTextarea
                    // style={{width: '100%', minHeight: 90, borderRadius: 0, border: 0, borderBottom: '2px solid'}}
                    // className={'border-info'}
                    onChange={onInputChange}
                    // inputRef={inputEl}
                    value={content}
                    autoFocus
                    placeholder='타인을 배려하는 댓글을 남겨주세요. :D'/>
            </Div>

            <Div fontSize={12} lighter mb={16}>
                ※ 댓글 작성 시 주의해 주세요. 게시글 내용과 상관없는 글, 여러 게시물에 일괄적으로 반복되는 도배성 글, 타인 비방·욕설, 성희롱·기타 부적절한 글 등은, 시스템·관리자에 의해 사전 고지 없이 댓글 삭제와 계정 제재가 가해질 수 있습니다.
            </Div>

            <Div textAlign={'center'}>
                <Button py={5} px={10} bg={'white'} bc={'dark'} fg={!content ? 'white' : 'black'} onClick={onClick} disabled={!content} >저장</Button>
            </Div>
        </Div>
    )
}
export default ReplyContainer;
