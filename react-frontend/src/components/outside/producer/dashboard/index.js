
import React, {Fragment, useEffect, useState} from 'react';
import {
    AbsoluteMask,
    Div,
    Flex,
    GridColumns,
    JustListSpace,
    ListSpace,
    Right,
    Space,
    Span
} from "~/styledComponents/shared";
import styled, {css} from 'styled-components'
import {getOrderSubGroupListBetweenDate, getOrderDetailListByOrderSubGroupNos, getOrderCancelCnt, getReqOrderCancelCnt} from "~/lib/producerApi";
import BackNavigation from "~/components/common/navs/BackNavigation";
import Skeleton from "~/components/common/cards/Skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import ComUtil from "~/util/ComUtil";
import SubGroupLabel from "~/components/producer/mobile/common/SubGroupLabel";
import OrderCard from "./OrderCard";
import useInterval from "~/hooks/useInterval";
import Checkbox from "~/components/common/checkboxes/Checkbox";
import {Modal, ModalBody, ModalHeader, Spinner} from "reactstrap";
import moment from "moment-timezone";
import {color} from "~/styledComponents/Properties";
import {
    AiFillFire,
    MdClose,
    MdError,
    MdSignalWifiStatusbar2Bar,
    MdSignalWifiStatusbarConnectedNoInternet1
} from "react-icons/all";
import useLogin from "~/hooks/useLogin";
import theme from "~/styledComponents/theme";
import {getValue} from "~/styledComponents/Util";
import axios from "axios";
import {Server} from "~/components/Properties";
import LocalFarmerContent from "~/components/outside/producer/dashboard/LocalFarmerContent";

const LOGIN_SUCCESS = 'loginSuccess'
const SESSION_FIRED = 'sessionFired'
const NETWORK_ERROR = 'networkError'

//TODO 현재 배송시작이 4, 배송완료가 3 인것에 주의!

const CODE_SORT = [0,1,2,4,3,99]

const PROGRESS_STATE_CODE = {
    noAction: 'noAction',
    picking: 'picking',
    pickingCompleted: 'pickingCompleted',
    shippingStarted: 'shippingStarted',
    shippingCompleted: 'shippingCompleted',
    allCancelled: 'allCancelled'
}

const CODE = {
    0: {value: 0, name: '미작업', code: PROGRESS_STATE_CODE.noAction, color: color.primary},
    1: {value: 1, name: '피킹중', code: PROGRESS_STATE_CODE.picking, color: color.black},
    2: {value: 2, name: '피킹완료', code: PROGRESS_STATE_CODE.pickingCompleted, color: '#5DB96C'},
    4: {value: 4, name: '배송시작', code: PROGRESS_STATE_CODE.shippingStarted, color: color.black},
    3: {value: 3, name: '배송완료', code: PROGRESS_STATE_CODE.shippingCompleted, color: color.black},
    99: {value: 99, name: '그룹취소', code: PROGRESS_STATE_CODE.allCancelled, color: color.danger}
}

const initialCountInfo = {
    [PROGRESS_STATE_CODE.noAction]: 0,          //미확인 0
    [PROGRESS_STATE_CODE.picking]: 0,           //피킹중 1
    [PROGRESS_STATE_CODE.pickingCompleted]: 0,  //피킹완료 2
    [PROGRESS_STATE_CODE.shippingStarted]: 0,          //배송시작: 4
    [PROGRESS_STATE_CODE.shippingCompleted]: 0, //배송완료 3
    [PROGRESS_STATE_CODE.allCancelled]: 0,      //주문취소됨 99
}

const useDelay = false //false : 자동 새로고침 사용하기
const SECOND = 1000
const MINUTE = SECOND * 60
const DELAY = SECOND * 30                       //자동 새로고침 딜레이 시간
const ALERT_CLOSE_DELAY = MINUTE * 5            //신규 주문알림 닫힘 딜레이 시간 5분

//대시보드 메인 카운트 wrapper
const CountBoxWrapper = styled.div`
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    grid-column-gap: 1px;
    grid-row-gap: 1px;
    overflow: hidden;
    background-color: ${color.veryLight};
    border: 1px solid ${color.secondary};
    border-radius: ${getValue(4)};
   
    ${({theme}) => theme.tablet`
        grid-template-columns: repeat(3, 1fr);
    `}
`

