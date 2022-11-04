import React from 'react'
import {Flex, Div, Right, Span, WhiteSpace} from '~/styledComponents/shared'
import {withRouter} from "react-router-dom";
import {color} from "~/styledComponents/Properties";
import {AiOutlineInfoCircle} from 'react-icons/ai'
import BOARD_STORE from "~/components/shop/community/BoardStore";

const ReplyCard = ({consumerNo, nickname, title, content, repliesCount, replyDate, replyId, writingId, boardType, deleted, onClick, history}) => {

    if(deleted) return null

    const movePage = () => {

        if (onClick && typeof onClick === 'function') {
            onClick()
            return
        }

        if(boardType === 'vote'){
            history.push(`/community/boardVote/${writingId}`)
        }else if(boardType === 'goodsReview'){
            history.push(`/goodsReviewDetail/${writingId}`)
        } else { //(boardType === 'free') {
            history.push(`/community/board/${writingId}`)
        }
    }

    let boardName;
    if(boardType === 'vote') {
        boardName = '[당신의 선택은?]'
    } else if(boardType === 'goodsReview') {
        boardName = '[상품후기]'
    } else {
        boardName = BOARD_STORE[boardType].name;
    }

    return (
        <Flex alignItems={'flex-start'} bc={'veryLight'} bt={0} bl={0} br={0} px={16} py={13} cursor={1}
              custom={`
                transition: 0.2s;
                &:active {
                    background-color: ${color.veryLight};
                }
              `}

              onClick={!deleted ? movePage:null}
        >
            <Div ml={8} fontSize={14}>
                <WhiteSpace bold lineClamp={2} fg={deleted&&"danger"}>
                    {
                        deleted ? <><AiOutlineInfoCircle/> 삭제된 댓글입니다.</>:content
                    }
                </WhiteSpace>
                {
                    !deleted && <>
                        <Div mt={3} fontSize={13}>
                            <Span fg={'dark'}>{replyDate}</Span>
                        </Div>
                        <Flex mt={8} fontSize={13}>
                            <Div fg={'green'} mr={3} flexShrink={0}>{boardName}</Div>
                            <Div fg={'dark'} lineClamp={1} custom={`word-break: break-all;`}>
                                {title}
                            </Div>
                            {
                                repliesCount > 0 && <Div fg={'green'} flexShrink={0} ml={3}>({repliesCount})</Div>
                            }
                        </Flex>
                    </>
                }

            </Div>
        </Flex>
    )
}

export default React.memo(withRouter(ReplyCard));
