import React, {useEffect, useState} from 'react';
import useLike from "~/hooks/useLike";
import {getLoginUserType} from "~/lib/loginApi";
import {Webview} from "~/lib/webviewApi";
import {likedGoodsReview, likedBoard, getGoodsReviewLikesCount, getBoardLikesCount} from "~/lib/shopApi";
import {Button, Span} from "~/styledComponents/shared";
import {color} from "~/styledComponents/Properties";
import styled, {css, keyframes} from 'styled-components'
import usePrevious from "~/hooks/usePrevious";
import ComUtil from "~/util/ComUtil";
import {AiOutlineLike} from 'react-icons/ai'
import LikeButton from "~/components/common/buttons/LikeButton";
import useLogin from "~/hooks/useLogin";

function getFetchFunction(type) {
    if (type === 'goodsReview') {
        return getGoodsReviewLikesCount
    }
    else if (type === 'board') {
        return getBoardLikesCount
    }
}

const Like = React.memo(({type, uniqueKey
                             // , myLike
}) => {

    const {likesCount, myLike, loading, refreshLikesCount, addLikedCount} = useLike({params: uniqueKey, type: type})

    // 이전값 용도
    const prevCount = usePrevious(likesCount)
    // const [stateIsLiked, setStateIsLiked] = useState(myLike);
    // const [yAxis, setYAxis] = useState()



    const onClick = async () => {

        addLikedCount()

        // if (type === 'goodsReview') {
        //     await likedGoodsReview(uniqueKey);
        // }else if (type === 'board'){
        //     await likedBoard(uniqueKey);
        // }
        // if (!stateIsLiked) {
        //     setStateIsLiked(true);
        // } else {
        //     setStateIsLiked(false);
        // }
        //
        // // setPlayState('running')
        //
        // refreshLikesCount()
        // // setPlay('paused')
    }

    const [likeUp, setLikeUp] = useState(false)

    //orderSeq 가 바뀌면 state를 새로 갱신해야함
    useEffect(() => {
        refreshLikesCount()
        // setStateIsLiked(myLike)
    }, [uniqueKey])

    useEffect(() => {
        //이전 값과 비교하여 더 커졌는지 아닌지 구분
        if (!loading) {
            if (likesCount > prevCount) {
                //위로
                setLikeUp(true)
            }else{
                //아래로
                setLikeUp(false)
            }
        }
    }, [likesCount])

    return(
        <LikeButton
            onClick={onClick}
            liked={myLike}
            up={likeUp}
            likesCount={likesCount}
        />

    )
})
export default Like
// import React, {useEffect, useState} from 'react';
// import useLike from "~/hooks/useLike";
// import {getLoginUserType} from "~/lib/loginApi";
// import {Webview} from "~/lib/webviewApi";
// import {likedGoodsReview, getGoodsReviewLikesCount} from "~/lib/shopApi";
// import {Button, Span} from "~/styledComponents/shared";
// import {color} from "~/styledComponents/Properties";
// import styled, {css, keyframes} from 'styled-components'
// import usePrevious from "~/hooks/usePrevious";
// import ComUtil from "~/util/ComUtil";
// import {AiOutlineLike} from 'react-icons/ai'
//
// const moveUp = (yAxis) => keyframes`
//     0% {
//         transform: translateY(0%);
//         -webkit-filter: blur(0px);
//     }
//     50% {
//         transform: translateY(${yAxis}%);
//         opacity: 0.4;
//         -webkit-filter: blur(1px);
//     }
//     100% {
//         transform: translateY(0%);
//         -webkit-filter: blur(0px);
//     }
//   `
//
//
// const animationMoveUp = css`
//     animation: ${moveUp(-20*5)} 0.3s ease-in-out;
// `
//
// const StyledButton = styled(Button)`
//
//     display: flex;
//     align-items: center;
//
//     ${props => props.liked ? `
//         color: ${color.green};
//         border: 3px solid ${color.green};
//     `: `
//         color: ${color.dark};
//         border: 3px solid ${color.dark};
//     `}
//
//
//     & > span:first-child {
//         position: relative;
//         display: inline-block;
//         ${props => props.up ? animationMoveUp : 'animation: unset'};
//     }
//
// `;
//
// const LikeButton = ({goodsReview}) => {
//
//     if (!goodsReview) return '...'
//
//     const {likesCount, loading, refreshLikesCount} = useLike({params: goodsReview.orderSeq, fetchFunction: getGoodsReviewLikesCount})
//     // 이전값 용도
//     const prevCount = usePrevious(likesCount)
//     const [stateIsLiked, setStateIsLiked] = useState(goodsReview.myLike);
//     // const [yAxis, setYAxis] = useState()
//
//     const onClick = async () => {
//
//         //유저 로그인 체크
//         const { data: userType } = await getLoginUserType()
//         if(userType !== 'consumer'){
//             Webview.openPopup('/login')
//             return
//         }
//
//         await likedGoodsReview(goodsReview.orderSeq);
//
//         if (!stateIsLiked) {
//             setStateIsLiked(true);
//
//         } else {
//             setStateIsLiked(false);
//         }
//
//         // setPlayState('running')
//
//         refreshLikesCount()
//         // setPlay('paused')
//     }
//
//     const [likeUp, setLikeUp] = useState(false)
//
//     //orderSeq 가 바뀌면 state를 새로 갱신해야함
//     useEffect(() => {
//         refreshLikesCount()
//         setStateIsLiked(goodsReview.myLike)
//     }, [goodsReview.orderSeq])
//
//     useEffect(() => {
//         //이전 값과 비교하여 더 커졌는지 아닌지 구분
//         if (!loading) {
//             if (likesCount > prevCount) {
//                 //위로
//                 setLikeUp(true)
//             }else{
//                 //아래로
//                 setLikeUp(false)
//             }
//         }
//     }, [likesCount])
//
//     return(
//         <StyledButton
//             px={12}
//             bw={3}
//             rounded={19}
//             onClick={onClick}
//             liked={stateIsLiked}
//             // yAxis={yAxis}
//             up={likeUp}
//         >
//             {/*{`${likesCount} 도움돼요`}*/}
//             <Span lineHeight={0}><AiOutlineLike size={20}/></Span>
//             <span>{ComUtil.addCommas(likesCount)}</span>
//         </StyledButton>
//     )
// }
// export default LikeButton