const CountBox = styled.div`
    position: relative;
    cursor: pointer;
    padding: 14px 16px;
    background: white;
    transition: 0.2s;
    
    & > div:nth-child(1){
        font-size: 12px;
        color: ${p => p.active ? color.white : '#5f5f5f'};
    }
    & > div:nth-child(2){
        font-size: 35px;
        font-weight: lighter;
        color: ${p => p.active ? color.white : CODE[p.progressState].color};
        
        ${({theme}) => theme.tablet`
            font-size: 25px;
        `}
    }
    
    ${p => p.active && `
        background: ${CODE[p.progressState].color};
    `}
    
    ${({theme}) => theme.mobile`
        padding: 7px 9px;
    `}
`

//orderSubGroup list 의 wrapper
const ListBodyWrapper = styled.div`
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    // grid-column-gap: 16px;
    grid-row-gap: 16px;
    
    padding: 16px;
    border-top: 1px solid #dadfe8;
    
    ${({theme}) => theme.mobile`
        padding: 0;
        grid-row-gap: 4px;
        background-color: ${color.light};
    `}
`

const ProgressStateBadge = styled(Div)`
    font-size: 13px;
    color: white;
    border-radius: 4px;
    padding: 3px 8px;
    background-color: ${p => CODE[p.state].color};
`

function getProgressStateName(progressState) {
    try {
        if (progressState === null) return ''

        return CODE[progressState].name
    }catch (err) {
        console.error(err)
        return ''
    }
}

