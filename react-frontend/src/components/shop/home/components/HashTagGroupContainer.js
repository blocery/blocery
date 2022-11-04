import React, {useEffect, useState, useRef, useCallback} from 'react';
import {getHashTagGroupListByVisiblePage} from "~/lib/commonApi";
import HashTagGroup from "~/components/common/hashTag/HashTagGroup";
import {Div, Flex} from "~/styledComponents/shared";
import {Spinner} from "reactstrap";
import BoardList from "~/components/common/lists/BoardList";
import InfiniteScroll from "react-infinite-scroll-component";
import {Server} from "~/components/Properties";
import ComUtil from "~/util/ComUtil";
import {isForceUpdate} from "~/lib/axiosCache";
import {withRouter, useHistory} from "react-router-dom"
// const SPLICE_NUMBER = 3

const HashTagGroupContainer = ({visiblePage, producerNo}) => {


    const history = useHistory()

    const abortControllerRef = useRef(new AbortController());
    const [list, setList] = useState([])

    /* infinite 사용시 */
    // const allListRef = useRef([])
    // const [hasMore, setHasMore] = useState(true)


    // const onceSearch = () => {
    //     let abortController;// 2. A
    //     return async (query, params, data) =>  {
    //         if (abortController && !abortController.signal.aborted) {
    //             console.log("aborted abortController: ", abortController)
    //             abortController.abort();
    //         }
    //         abortController = new AbortController();// 1. A
    //         console.log("now abortController: ", abortController)
    //
    //         try {
    //
    //             const res = await getHashTagGroupListByVisiblePage('local', props.producerNo, abortController.signal)
    //             console.log({res: res})
    //
    //             const result = res;
    //             return result;
    //
    //         }catch (error) {
    //             console.log("click aborted =========================")
    //         }
    //
    //
    //     }
    // }

    useEffect(() => {

        let promise = visiblePage === 'local' ?
            getHashTagGroupListByVisiblePage('local', producerNo, isForceUpdate(history), abortControllerRef.current.signal) :
            getHashTagGroupListByVisiblePage('store', 0, isForceUpdate(history), abortControllerRef.current.signal)

        async function fetch() {
            try{
                const res = await promise;
                setList(res.data)
            }catch (error) {
                if (error.message === 'canceled') {
                    console.log("Request cancelled : HashTagGroupContainer")
                }else{
                    console.log("Request error : HashTagGroupContainer")
                }
            }
        }

        fetch()

        return () => {
            abortControllerRef.current.abort();
        };

    }, [])

    const search = async () => {


        // const signal = abortController.current.signal
        // try {
        //     //이전방법
        //     let res;
        //     if(props && props.visiblePage === 'local') {
        //         res = await getHashTagGroupListByVisiblePage('local', props.producerNo, signal);
        //     } else {
        //         res = await getHashTagGroupListByVisiblePage('store', 0, signal) //스토어 홈
        //     }
        //
        //     if (res) {
        //         setList(res.data)
        //     }
        //
        // }catch (error) {
        //     if (error.message === 'canceled') {
        //         console.log("Request cancelled : HashTagGroupContainer")
        //     }else {
        //         console.log("Request error : HashTagGroupContainer")
        //     }
        // }

        /* infinite 사용시 */
        ///전체
        // allListRef.current = res.data
        //
        // //잘라서 넣기
        // const newItems = allListRef.current.splice(0, SPLICE_NUMBER)
        // if (newItems.length) {
        //     setList(newItems)
        // }else{
        //     setHasMore(false)
        // }
    }

    /* infinite 사용시 */
    // const fetchMoreData = () => {
    //     const newItems = allListRef.current.splice(0, SPLICE_NUMBER)
    //
    //     console.log("group",{current: allListRef.current, newItems})
    //
    //     if (newItems.length) {
    //         setList(list.concat(newItems))
    //     }else {
    //         console.log("setHasMore===false")
    //         setHasMore(false)
    //     }
    // }


    if (!list) return null

    /* infinite 사용시 */
    // return (
    //     <Div p={16}>
    //         <InfiniteScroll
    //             dataLength={list.length}
    //             next={fetchMoreData}
    //             hasMore={hasMore}
    //             loader={<Flex p={16} justifyContent={'center'}><Spinner color="success" /></Flex>}
    //         >
    //             {
    //                 list.map((hashTagGroup, index) =>
    //                     <div key={hashTagGroup.groupNo} style={{marginBottom: 30}}>
    //                         <HashTagGroup.Main key={index} hashTagGroup={hashTagGroup} />
    //                     </div>
    //                 )
    //             }
    //         </InfiniteScroll>
    //     </Div>
    // )

    return (
        <Div p={16}>
            {
                list.map((hashTagGroup, index) =>
                    <div key={hashTagGroup.groupNo} style={{marginBottom: 30}}>
                        <HashTagGroup.Main key={index} hashTagGroup={hashTagGroup} />
                    </div>
                )
            }
        </Div>
    );
};

export default withRouter(HashTagGroupContainer);
