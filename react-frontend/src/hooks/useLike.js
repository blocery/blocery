import React, {useState, useEffect} from 'react';
import useInterval from "~/hooks/useInterval";
import useLogin from "~/hooks/useLogin";

const useLike = ({params, fetchFunction, type}) => {

    const {isServerLoggedIn} = useLogin()

    const [likesCount, setLikesCount] = useState(0)
    const [myLike, setMyLike] = useState()
    const [delay, setDelay] = useState(null)
    const [loading, setLoading] = useState(true)

    //카운트 조회
    const search = async () => {

        let fetchFunction;

        if (type === 'goodsReview'){
            const {getGoodsReviewLikeInfo} = await import('~/lib/shopApi')
            fetchFunction = getGoodsReviewLikeInfo;
        }
        else if (type === 'board'){
            const {getBoardWritingLikeInfo} = await import('~/lib/shopApi')
            fetchFunction = getBoardWritingLikeInfo;
        }

        const {status, data} = await fetchFunction(params)
        if (status === 200) {
            // data.likedCount
            // data.myLike
            return data
        }

        return {
            likesCount: 0,
            myLike: false
        }
    }

    //카운트 업데이트 및 딜레이 계속
    const refreshLikesCount = async () => {

        setDelay(null)

        const {likesCount, myLike} = await search()
        setLikesCount(likesCount)
        setMyLike(myLike)

        //setLikesCount 이후 loading 을 false 로 처리해야 페이지 로드시 애니메이션이 되지 않도록 제어 가능
        if (loading) {
            setLoading(false)
        }

        setDelay(delay || 3000)
    }

    const justRefreshLikesCount = async () => {
        const {likesCount, myLike} = await search()
        setLikesCount(likesCount)
        setMyLike(myLike)

        console.log(likesCount, myLike)

        //setLikesCount 이후 loading 을 false 로 처리해야 페이지 로드시 애니메이션이 되지 않도록 제어 가능
        if (loading) {
            setLoading(false)
        }
    }

    //좋아요 증가 혹은 감소
    const addLikedCount = async () => {
        if (await isServerLoggedIn()){
            if (type === 'goodsReview') {
                const { likedGoodsReview } =  await import('~/lib/shopApi')
                const {data} = await likedGoodsReview(params)
                setLikesCount(data.likesCount)
                setMyLike(data.myLike)
                return data.myLike
            }
            else if (type === 'board' || type === 'producer') {
                const { likedBoard } =  await import('~/lib/shopApi')
                const {data} = await likedBoard(params)
                setLikesCount(data.likesCount)
                setMyLike(data.myLike)
                return data.myLike
            }
        }
    }

    useInterval(() => {
        refreshLikesCount()
    }, delay)

    return {likesCount, myLike, loading, refreshLikesCount, justRefreshLikesCount, setDelay, addLikedCount}
};

export default useLike;


// import React, {useState, useEffect} from 'react';
// import {getConsumer, getGoodsReviewLikesCount} from "~/lib/shopApi";
// import useInterval from "~/hooks/useInterval";
//
// const initialDelay = 5000
//
// const useLike = (orderSeq) => {
//     const [likesCount, setLikesCount] = useState(0)
//     const [delay, setDelay] = useState(null)
//     const [loading, setLoading] = useState(true)
//
//     useEffect(() => {
//         async function fetch() {
//             // console.log('useLike useEffect')
//             await refreshLikesCount()
//             setLoading(false)
//         }
//         fetch()
//     }, [])
//
//     //카운트 조회
//     const refreshLikesCount = async () => {
//
//         setDelay(null)
//
//         const {status, data} = await getGoodsReviewLikesCount(orderSeq)
//         if (status === 200) {
//
//             console.log('refresh orderSeq'+orderSeq)
//
//             setLikesCount(data)
//         }
//
//         setDelay(initialDelay)
//     }
//
//     useInterval(() => {
//         console.log({delay})
//         refreshLikesCount()
//     }, delay)
//
//     // const startDelay = (customDelay) => setDelay(customDelay ? customDelay : initialDelay)
//     const stopDelay = () => setDelay(null)
//
//     return {likesCount, loading, refreshLikesCount, stopDelay, setDelay}
// };
//
// export default useLike;

// import React, {useState, useEffect} from 'react';
// import {getGoodsReviewLikesCount} from "~/lib/shopApi";
// import useInterval from "~/hooks/useInterval";
//
//
// const useLike = (orderSeq) => {
//     const [likesCount, setLikesCount] = useState(0)
//     const [delay, setDelay] = useState(null)
//     const [loading, setLoading] = useState(true)
//
//     //카운트 조회
//     const search = async () => {
//         const {status, data} = await getGoodsReviewLikesCount(orderSeq)
//         if (status === 200) {
//
//             return data
//         }
//     }
//
//     //카운트 업데이트 및 딜레이 계속
//     const refreshLikesCount = async () => {
//
//         setDelay(null)
//
//         const count = await search()
//         setLikesCount(count)
//
//         //setLikesCount 이후 loading 을 false 로 처리해야 페이지 로드시 애니메이션이 되지 않도록 제어 가능
//         if (loading) {
//             setLoading(false)
//         }
//
//         setDelay(delay || 3000)
//     }
//
//     const justRefreshLikesCount = async () => {
//         const count = await search()
//         setLikesCount(count)
//
//         //setLikesCount 이후 loading 을 false 로 처리해야 페이지 로드시 애니메이션이 되지 않도록 제어 가능
//         if (loading) {
//             setLoading(false)
//         }
//     }
//
//     useInterval(() => {
//         refreshLikesCount()
//     }, delay)
//
//     return {likesCount, loading, refreshLikesCount, justRefreshLikesCount, setDelay}
// };
//
// export default useLike;
//
//
// // import React, {useState, useEffect} from 'react';
// // import {getConsumer, getGoodsReviewLikesCount} from "~/lib/shopApi";
// // import useInterval from "~/hooks/useInterval";
// //
// // const initialDelay = 5000
// //
// // const useLike = (orderSeq) => {
// //     const [likesCount, setLikesCount] = useState(0)
// //     const [delay, setDelay] = useState(null)
// //     const [loading, setLoading] = useState(true)
// //
// //     useEffect(() => {
// //         async function fetch() {
// //             // console.log('useLike useEffect')
// //             await refreshLikesCount()
// //             setLoading(false)
// //         }
// //         fetch()
// //     }, [])
// //
// //     //카운트 조회
// //     const refreshLikesCount = async () => {
// //
// //         setDelay(null)
// //
// //         const {status, data} = await getGoodsReviewLikesCount(orderSeq)
// //         if (status === 200) {
// //
// //             console.log('refresh orderSeq'+orderSeq)
// //
// //             setLikesCount(data)
// //         }
// //
// //         setDelay(initialDelay)
// //     }
// //
// //     useInterval(() => {
// //         console.log({delay})
// //         refreshLikesCount()
// //     }, delay)
// //
// //     // const startDelay = (customDelay) => setDelay(customDelay ? customDelay : initialDelay)
// //     const stopDelay = () => setDelay(null)
// //
// //     return {likesCount, loading, refreshLikesCount, stopDelay, setDelay}
// // };
// //
// // export default useLike;