//생산자용 대시보드
const Dashboard = (props) => {

    //  @param  type=0 주문확인필요 (default)
    //          type=1 배송대기 orderConfrim="confirmed"
    //          type=2 출고완료 orderConfrim="shipping"

    // -1 최초 로그인 체크 중
    // 0 로그인 실패(생산자 로그인 필요)
    // 1 로그인 성공
    // 99 네트워크 에러
    const [pageStatus, setPageStatus] = useState(-1)
    const {modalOpen, openLoginModal, closeLoginModal, consumer} = useLogin() //consumer 객체로만 사용 할 경우, 창을 두개 이상 띄웠을때 로그인 감지 안 될 수 있기 때문에 loginStatus 로 별도 체크 로직 구현

    //미확인 건수
    const [countInfo, setCountInfo] = useState(initialCountInfo)
    //[{orderGroup, orderDetailList},...]
    //원본 리스트
    const [list, setList] = useState([])
    //렌더링용 리스트
    const [renderList, setRenderList] = useState([])

    const [loading, setLoading] = useState(true)
    const [delay, setDelay] = useState(null)
    const [alertCloseDelay, setAlertCloseDelay] = useState(null)
    const [fetchedDate, setFetchedDate] = useState(null)
    const [progressState, setProgressState] = useState(null)

    const [startDate, setStartDate] = useState(moment().add(-2,'day').format('YYYYMMDD'))
    const [endDate, setEndDate] = useState(moment().format('YYYYMMDD'))

    const [newOrderSubGroupNos, setNewOrderSubGroupNos] = useState([])


    //추가 필터정보
    const [additionalFilter, setAdditionalFilter] = useState({
        pieceOfCancelled: {checked: false, name: '그룹 부분취소', groupCount: 0, detailCount: 0},
        reqProducerCancelled: {checked: false, name: '개별 취소요청', groupCount: 0, detailCount: 0},
        replacedOrder: {checked: false, name: '대체상품', groupCount: 0, detailCount: 0},
    })
    //추가 필터정보(선택된 키)
    const [selectedAdditionalFilter, setSelectedAdditionalFilter] = useState(null)


    const [selectedLocalfoodFarmerNo, setSelectedLocalfoodFarmerNo] = useState()

    useEffect(() => {
        //로그인 체크
        fetchMoreData()
    }, [consumer])

    // useEffect(() => {
    //     //로그인 되어 있지 않았을 경우 인터벌을 통해 지속적으로 검색을 통한 로그인 체크
    //     if (loginStatus === 0) {
    //         setDelay(DELAY)
    //     }
    // }, [loginStatus])
    useEffect(() => {
        //로그인 성공시 모달이 열려 있으면 자동으로 닫히게
        if (pageStatus === 1 && modalOpen) {
            closeLoginModal()
        }
    }, [pageStatus])


    //조회용 인터벌
    useInterval(() =>{
        fetchMoreData()
    }, delay)

    //알림용 인터벌(생긴게 없어지도록)
    useInterval(() => {
        //신규 주문이 발생한 뒤로 10분이 지나면 알림이 사라지도록
        setNewOrderSubGroupNos([])
    }, alertCloseDelay)


    const getSearchDate = () => {
        const startDate = moment().add(-2,'day').format('YYYYMMDD')
        const endDate = moment().format('YYYYMMDD')

        setStartDate(startDate)
        setEndDate(endDate)

        return {
            startDate,
            endDate
        }
    }

    const searchOrderSubGroupList = async () => {

        const returnObj = {
            retStatus: SESSION_FIRED,
            data: null,
        }

        try {

            const {startDate, endDate} = getSearchDate()

            const params = {
                startDate, endDate
            }

            const {status, data} = await getOrderSubGroupListBetweenDate(params)

            // const {data} = await getOrderSubGroupCountFromLastNo(params); //by producerNo
            console.log("searchOrderSubGroupList", {status, data})

            //네트워크 체크
            if (status === 200) {

                //data 가 null 이면 로그인 해야 함
                if (!data) {
                    return returnObj;
                }else{
                    returnObj.retStatus = LOGIN_SUCCESS
                    returnObj.data = data
                    return returnObj;
                }
            }else {
                returnObj.retStatus = NETWORK_ERROR
                return returnObj
            }
        }catch (error) {
            console.log("searchOrderSubGroupList > catch")
            returnObj.retStatus = NETWORK_ERROR
            return returnObj
        }

    }
    const searchOrderDetailList = async (orderSubGroupNos) => {
        const returnObj = {
            retStatus: SESSION_FIRED,
            data: null,
        }
        try{
            const {status, data} = await getOrderDetailListByOrderSubGroupNos(orderSubGroupNos)

            //네트워크 체크
            if (status === 200) {

                //data 가 null 이면 로그인 해야 함
                if (!data) {
                    return returnObj;
                }else{
                    returnObj.retStatus = LOGIN_SUCCESS
                    returnObj.data = data
                    return returnObj;
                }
            }else {
                returnObj.retStatus = NETWORK_ERROR
                return returnObj
            }

        }catch (error) {
            console.log('searchOrderDetailList > catch')
            returnObj.retStatus = NETWORK_ERROR
            return returnObj
        }
    }
    const clearDelay = () => {
        if (delay) {
            setDelay(null)
        }
    }



    const fetchMoreData = async () => {

        //조회되는 시간차를 없애기 위해 딜레이는 항상 클리어
        if (!useDelay)
            setDelay(null)

        //서브주문그룹 조회
        // const orderSubGroupList = await searchOrderSubGroupList()
        const {retStatus, data: orderSubGroupList} = await searchOrderSubGroupList()

        console.log("fetchMoreData > 그룹 리스트", {retStatus, orderSubGroupList})

        if (isFetchingError(retStatus))
            return

        //로그인 되어 있을때만 조회 됨
        // if (orderSubGroupList !== null) {
        console.log("fetchMoreData > 정상 조회됨")
        if (orderSubGroupList && orderSubGroupList.length) {

            const lastOrderSubGroupNo = list.length ? list[0].orderSubGroup.orderSubGroupNo : 0

            const orderSubGroupNos = orderSubGroupList.map(item => item.orderSubGroupNo)
            // const {status, data} = await getOrderDetailListByOrderSubGroupNos(orderSubGroupNos)
            const {retStatus, data} = await searchOrderDetailList(orderSubGroupNos)
            // const data = await sear
            //
            // chOrderDetailList(orderSubGroupNos)

            if (isFetchingError(retStatus))
                return

            const newList = orderSubGroupList.map(orderSubGroup => {
                const orderDetailList = data.filter(orderDetail => orderDetail.orderSubGroupNo === orderSubGroup.orderSubGroupNo)
                return {
                    orderSubGroup,
                    orderDetailList
                }
                // const newOrderSubGroup = {...orderSubGroup, orderDetailList: newOrderDetailList}
                // prevOrderSubGroupList.push(newOrderSubGroup)
            })

            //최상단 카운트 바인딩
            setDashCount({orderSubGroupList})

            //필터링 카운트 새로고침
            refreshAdditionalFilterCount(newList)

            //원본 리스트 바인딩
            setList(newList)

            //필터된 화면 바인딩용 리스트
            let newRenderList = getFilteredList(newList, progressState)
            setRenderList(newRenderList)


            //신규 추가된 주문이 있는 경우 알림
            const newSubNos = getNewOrderSubGroupNos(lastOrderSubGroupNo, newList)

            //신규 들어온 게 있을 경우만.. && 최초 조회는 제외
            if (newSubNos.length && lastOrderSubGroupNo !== 0) {

                //얼럿 사라짐 딜레이 초기화
                setAlertCloseDelay(null)

                setNewOrderSubGroupNos(newSubNos)
                // window.scrollTo({top: 0})

                //5분 후 닫히도록
                setAlertCloseDelay(ALERT_CLOSE_DELAY)

                //소리알림 요청
                speakNewOrder()
            }

        }

        setFetchedDate(new Date())

        if (loading) {
            setLoading(false)
        }

        if (!useDelay)
            setDelay(DELAY)
        // }
    }

    const isFetchingError = (retStatus) => {
        if (retStatus === LOGIN_SUCCESS) {
            console.log("fetchMoreData > 로그인 성공")

            //로그인 체크중, 로그인 실패 => 로그인 성공
            setPageStatus(1)

            return false
        }
        //로그인 실패시 3초마다 계속 요청
        else if (retStatus === SESSION_FIRED) {
            console.log("fetchMoreData > 로그인 만료로 3초 뒤 재조회 요청")

            //로그인 실패로 처리
            setPageStatus(0)

            //3초 뒤 재조회
            setDelay(3000)
            return true
        }
        //에러 났을 경우 3초마다 계속 요청
        else if (retStatus === NETWORK_ERROR) {
            console.log("fetchMoreData > 네트워크 에러로 3초뒤 재조회 요청")

            //네트워크 에러로 처리
            setPageStatus(99)

            //3초 뒤 재조회
            setDelay(3000)
            return true
        }
    }

    //주문알림 소리 요청
    const speakNewOrder = () => {
        //사내 테스트용 http://192.168.0.130:5000/playsound
        fetch("http://localhost:5000/playsound").then((response) =>
            console.log(response)
        ).catch(error => {
            console.error(error.message)
        });
    }

    //카운트 새로고침
    const refreshAdditionalFilterCount = async (list) => {

        // const {startDate, endDate} = getSearchDate()

        // const res = await Promise.all([
        //     getReqOrderCancelCnt(), //주문취소요청 카운트
        //     // getOrderCancelCnt(startDate, endDate), //부분취소 카운트
        //
        // ])

        const newAdditionalFilter = {...additionalFilter}

        // console.log({res, newAdditionalFilter})

        //부분취소 카운트
        const countInfo = getAdditionalCountInfo(list)
        newAdditionalFilter.pieceOfCancelled.groupCount = countInfo.pieceOfCancelled.group
        newAdditionalFilter.pieceOfCancelled.detailCount = countInfo.pieceOfCancelled.detail

        //주문취소요청 카운트
        newAdditionalFilter.reqProducerCancelled.groupCount = countInfo.reqProducerCancelled.group
        newAdditionalFilter.reqProducerCancelled.detailCount = countInfo.reqProducerCancelled.detail

        //대체상품 카운트
        newAdditionalFilter.replacedOrder.groupCount = countInfo.replacedOrder.group
        newAdditionalFilter.replacedOrder.detailCount = countInfo.replacedOrder.detail


        setAdditionalFilter(newAdditionalFilter)
    }

    const getFilteredList = (list, progressState, additionalFilter) => {

        let newList = list

        //1차 필터
        if (progressState !== null) {
            newList = list.filter(item => item.orderSubGroup.progressState === progressState)
        }

        // if (progressState === null) {
        //추가 필터
        newList = getAdditionalFilteredList(newList)
        // }

        return newList

        // return list.filter(item => item.orderSubGroup.progressState === progressState)
    }

    const setDashCount = ({orderSubGroupList}) => {
        const newCountInfo = {...initialCountInfo}

        orderSubGroupList.map(og => {
            newCountInfo[CODE[og.progressState].code]++
        })
        setCountInfo(newCountInfo)
    }

    const initialCountInfo2 = {
        [PROGRESS_STATE_CODE.noAction]: [],          //미확인 0
        [PROGRESS_STATE_CODE.picking]: [],           //피킹중 1
        [PROGRESS_STATE_CODE.pickingCompleted]: [],  //피킹완료 2
        [PROGRESS_STATE_CODE.shippingStarted]: [],          //배송시작: 4
        [PROGRESS_STATE_CODE.shippingCompleted]: [], //배송완료 3
        [PROGRESS_STATE_CODE.allCancelled]: [],      //주문취소됨 99
    }

    const [countInfo2, setCountInfo2] = useState({
        ...initialCountInfo2
    })

    const setDashCount2 = (list) => {
        const newCountInfo = {...initialCountInfo2}
        list.map(item => {
            newCountInfo[CODE[item.orderSubGroup.progressState].code].push(item)
        })

        console.log("setDashCount2=======:", newCountInfo)
        setCountInfo2(newCountInfo)

    }

    // const hasNewOrder = (lastOrderSubGroupNo, newList) => {
    //     //DB 에서 새로 추가된 서브주문그룹 목록
    //     const newOrderSubGroupList = newList.filter((item) => item.orderSubGroup.orderSubGroupNo > lastOrderSubGroupNo)
    //
    //     let hasNewOrder = false;
    //
    //     for (let i = 0; i < newOrderSubGroupList.length; i++) {
    //         const {orderSubGroup, orderDetailList} = newOrderSubGroupList[i]
    //         const cancelledSize = orderDetailList.filter(item => item.payStatus === 'cancelled').length
    //         if (orderDetailList.length !== cancelledSize) {
    //             hasNewOrder = true;
    //             break;
    //         }
    //     }
    //
    //     return hasNewOrder
    // }

    const getNewOrderSubGroupNos = (lastOrderSubGroupNo, newList) => {
        //DB 에서 새로 추가된 서브주문그룹 목록
        const newOrderSubGroupList = newList.filter((item) => item.orderSubGroup.orderSubGroupNo > lastOrderSubGroupNo)
        const newOrderSubGroupNos = []
        newOrderSubGroupList.map(({orderSubGroup, orderDetailList}) => {
            const cancelledSize = orderDetailList.filter(item => item.payStatus === 'cancelled').length
            if (orderDetailList.length !== cancelledSize) {
                newOrderSubGroupNos.push(orderSubGroup.orderSubGroupNo)
            }
        })
        return newOrderSubGroupNos
    }

    const onCountBoxClick = (value) => {
        if (value === progressState){
            setProgressState(null)
        }else{
            setProgressState(value)
        }
    }



    //추가 필터 클릭
    const onWhereClick = (filterType) => {

        //부분취소 일 경우
        // if (filterType === 'pieceOfCancelled') {
        //pieceOfCancelled: {checked: false, name: '부분취소'}
        setSelectedAdditionalFilter(filterType === selectedAdditionalFilter ? null : filterType)

        // const newItem = additionalFilter[filterType]
        // newItem.checked = !newItem.checked
        //
        // setAdditionalFilter({
        //     ...additionalFilter,
        //     [filterType]: newItem
        // })
    }

    // const filteredList = React.useMemo(() => {
    //     // let returnList = [...list]
    //     if (progressState === null) {
    //         // getAdditionalFilteredList(list)
    //         return list
    //     }else{
    //         return list.filter(({orderSubGroup}) => orderSubGroup.progressState === progressState)
    //     }
    // }, [progressState, additionalFilter, list])

    useEffect(() => {
        setRenderList(getFilteredList(list, progressState, additionalFilter))
    }, [progressState, selectedAdditionalFilter])


    //추가 필터 적용
    const getAdditionalFilteredList = (list) => {

        if (!selectedAdditionalFilter) {
            return list
        }

        let filteredList = []

        if (selectedAdditionalFilter === 'pieceOfCancelled') {
            //부분취소 필터링
            list.map(({orderSubGroup, orderDetailList}) => {
                if ([0,1,2,3,4].includes(orderSubGroup.progressState)) {
                    const cancelledCount = orderDetailList.filter(item => item.payStatus === 'cancelled').length
                    //취소된 건이 있으면서, 원래 주문수랑 다른건 부분취소임
                    if (cancelledCount > 0 && cancelledCount !== orderDetailList.length) {
                        filteredList.push({orderSubGroup, orderDetailList})
                    }
                }
            })
        }else if (selectedAdditionalFilter === 'reqProducerCancelled') {
            console.log({'reqProducerCancelled': 'reqProducerCancelled'})

            //주문 취소요청 필터링
            list.map(({orderSubGroup, orderDetailList}) => {
                if ([0,1,2,3,4].includes(orderSubGroup.progressState)) {
                    const reqProducerCancelledCount = orderDetailList.filter(item => item.reqProducerCancel === 1).length
                    if (reqProducerCancelledCount > 0) {
                        filteredList.push({orderSubGroup, orderDetailList})
                    }
                }
            })
        }else if (selectedAdditionalFilter === 'replacedOrder') {
            //대체상품 필터링
            list.map(({orderSubGroup, orderDetailList}) => {
                if ([0,1,2,3,4].includes(orderSubGroup.progressState)) {
                    const replacedCount = orderDetailList.filter(item => (item.replaceFlag === true && item.payStatus === 'paid')).length
                    if (replacedCount > 0) {
                        filteredList.push({orderSubGroup, orderDetailList})
                    }
                }
            })
        }

        return filteredList
    }

    //부분취소 카운트 (orderDetail의 카운트)
    const getAdditionalCountInfo = (list) => {
        //부분취소 카운트
        const countInfo = {
            pieceOfCancelled: {group: 0, detail: 0},
            reqProducerCancelled: {group: 0, detail: 0},
            replacedOrder: {group: 0, detail: 0}
        }

        // let subGroupCount = 0
        // let orderDetailCount = 0
        //
        //주문취소요청 카운트

        //부분취소 필터링

        list.map(({orderSubGroup, orderDetailList}) => {

            //주문그룹취소 되지 않은 건 중에서..
            if ([0,1,2,3,4].includes(orderSubGroup.progressState)) {

                const cancelledCount = orderDetailList.filter(item => item.payStatus === 'cancelled').length

                //부분취소 카운트
                //취소된 건이 있으면서, 원래 주문수랑 다른건 부분취소임
                if (cancelledCount > 0 && cancelledCount !== orderDetailList.length) {
                    countInfo.pieceOfCancelled.group++;
                    countInfo.pieceOfCancelled.detail = countInfo.pieceOfCancelled.detail + cancelledCount
                }

                //주문취소요청 카운트
                const reqProducerCancelCount = orderDetailList.filter(item => item.reqProducerCancel === 1).length
                if (reqProducerCancelCount > 0) {
                    countInfo.reqProducerCancelled.group++;
                    countInfo.reqProducerCancelled.detail = countInfo.reqProducerCancelled.detail + reqProducerCancelCount
                }

                //대체상품 카운트
                const replacedOrderCount = orderDetailList.filter(item => (item.replaceFlag === true && item.payStatus === 'paid')).length
                if (replacedOrderCount > 0) {
                    countInfo.replacedOrder.group++;
                    countInfo.replacedOrder.detail = countInfo.replacedOrder.detail + replacedOrderCount
                }
            }
        })
        return countInfo
    }

    // const filteredList = progressState ? countInfo2[CODE[progressState].code] : list

    // const filteredList = !progressState ? list : list.filter(({orderSubGroup}) => orderSubGroup.progressState === progressState)

    // return (<button onClick={openLoginModal}>로그인</button>)

    //농가명 클릭 시 모달 오픈
    const onFarmerClick = (localfoodFarmerNo) => {
        setSelectedLocalfoodFarmerNo(localfoodFarmerNo)
    }

    if ([99].includes(pageStatus) && loading) return (
        <CenteredEmptyBox>
            <div>
                네트워크 에러가 발생 하였습니다.
                <Spinner size={50} color={'info'} />
            </div>
        </CenteredEmptyBox>
    )
    if ([-1].includes(pageStatus)) return <CenteredEmptyBox>로그인 체크중...</CenteredEmptyBox>
    if ([0].includes(pageStatus)) return (
        <CenteredEmptyBox>
            <div>
                생산자(로컬푸드) 로그인이 필요 합니다.
                <Div fontSize={25}>
                    <u style={{cursor: 'pointer'}} onClick={openLoginModal}>로그인 하기</u>
                </Div>
            </div>
        </CenteredEmptyBox>
    )


    if (loading) return <CenteredEmptyBox><Spinner size={50} color={'info'} /></CenteredEmptyBox>
    return (
        <div>
            <BackNavigation rightContent={
                <Space spaceGap={20} onClick={() => window.scrollTo({top: 0})} cursor={1}>
                    {
                        pageStatus === 99 ? <MdSignalWifiStatusbarConnectedNoInternet1 size={25} color={color.danger} /> :
                        <MdSignalWifiStatusbar2Bar size={25} color={color.secondary}/>
                    }
                    <NewOrderAlertSm newOrderSubGroupCount={newOrderSubGroupNos.length} />
                </Space>

            }>실시간 주문현황</BackNavigation>
            {/*<button onClick={fetchMoreData}>새로고침</button>*/}

            {
                pageStatus === 99 && (
                    <Div px={16} py={20} rounded={4} bg={'danger'} fg={'white'} p={10} mx={16} mt={16}>
                        <MdSignalWifiStatusbarConnectedNoInternet1 size={20} style={{marginRight: 4}}/>네트워크 에러가 발생 하였습니다.
                    </Div>
                )
            }


            <Div px={16} py={20}>
                <Flex fontSize={13} fg={'darkBlack'} mb={8} flexWrap={'wrap'} justifyContent={'space-between'}>
                    <div>Total {ComUtil.addCommas(list.length)}</div>
                    {/*<Right>*/}
                    <Space>
                        <div><Spinner color={'primary'} size={'sm'} /></div>
                        <div>업데이트 {fetchedDate && moment(fetchedDate).format("HH:mm:ss")}
                            &nbsp;&nbsp;
                            (조회기간: {moment(startDate, 'YYYYMMDD').format('YYYY.MM.DD')} ~ 현재)
                        </div>
                    </Space>
                    {/*</Right>*/}
                </Flex>
                <CountBoxWrapper repeat={6} colGap={1} rowGap={1} overflow={'hidden'} bg={'veryLight'} bc={'secondary'} rounded={4}>
                    {
                        //Object 의 키가 숫자 일 경우 강제로 0,1,2,3,4 로 loop 를 돌기 때문에 강제로 CODE_SORT 배열로 loop 되게 바꿈
                        CODE_SORT.map(value =>
                            <CountBox key={value} onClick={onCountBoxClick.bind(this, value)} progressState={value} active={progressState === value}>
                                <div>{CODE[value].name}</div>
                                <div>{countInfo[CODE[value].code]}건</div>
                                {
                                    progressState === value && <Div absolute top={6} right={12} fg={'white'} fontSize={20}><MdClose/></Div>
                                }
                            </CountBox>
                        )
                    }
                </CountBoxWrapper>
            </Div>

            {/* 추가 필터 */}
            <Space px={16} mb={16}>
                {
                    Object.keys(additionalFilter).map(key => {
                        const af = additionalFilter[key]
                        return (
                            <Div key={key} cursor={1} rounded={25} px={12} py={5} bc={'secondary'}
                                 fg={selectedAdditionalFilter === key ? 'white' : 'darkBlack'}
                                 bg={selectedAdditionalFilter === key ? 'primary' : 'white'}
                                 onClick={onWhereClick.bind(this, key)} >
                                {af.name} {af.groupCount}/{af.detailCount}건
                            </Div>
                        )
                    })
                }

            </Space>


            <NewOrderAlertLg newOrderSubGroupCount={newOrderSubGroupNos.length} />

            <ListBodyWrapper>
                {
                    !renderList.length ? (<Div bg={'white'} height={200} lineHeight={200} fontSize={20} textAlign={'center'}>
                        {/*{CODE[progressState].name}? 아직 없어요!*/}
                        {getProgressStateName(progressState)} ? 아직 없어요!
                    </Div>) : (
                        renderList.map(({orderSubGroup, orderDetailList}) =>
                            <OrderSubGroup key={orderSubGroup.orderSubGroupNo} orderSubGroup={orderSubGroup} isNew={newOrderSubGroupNos.includes(orderSubGroup.orderSubGroupNo)}>
                                {
                                    orderDetailList.map(orderDetail =>
                                        <OrderCard key={orderDetail.orderSeq} orderDetail={orderDetail} onFarmerClick={onFarmerClick.bind(this, orderDetail.localfoodFarmerNo)} />
                                    )
                                }
                            </OrderSubGroup>
                        )
                    )

                }
            </ListBodyWrapper>



            <Modal isOpen={selectedLocalfoodFarmerNo} toggle={() => setSelectedLocalfoodFarmerNo(null)}>
                <ModalHeader toggle={() => setSelectedLocalfoodFarmerNo(null)}>
                    농가
                </ModalHeader>
                <ModalBody>
                    {
                        <LocalFarmerContent localfoodFarmerNo={selectedLocalfoodFarmerNo} />
                    }
                </ModalBody>
            </Modal>

        </div>
    );
};

