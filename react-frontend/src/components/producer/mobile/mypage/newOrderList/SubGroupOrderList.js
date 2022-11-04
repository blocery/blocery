import React, {useEffect, useRef, useState} from 'react';
import {
    getOrderDetailListByOrderSubGroupNos, getOrderSubGroupListByOrderSubGroupNos,
    getOrderSubGroupListLessThanNo,
    setLastSeenOrder, setOrderGroupConfirmWithBarcode
} from "~/lib/producerApi";
import Skeleton from "~/components/common/cards/Skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import {Div, Flex, Input, Right, Space} from "~/styledComponents/shared";
import ProducerOrderCard from "~/components/producer/mobile/common/ProducerOrderCard";
import useInterval from "~/hooks/useInterval";
import {
    BsArrowsAngleContract,
    BsArrowsAngleExpand,
    IoIosArrowDown, IoIosArrowUp,
    IoMdArrowDown,
    IoMdArrowUp,
    IoMdBarcode
} from "react-icons/all";
import {color} from "~/styledComponents/Properties";
import {Webview} from "~/lib/webviewApi";
import SpinnerLoading from "~/components/common/Spinner/SpinnerLoading";
import ProgressStateBadge from "~/components/producer/mobile/common/ProgressStateBadge";
import {FlexButton} from "~/components/producer/mobile/common/Style";

const SubGroupOrderList = (props) => {
    const [items, setItems] = useState([])
    const [hasMore, setHasMore] = useState(true)
    const [refreshDate, setRefreshDate] = useState(null)

    useEffect(() => {
        setLastSeenOrder()

        fetchMoreData(true)
    }, [])

    const fetchMoreData = async (isNewSearch) => {
console.log(isNewSearch+"=========================")
        const newItems = isNewSearch ? [] : [...items]
        console.log({startNewItems: newItems})

        const minOrderSubGroupNo = newItems.length > 0 ? newItems[newItems.length -1].orderSubGroup.orderSubGroupNo : 0
        // const orderSubGroupNo = isNewSearch ? 0 : minOrderSubGroupNo

        //주문 그룹 리스트 조회 (최신 10건)
        const {status: groupStatus, data: orderSubGroupList} =  await getOrderSubGroupListLessThanNo({orderSubGroupNo: minOrderSubGroupNo})

        console.log({groupStatus, orderSubGroupList})

        //주문그룹번호 list
        const orderSubGroupNoList = orderSubGroupList.map(orderSubGroup => orderSubGroup.orderSubGroupNo)

        console.log({orderSubGroupNoList})

        //주문 그룹 번호로 주문상세 리스트 조회
        const {status: detailStatus, data: orderDetailList} = await getOrderDetailListByOrderSubGroupNos(orderSubGroupNoList)

        console.log({detailStatus, orderDetailList})

        // const newItems = [...items]

        //orderSubGroup 에 orderDetailList 추가
        orderSubGroupList.map(group => {
            newItems.push({
                orderSubGroup: group,
                orderDetailList: orderDetailList.filter(detail => detail.orderSubGroupNo === group.orderSubGroupNo)
            })
        })

        console.log({newItems: newItems})

        setItems(newItems)

        if (orderSubGroupList.length === 0) {
            console.log('setHasMore(false)')
            setHasMore(false)
        }
    }

    const [collapsed, setCollapsed] = useState(false)

    const toggleCollapse = () => setCollapsed(prev => !prev)

    if (!items) return <SpinnerLoading />

    return(
        <div>
            <Space px={16} mb={16}>
                <FlexButton bc={'light'} onClick={toggleCollapse}>
                    {collapsed ? <BsArrowsAngleExpand/> : <BsArrowsAngleContract/>}
                    <span>{collapsed ? '펼치기' : '접기'}</span>
                </FlexButton>
            </Space>
            <div>
                <InfiniteScroll
                    // scrollableTarget={'subGroupOrderList'}
                    dataLength={items.length}
                    next={fetchMoreData.bind(this, false)}
                    hasMore={hasMore}
                    loader={<SpinnerLoading isMore={true} />}
                    refreshFunction={fetchMoreData.bind(this, true)}
                    pullDownToRefresh
                    pullDownToRefreshThreshold={100}
                    pullDownToRefreshContent={
                        <Div textAlign={'center'} fg={'green'}>
                            &#8595; 아래로 당겨서 업데이트
                        </Div>
                    }
                    releaseToRefreshContent={
                        <Div textAlign={'center'} fg={'green'}>
                            &#8593; 업데이트 반영
                        </Div>
                    }
                >
                    {
                        items.map(item =>
                            <Item key={item.orderSubGroup.orderSubGroupNo} data={item} collapsed={collapsed}/>
                        )
                    }
                </InfiniteScroll>
            </div>
        </div>
    )

};

