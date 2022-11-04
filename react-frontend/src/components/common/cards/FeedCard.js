import React, {useState} from 'react';
import {Div, Flex, Img, Right, Space, Span, WhiteSpace} from "~/styledComponents/shared";
import Profile from "~/components/common/cards/Profile";
import {IoMdHeart} from 'react-icons/io'
import {IoChatbubble} from 'react-icons/io5'
import {FaShareAlt} from 'react-icons/fa'
import {color} from "~/styledComponents/Properties";
import BasicSwiper from "~/components/common/swipers/BasicSwiper";
import {IoIosArrowDown} from 'react-icons/io'
import {Collapse} from "reactstrap";
import HashTagList from "~/components/common/hashTag/HashTagList";
import {useRecoilState} from "recoil";
import {boardTagModalState} from "~/recoilState";
import ComUtil from "~/util/ComUtil";
import {Server} from "~/components/Properties";
import {RiLeafFill} from 'react-icons/ri'
import LikeButtonSm from "~/components/common/buttons/LikeButtonSm";

import {withRouter} from  'react-router-dom'
import {FEED_TYPE} from "~/store";
import ShareButton from "~/components/common/buttons/ShareButton";
import BOARD_STORE from "~/components/shop/community/BoardStore";
import Zoomable from "react-instagram-zoom";

const options = {
    lazy: true,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true
    },
}

const FeedCard = ({
                      uniqueKey, //writingId, orderSeq
                      type, //board, , goodsReview,
                      //profileUrl, nickname, farmName, level, consumerNo, producerNo,
                      images,
                      myLike,
                      likesCount, repliesCount, content, tags, date, maxLength = 60,
                      profileInfo,
                      bestReview,
                      history,
                      boardType,
                      stepIndex, //0>이면 재배이력
                      consumerNo
                  }) => {

    const [tagModalState, setTagModalState] = useRecoilState(boardTagModalState)
    const [visible, setVisible] = useState(false)
    const onVisibleClick = () => {
        setVisible(true)
    }
    const openTagModal = ({tag}) => {
        setTagModalState({
            isOpen: true,
            tag: tag,
        })
    }

    const movePage = () => {
        let url = '';

        switch (type) {
            case FEED_TYPE.BOARD :
            case FEED_TYPE.PRODUCER :
                url = `/community/board/${uniqueKey}`
                break;
            case FEED_TYPE.GOODS_REVIEW :
                url = `/goodsReviewDetail/${uniqueKey}`
                break;

        }

        // if (type === FEED_TYPE.BOARD || type === FEED_TYPE.PRODUCER) {
        //     url = `/community/board/${uniqueKey}`
        // }else if (type === FEED_TYPE.PRODUCER) {
        //     url = `/community/board/${uniqueKey}`
        // }else if(type === FEED_TYPE.GOODS_REVIEW){
        //     url = `/goodsReviewDetail/${uniqueKey}`
        // }

        history.push(url)
    }

    const onShareClick = (writingId) => {
        console.log(writingId)
        ComUtil.kakaoLinkBoardShare(writingId, content)
    }
    const onReviewShareClick = (orderSeq) => {
        ComUtil.kakaoLinkReviewShare(orderSeq, content)
    }

    const boardKindText = () => {
        if (type === 'goodsReview') return '상품리뷰'
        else { //type === 'board'
            if (boardType === 'producer') {
                if (consumerNo == 900000125) return '샵블리 소식';  //샵블리 오피셜
                return (stepIndex > 0)? '생산일지':'농장소식';
            }
            else {
                return BOARD_STORE[boardType].name;
            }
        }
    }
    const moveTo = () => {
        if (type === 'goodsReview') history.push('/community/goodsReviewMain')
        else { //type === 'board'
            history.push('/community/boardMain/' + boardType)
        }
    }

    return (
        <Div py={16}>
            <Flex mb={16}>
                <Profile {...profileInfo} />
                { bestReview?
                    <Right>
                        <Div py={4} px={10} fontSize={12} bc={'warning'} fg={'warning'} bg={'white'} rounded={16}>우수리뷰</Div>
                    </Right>
                    :''
                }
            </Flex>
            <Div mb={16} onClick={movePage} cursor={1}>
                <BasicSwiper options={options}>
                    {
                        images.map(image =>
                            <div key={image.imageNo}>
                                <Img
                                     className={'swiper-lazy'}
                                     src={Server.getThumbnailURL() + image.imageUrl}
                                     cover={1}
                                     style={{maxHeight: 'calc(100vmin - 32px)'}}
                                     rounded={4}
                                     alt={image.imageNm} />
                                <div className="swiper-lazy-preloader swiper-lazy-preloader-white" />
                            </div>
                        )
                    }
                </BasicSwiper>
            </Div>
            <Space spaceGap={18} mb={16}>
                <LikeButtonSm type={type} uniqueKey={uniqueKey} />
                {/*<Div>*/}
                {/*    <IoMdHeart size={25} color={myLike ? color.danger : color.secondary}/>*/}
                {/*    <Span fontSize={12} fg={'secondary'} ml={12}>{likesCount}</Span>*/}
                {/*</Div>*/}
                <Div onClick={movePage}>
                    <IoChatbubble size={23} color={color.secondary}/>
                    <Span fontSize={12} fg={'secondary'} ml={12}>{repliesCount}</Span>
                </Div>

                {type == 'board' &&
                <Div>
                    {/*<FaShareAlt size={20} color={color.secondary} />*/}
                    <ShareButton onClick={onShareClick.bind(this, uniqueKey)}/>
                </Div>
                }
                {type == 'goodsReview' &&
                <Div>
                    {/*<FaShareAlt size={20} color={color.secondary} />*/}
                    <ShareButton onClick={onReviewShareClick.bind(this, uniqueKey)}/>
                </Div>
                }
            </Space>
            <Div>
                <WhiteSpace //lineClamp={3}
                    wordBreak={'keep-all'}
                    mb={14} fontSize={14}
                    cursor={1}
                >
                    <Span onClick={movePage} doActive lineHeight={26} style={{lineBreak: 'anywhere'}}>
                        {
                            !visible && (content.length > maxLength ? `${content.substr(0, maxLength -4)}...` : content)
                        }
                        {
                            visible && content
                        }
                    </Span>

                    {
                        !visible && content.length > maxLength && <Span fg={'green'} onClick={onVisibleClick}> 더보기<IoIosArrowDown /></Span>
                    }
                </WhiteSpace>
                {/*<Collapse isOpen={visible}>*/}
                {/*</Collapse>*/}
                {
                    tags && tags.length > 0 && (
                        <Div pb={14}>
                            <HashTagList tags={tags} isViewer={true} onClick={openTagModal} />
                        </Div>
                    )
                }
            </Div>
            {/*<Span fg={'secondary'} fontSize={12} lineHeight={12}>{ComUtil.utcToString(date, 'YY.MM.DD')}</Span>*/}
            <Flex>
                <Span fg={'green'} mr={5} fontSize={12} lineHeight={12} onClick={moveTo}>{boardKindText()}</Span>
                <Span fg={'secondary'} fontSize={12} lineHeight={12}>{ComUtil.timeFromNow(date)}</Span>
            </Flex>
        </Div>
    );
};

//최적화 (리렌더링 방지) 하기 위해 React.memo 추가
//props 를 object 로 받지 않아서, 별도의 useCallback 은 필요가 없이 리렌더링이 알아서 방지 됨
export default React.memo(withRouter(FeedCard));