export default Dashboard;




const OrderSubGroupWrapper = styled.div`
    padding: ${getValue(16)};
    border-radius: ${getValue(4)};
    background-color: ${color.white};
    border: 1px solid ${color.secondary};

    ${({theme}) => theme.mobile`
        // padding: ${getValue(12)} ${getValue(14)};
        border-radius: 0;
        border: 0;
    `}
`

const OrderSubGroup = ({orderSubGroup, isNew, children}) => {
    return(
        <OrderSubGroupWrapper>
            <Flex pb={16} fontWeight={'lighter'}>
                <Flex fontSize={17}>
                    <AiFillFire color={isNew ? color.danger : color.secondary}/>
                    <Span ml={4} mr={10}>그룹번호 <b>{orderSubGroup.orderSubGroupNo}</b></Span>
                    {orderSubGroup.listSize}건
                </Flex>
                <Right fontSize={13}>
                    <Space>
                        <span>{ComUtil.utcToString(orderSubGroup.orderDate, 'MM.DD HH:mm')}</span>
                        <ProgressStateBadge state={orderSubGroup.progressState}>
                            {CODE[orderSubGroup.progressState].name}
                        </ProgressStateBadge>
                    </Space>
                </Right>
            </Flex>
            <JustListSpace space={13}>
                {children}
            </JustListSpace>
        </OrderSubGroupWrapper>
    )
}

