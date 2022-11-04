import React, {Fragment, useCallback} from 'react';
import {Div, Flex, Img, Right, Space, Span, WhiteSpace} from "~/styledComponents/shared";
import {IconStarGroup} from '~/components/common/icons'
import ComUtil from "~/util/ComUtil";
import {useHistory} from 'react-router-dom'
import Profile from "~/components/common/cards/Profile";
import useImageViewer from "~/hooks/useImageViewer";
import LikeButtonSm from "~/components/common/buttons/LikeButtonSm";
import ReplyButton from "~/components/common/buttons/ReplyButton";
import {FiBox} from 'react-icons/fi'
import {FiEdit, FiTrash} from 'react-icons/fi'
import {BsFullscreen, BsArrowsFullscreen} from 'react-icons/bs'
import {FaExpand} from 'react-icons/fa'
import {BiExpand} from 'react-icons/bi'
import {RiAlarmWarningLine} from 'react-icons/ri'

import {color} from "~/styledComponents/Properties";
import {LazyLoadImage} from "react-lazy-load-image-component";
const height = '25vmin'
const maxHeight = 100
const imageHeight = 60 //vmin

const GoodsReviewCard = ({
                                      data,
                                      showGoodsNm = false,
                                      showEdit = false,
                                      isProducer = false,
                                      onClick,
                                      onProfileClick,
                                      onLikeClick = () => null,
                                      onEditClick = () => null,
                                      // onDeleteClick = () => null,
                                  }) => {

    const history = useHistory()

    const {profile, orderSeq, goodsReviewContent, consumerName, nickname, email, score, goodsReviewImages, goodsImages, goodsNm, goodsNo, goodsReviewDate, repliesCount,
        likesCount, profileInfo, blinded
    } = data

    // console.log({goodsReview: data})

    const onGoodsReviewClick = useCallback(() => history.push(`/goodsReviewDetail/${orderSeq}`), [orderSeq])
    // const onGoodsClick = useCallback(() => history.push(`/goods?goodsNo=${goodsNo}`), [goodsNo])
    const onGoodsClick = e => {
        e.stopPropagation()
        history.push(`/goods?goodsNo=${goodsNo}`)
    }


    // const [state, setState] = useRecoilState(imageViewerModalState)
    const {openImageViewer} = useImageViewer()

    const onExpandImageClick = (e) => {
        e.stopPropagation()
        e.preventDefault()
        openImageViewer(goodsReviewImages, 0)
    }

    const onReviewShareClick = (orderSeq) => {
        // ComUtil.kakaoLinkReviewShare(orderSeq)
    }

    const onHandleClick = () => {
        if (onClick && typeof onClick === 'function') {
            onClick()
        }else{
            history.push(`/goodsReviewDetail/${orderSeq}`)
        }
    }

    const _onProfileClick = () => {
        if (onProfileClick && typeof onProfileClick === 'function') {
            onProfileClick()
        }else{
            history.push(`/goodsReviewDetail/${orderSeq}`)
        }
    }

    return (
        <Div bg={'white'} px={16} pt={16} pb={20} onClick={onHandleClick}>


            {blinded &&
            <Div fg={'danger'} bold ml={8} br={0}>
                <Span bg={'background'}><RiAlarmWarningLine/> 관리자에 의해 블라인드 처리 됨</Span>
            </Div>
            }

            {/* 별점, 리뷰일시 */}
            <Flex mb={5} fontSize={13} ml={52}>
                <Fragment>
                    <IconStarGroup score={score} size={14}/>
                    <Div ml={8}>
                        {score}
                    </Div>
                </Fragment>
                <Right fg={'dark'}>
                    {ComUtil.timeFromNow(goodsReviewDate)}
                </Right>
            </Flex>

            {/* Profile */}
            <Div mb={10}>
                <Profile {...profileInfo} onClick={_onProfileClick}/>
            </Div>


            <Div ml={52}>
                {
                    showGoodsNm && (
                        <Flex fg={'green'} fontSize={13}
                            // alignItems={'flex-start'}
                              mt={14}
                        >
                            <Div mr={5}>
                                <FiBox />
                            </Div>
                            <Div lineClamp={1} cursor
                                 onClick={onGoodsClick}
                            >
                                {goodsNm}
                            </Div>
                        </Flex>
                    )
                }

                {/* 리뷰 텍스트 */}
                <WhiteSpace
                    mt={2}
                    mb={16}
                    lineClamp={3}
                    lineHeight={23}
                    cursor={1}
                    // onClick={onGoodsReviewClick}
                >
                    {goodsReviewContent}
                </WhiteSpace>

                {/* 리뷰 사진 */}
                {goodsReviewImages.length > 0 &&
                <Div relative overflow={'hidden'} rounded={8} cursor={1}>
                    <div style={{position: 'absolute', bottom: 0, right: 0, zIndex: 1}} onClick={onExpandImageClick}>
                        <Div relative
                             bg={'rgba(0,0,0, 0.1)'}
                             p={10}
                             custom={`
                                border-top-left-radius: 8px;
                             `}
                        >
                            <BiExpand color={color.white} size={24} />
                        </Div>
                    </div>
                    <LazyLoadImage
                        wrapperClassName={'wrapper-lazy-image'}
                        alt={'photo review'}
                        // height={image.height}
                        src={ComUtil.getFirstImageSrc(goodsReviewImages)} // use normal <img> attributes as props
                        // width={image.width}
                        effect="blur"
                        style={{objectFit: 'cover', cursor: 'pointer', height: '44vmin'}}
                        placeholderSrc={'/lazy/gray_lazy_1_1.jpg'}
                        width={'100%'}
                        // onError={onError}
                    />
                </Div>
                }
                {/* 좋아요 및 댓글 수 */}
                <Flex mt={14} lineHeight={14}>
                    <Space spaceGap={15} fontSize={14}
                        // onClick={onGoodsReviewClick}
                           cursor={1}>
                        <LikeButtonSm uniqueKey={orderSeq} type={'goodsReview'} />
                        <ReplyButton>
                            {repliesCount}
                        </ReplyButton>

                        {/*<ShareButton onClick={onReviewShareClick.bind(this, orderSeq)}/>*/}
                    </Space>
                    <Right>
                        {   //생산자는 편집/삭제는 제외.
                            !isProducer && showEdit &&
                            <Space fg={'green'} spaceGap={13}>
                                <FiEdit style={{cursor: 'pointer'}} onClick={onEditClick} size={16}/>
                                {/*<FiTrash style={{cursor: 'pointer'}} onClick={onDeleteClick} size={16}/>*/}
                            </Space>
                        }
                    </Right>

                </Flex>
            </Div>









            {/*<Flex alignItems={'flex-start'} onClick={onGoodsReviewClick} cursor={1}>*/}
            {/*    {*/}
            {/*        goodsReviewImages.length > 0 && (*/}
            {/*            <Div mr={16} width={height} height={height} maxWidth={maxHeight} maxHeight={maxHeight} flexShrink={0}>*/}
            {/*                <Img*/}
            {/*                    rounded={8}*/}
            {/*                    width={'100%'}*/}
            {/*                    height={'100%'}*/}
            {/*                    cover*/}
            {/*                    src={ComUtil.getFirstImageSrc(goodsReviewImages, true)}*/}
            {/*                    // src={"https://image.fmkorea.com/files/attach/new/20200508/486616/2109867715/2897961399/6bfc50bdf9f98aa6a1be1e57de3aa4e2.jpg"}*/}
            {/*                    alt="포토리뷰"*/}
            {/*                    onClick={onImageClick}*/}
            {/*                />*/}
            {/*            </Div>*/}
            {/*        )*/}
            {/*    }*/}
            {/*    <Div flexGrow={1}*/}
            {/*        // height={'30vmin'}*/}
            {/*    >*/}
            {/*        <Div*/}

            {/*            style={{*/}
            {/*                wordBreak: 'break-word',*/}
            {/*                whiteSpace: 'pre-wrap'*/}
            {/*            }}*/}
            {/*            mb={5}*/}
            {/*            lineClamp={3}*/}
            {/*            lineHeight={23}*/}
            {/*        >*/}
            {/*            {goodsReviewContent}*/}
            {/*        </Div>*/}


            {/*    </Div>*/}
            {/*</Flex>*/}

            {/*{*/}
            {/*    showGoodsNm && (*/}
            {/*        <Flex fg={'green'} fontSize={13}*/}
            {/*            // alignItems={'flex-start'}*/}
            {/*              mt={14}*/}
            {/*        >*/}
            {/*            <Div mr={5}>*/}
            {/*                <FiBox />*/}
            {/*            </Div>*/}
            {/*            <Div lineClamp={1} cursor onClick={onGoodsClick}>*/}
            {/*                {goodsNm}*/}
            {/*            </Div>*/}
            {/*        </Flex>*/}
            {/*    )*/}
            {/*}*/}
            {/*<Flex mt={14} lineHeight={14}>*/}
            {/*    <Space spaceGap={20} fontSize={14} onClick={onGoodsReviewClick} cursor={1}>*/}
            {/*        <LikeButtonSm uniqueKey={orderSeq} type={'goodsReview'} />*/}
            {/*        <ReplyButton>*/}
            {/*            {repliesCount}*/}
            {/*        </ReplyButton>*/}
            {/*    </Space>*/}
            {/*    <Right>*/}
            {/*        {   //생산자는 편집/삭제는 제외.*/}
            {/*            !isProducer && showEdit &&*/}
            {/*            <Space fg={'green'} spaceGap={13}>*/}
            {/*                <FiEdit style={{cursor: 'pointer'}} onClick={onEditClick} size={16}/>*/}
            {/*                <FiTrash style={{cursor: 'pointer'}} onClick={onDeleteClick} size={16}/>*/}
            {/*            </Space>*/}
            {/*        }*/}
            {/*    </Right>*/}

            {/*</Flex>*/}


        </Div>
    );
};

export default GoodsReviewCard