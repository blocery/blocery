import React, {useMemo, useState} from 'react';
import {withRouter} from 'react-router-dom'
import {Div, Span, Flex, Img} from "~/styledComponents/shared";

import BOARD_STORE from "~/components/shop/community/BoardStore";
import {color} from "~/styledComponents/Properties";
import ComUtil from "~/util/ComUtil";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import useImg from "~/hooks/useImg";
import {SummerNoteIEditorViewer} from "~/components/common";

const BoardCard = ({writingId, content,
                       images, jjalImages,
                       repliesCount, boardType, writer, writeDate, stepIndex, consumerNo,
                       onClick,
                       history, isFeed}) => {

    const {imageUrl, onError} = useImg(images, TYPE_OF_IMAGE.SMALL_SQUARE)

    const movePage = () => {

        if (onClick && typeof onClick === 'function')
            onClick()

        let MOVE_URL = `/community/board/${writingId}`
        if (isFeed) //생산자 Feed(재비이력포함) 작성으로 이동.
            MOVE_URL = `/mypage/producer/feed/${writingId}`

        //스타일의 transition 을 통해 0.2초 간의 부드러운 애니메이션 되는 과정을 보기위해 페이크를 줌(웹이아닌 앱처럼 느끼게 함)
        //스크롤 위치 기억이 안되는 버그가 가끔 발생 하는것 같아 일단 await 안하도록 처리
        // await ComUtil.delay(200)

        history.push(MOVE_URL)
        // setTimeout(() => history.push(MOVE_URL), 200)
    }

    const boardKindText = () => {
        if (boardType === 'producer') {
            if (consumerNo === 900000125) return '샵블리 소식';  //샵블리 오피셜
            return (stepIndex > 0)? '생산일지':'농장소식';
        }
        else {
            return BOARD_STORE[boardType].name;
        }
    }

    return (
        <Flex alignItems={'flex-start'} bc={'veryLight'} bt={0} bl={0} br={0} px={16} py={13} cursor={1}
              custom={`
                transition: 0.2s;
                &:active {
                    background-color: ${color.veryLight};
                }
              `}

              onClick={movePage}
        >
            {
                ( images && images.length > 0 ) ? (
                    <Div width={50} height={50} flexShrink={0} mr={8}>
                        <Img height={'100%'} cover rounded={2} onError={onError} src={imageUrl} alt={images[0].imageNm}/>
                    </Div>
                ) : (jjalImages && jjalImages.length > 0 && jjalImages[0].imageThumbUrl) ? (
                    <Div width={50} height={50} flexShrink={0} mr={8}>
                        <Img height={'100%'} cover rounded={2} onError={onError} src={jjalImages[0].imageThumbUrl} alt={jjalImages[0].imageNm}/>
                    </Div>
                ) : null

            }
            <Div fontSize={14} flexGrow={1}>
                <Flex bold>
                    <Div lineClamp={1} style={{lineBreak: 'anywhere'}}>
                        <SummerNoteIEditorViewer initialValue={content} />
                    </Div>
                    <Div fg={'green'} flexShrink={0} pl={2}>
                        {
                            repliesCount > 0 && `(${repliesCount})`
                        }
                    </Div>
                </Flex>
                <Div mt={3} fontSize={12}>
                    <Span fg={'green'}>{boardKindText()}</Span>
                    <Span mx={8} fg={'dark'}>{writer}</Span>
                    <Span fg={'secondary'}>{ComUtil.timeFromNow(writeDate)}</Span>
                </Div>
            </Div>
        </Flex>
    );
};

export default withRouter(BoardCard);