const CenteredEmptyBox = ({children}) => {
    return (
        <Flex height={'100vh'} justifyContent={'center'} fontSize={20}>{children}</Flex>
    )
}


const NewOrderAlertSm = ({newOrderSubGroupCount}) => {
    return(
        <Space relative spaceGap={4} pr={16} mr={9}>
            <AiFillFire size={25} color={newOrderSubGroupCount ? color.danger : color.secondary}/>
            {
                newOrderSubGroupCount ? <Flex absolute width={25} height={25} bg={'#da0000'} fg={'white'} fw={500} justifyContent={'center'} rounded={'50%'} top={-8} right={0} fontSize={13}>{newOrderSubGroupCount}</Flex> : null
            }
        </Space>
    )
}

const NewOrderAlertLgDiv = styled.div`
    background-color: ${color.danger};
    color: ${color.white};
    margin: 0 ${getValue(16)} ${getValue(16)} ${getValue(16)};
    padding: ${getValue(16)};
    font-size: ${getValue(30)};
    border-radius: ${getValue(4)};
    font-weight: 500;
    
    ${({theme}) => theme.mobile`
        
        padding: 10px 16px;
        font-size: ${getValue(20)};
        line-height: 1.4;
    `}
`

const NewOrderAlertLg = ({newOrderSubGroupCount}) => {
    if (!newOrderSubGroupCount) return null
    return (
        <NewOrderAlertLgDiv>
            <AiFillFire /> 샵블리 신규 주문 {newOrderSubGroupCount}건!
        </NewOrderAlertLgDiv>
    )
}