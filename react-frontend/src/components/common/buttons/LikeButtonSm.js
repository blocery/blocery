import React, {useEffect, useState} from 'react';
import useLike from "~/hooks/useLike";
import {AiOutlineLike} from "react-icons/ai";
import {color} from "~/styledComponents/Properties";
import {getBoardLikesCount, getGoodsReviewLikesCount} from "~/lib/shopApi";
import {Div, Flex, Space} from "~/styledComponents/shared";
import {IoMdThumbsUp} from 'react-icons/io'

import useLogin from "~/hooks/useLogin";
import {AnimatedThumsUp} from '~/styledComponents/ShopBlyLayouts'

//type : goodsReview, board
const LikeButtonSm = ({type = 'goodsReview', uniqueKey}) => {

    const {likesCount, myLike, loading, refreshLikesCount, justRefreshLikesCount, setDelay, addLikedCount} = useLike({params: uniqueKey, type: type})
    const [scaleUp, setScaleUp] = useState(false)
    const {consumer} = useLogin()

    useEffect(() => {
        // console.log(`${uniqueKey}의 로그인 ${consumer ? 'O' : 'X'}`)
        justRefreshLikesCount()
    }, [consumer])

    // useEffect(() => {
    //     justRefreshLikesCount()
    // }, [uniqueKey])

    const onClick = async e => {
        e.stopPropagation()
        const isAdded = await addLikedCount();
        setScaleUp(isAdded)
    }

    return (
        <Div display={'inline-block'} onClick={onClick} fontSize={12} cursor={1}>
            <Space spaceGap={8}>
                <AnimatedThumsUp
                    scaleUp={scaleUp}
                    color={myLike ? color.danger : 'rgb(194, 194, 194)'}
                    size={25}
                />
                <Div fg={'secondary'}>{likesCount}</Div>
            </Space>
        </Div>
    );
};

export default LikeButtonSm;