export default SubGroupOrderList;


function Item({data, collapsed}) {

    const inputRef = useRef()
    const [errMsg, setErrMsg] = useState()
    const [isCollapsed, setCollapsed] = useState(collapsed)

    //{orderSubGroup, orderDetailList}
    const [item, setItem] = useState()
    const [refreshOrderDetail, setRefreshOrderDetail] = useState({orderSeq: null, date: null})

    const [errMsgDate, setErrMsgDate] = useState(null)

    useEffect(() => {
        console.log("============== <Item/> useEffect [data]")
        setItem(data)
    }, [data])

    useEffect(() => {
        if (collapsed !== isCollapsed) {
            console.log('접기...=====')
            setCollapsed(collapsed)
        }
    }, [collapsed])

    const check = async (barcode) => {

        try {
            // Webview.appLog("CHECK ========================"+barcode)//0

            //바코드로 주문확인
            const {status, data: errRes} = await setOrderGroupConfirmWithBarcode(item.orderSubGroup.orderSubGroupNo, barcode)
            // console.log({barcode, errRes: errRes})
            // Webview.appLog("status"+status)
            // Webview.appLog("errRes.resCode"+status.resCode)

            //백엔드에서 오류가 발생 하였을 경우
            if (status === 0) {
                setErrMsg('통신오류')
            }else if (status === 200) {
                //성공
                if (errRes.resCode === 0) {
                    //자식 새로고침 요청

                    const orderSeq = Number(errRes.retData)
                    setRefreshOrderDetail({orderSeq: orderSeq, date: (new Date()).getTime()})

                    const orderDetail = item.orderDetailList.find(detail => detail.orderSeq === orderSeq)
                    if (orderDetail) {
                        setErrMsg('[주문확인 완료] '+ orderDetail.goodsNm)
                        console.log("자식 새로고침 호출")
                    }

                }else{
                    setErrMsg(errRes.errMsg)
                }

                // setDelay(1000)
            }
        }catch (err){
            setErrMsg('잘못된 바코드 입니다.')
            console.error(err.message)
        }
    }

    //바코드 인식이 되면
    const onHandleKeyPress = async e => {

        const barcode = e.target.value

        // Webview.appLog(e.keyCode)//0

        if (e.key === 'Enter') {

            Webview.appLog("keypress ========================"+e.key)//0

            // setDelay(null)

            //중복체크는 이슈가 존재. 자식도 hook 이라서..

            console.log({no: item.orderSubGroup.orderSubGroupNo})


            await check(barcode)
            // //바코드로 주문확인
            // const {status, data: errRes} = await setOrderGroupConfirmWithBarcode(item.orderSubGroup.orderSubGroupNo, barcode)
            // console.log({barcode, errRes: errRes})
            //
            // if (status === 200) {
            //     //성공
            //     if (errRes.resCode === 0) {
            //         //자식 새로고침 요청
            //
            //         const orderSeq = Number(errRes.retData)
            //         setRefreshOrderDetail({orderSeq: orderSeq, date: (new Date()).getTime()})
            //
            //         const orderDetail = item.orderDetailList.find(detail => detail.orderSeq === orderSeq)
            //         if (orderDetail) {
            //             setErrMsg('[주문확인 완료] '+ orderDetail.goodsNm)
            //             console.log("자식 새로고침 호출")
            //         }
            //     }else{
            //         setErrMsg(errRes.errMsg)
            //     }
            //
            //     // setDelay(1000)
            // }

            //다시 찍도록 클리어
            inputRef.current.value = "";

            //에러메시지 노출
            setErrMsgDate((new Date()).getTime())

            e.target.focus()
            return
        }

        // //성공하면 해당 orderSeq 를 새로고침
        // const newItem =  {...item}
        // newItem.orderDetailList.find(od => od.orderSeq === orderSeq)
    }

    const onKeyUp = async e => {

        const barcode = e.target.value

        //space, enter, comma
        // if ([13, 32, 188].includes(keyCode)) {
        //keyCode는 deprecated되었음. 특히 모바일에서는 값으로 비교하는게 안전.
        if(e.key === 'Enter'){

            Webview.appLog("onKeyUp ========================"+e.key)//0

            await check(barcode)

            inputRef.current.value = '';
            inputRef.current.focus()
            inputRef.current.focus()
            //에러메시지 노출
            setErrMsgDate((new Date()).getTime())
            // e.target.focus()

            return false
        }

        // setDisplay('block')
    }

    if (!item) return null

    return(
        <div>
            <Flex cursor fontSize={14} bg={'black'} fg={'veryLight'} px={16} minHeight={44} custom={`border-bottom: 1px solid ${color.darkBlack};`} onClick={() => setCollapsed(prev => !prev)}>
                <Space spaceGap={8}>
                    {
                        isCollapsed ? <IoIosArrowDown size={16}/> : <IoIosArrowUp size={16}/>
                    }
                    <span>
                        <b>{item.orderSubGroup.localKey}</b> - {item.orderSubGroup.orderSubGroupNo}
                    </span>
                </Space>
                <Space spaceGap={8} ml={'auto'}>
                    <span>{item.orderDetailList.length}건</span>
                    <ProgressStateBadge orderSubGroupNo={item.orderSubGroup.orderSubGroupNo} progressState={item.orderSubGroup.progressState} />
                </Space>
            </Flex>

            <Div bc={'light'} bt={0} display={isCollapsed ? 'none': 'block'}>
                <div style={{borderBottom: `1px solid ${color.light}`}}>

                </div>
                <Div px={16} py={14} custom={`
                    border-bottom: 1px solid ${color.light}; 
                `}>
                    <Flex>
                        <IoMdBarcode size={25}/>
                        <Input ref={inputRef} ml={16}
                               type='search'
                               rounded={0} block placeholder={'클릭 후 바코드스캔(주문확인용)'} autocomplete="off"
                               onKeyPress={onHandleKeyPress}
                            // onKeyUp={onKeyUp}
                        />
                    </Flex>
                    {
                        errMsg && <IntervalMessage msg={errMsg} barcode={errMsgDate} />
                    }
                </Div>
                {
                    item.orderDetailList.map(orderDetail =>
                        <ProducerOrderCard
                            key={orderDetail.orderSeq}
                            orderDetail={orderDetail}
                            refreshDate={refreshOrderDetail.orderSeq === orderDetail.orderSeq && refreshOrderDetail.date}
                            //대체상품 정보 (바코드 찍힌 정보)
                            // replaceOrderInfo={(replaceOrderInfo && replaceOrderInfo[orderDetail.orderSeq]) ? replaceOrderInfo[orderDetail.orderSeq] : null}
                            //대체상품 요청 (native에 바코드 요청)
                            // onRequestReplaceOrderClick={onRequestReplaceOrderClick.bind(this, orderDetail)}
                            //대체상품 바코드 정보 front 변수 클리어
                            // onReplaceOrderCancelClick={onReplaceOrderCancelClick.bind(this, orderDetail)}
                            //대체상품 바코드 정보 front 변수 클리어(구분해서)
                            // onReplaceOrderClear={onReplaceOrderClear}
                            //TODO 살려야?
                            // refreshCountInfo={refreshCountInfo}

                            //2208 웹에서 바코드 읽는 Input
                            // webBarcodeRead = {(!ComUtil.isMobileApp() && webBarcodeMode && orderSeqRef.current===orderDetail.orderSeq)?true:false}
                            // onWebBarcodeReadDone={onWebBarcodeReadDone}
                            // onWebBarcodeReadCancel={onWebBarcodeReadCancel}

                        />
                    )
                }
            </Div>
        </div>
    )
}


function IntervalMessage({msg, barcode, children}) {
    const [delay, setDelay] = useState(1000)
    const [seconds, setSeconds] = useState(5)

    useEffect(() => {
        setSeconds(5)
        setDelay(1000)
    }, [barcode])

    //1초에 한번씩 돔
    useInterval(() => {
        const newSeconds = seconds - 1

        if (seconds === 1) {
            setDelay(null)
            setSeconds(5)
        }else{
            setSeconds(newSeconds)
        }
    }, delay)

    return (
        delay ? <Div fg={'danger'} mt={8}>{msg} {seconds}</Div> : null
    )

    // return(
    //     delay ? <div>{children} {seconds}</div> : null
    // )
}