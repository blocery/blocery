import React, {useState, useEffect, useRef, Fragment} from 'react'
import {Button, Div, Flex, Hr, Right} from "~/styledComponents/shared";
import {useParams} from "react-router-dom";
import BasicNavigation from "~/components/common/navs/BasicNavigation";
import BackNavigation from "~/components/common/navs/BackNavigation";
import OrderCard from "./OrderCard"
import { getOrderDetailListByLocalFarmerNo, updateOrderTrackingInfo, sendDeliveryDonePush} from "~/lib/producerApi";
import { getLocalfoodFarmerListByProducerNo } from "~/lib/localfoodApi"
import {getOrderSubGroup} from "~/lib/shopApi"
import ComUtil from "~/util/ComUtil";
import {EmptyBox} from "~/styledComponents/ShopBlyLayouts";
import {color} from "~/styledComponents/Properties";
import {toast} from "react-toastify";
import {Input, Spinner, Label} from "reactstrap";
import moment from "moment-timezone";
import MonthPicker from "react-month-picker";
import {MonthBox} from "~/components/common";
import Switch from "react-switch";
import {localReplaceMinusFlag} from "~/util/bzLogic";

const FarmerOrderList = ({orderList, showDetail, searchOkDate}) => {
    if (!orderList || orderList.length <= 0) {
        return <EmptyBox>조회 내역이 없습니다.</EmptyBox>
    }

    const orderDateList = []

    let orderDate = ''

    orderList && orderList.map(item => {
        const compOrderDate = ComUtil.utcToString(item.orderDate, 'YY/MM/DD')
        if(orderDate !== compOrderDate) {
            orderDateList.push(compOrderDate)
        }

        orderDate = compOrderDate
    })


    return orderDateList.map((groupOrderDate, pIndex) => {
        const resList = orderList.filter(order =>
            ComUtil.utcToString(order.orderDate, 'YY/MM/DD') === groupOrderDate
        )

        return (
            <Fragment key={'groupDate'+pIndex}>
                <Flex fontSize={14} bg={'black'} fg={'veryLight'} px={16} py={8}>
                    <Div>{ComUtil.utcToString(resList[0].orderDate)}</Div>
                    <Right>{ComUtil.sum(resList, 'orderCnt')} 건</Right>
                </Flex>
                {
                    resList.map(orderDetail => {
                        return (
                            <Fragment key = {orderDetail.orderSeq}>
                                <OrderCard
                                    key={orderDetail.orderSeq}
                                    orderDetail = {orderDetail}
                                    showDetail = {showDetail}
                                    searchOkDate = {searchOkDate}
                                />
                            </Fragment>
                            )
                    })
                }
            </Fragment>
        )
    })
};

const FarmerSum = (props) => {
    const {localFarmerNo, producerNo} = useParams()

    const [list, setList] = useState()
    const [loading, setLoading] = useState(true)
    const [total, setTotal] = useState(0)

    //달력관련
    const today =  moment();
    const initMonth = today.add(1, 'month');
    const limitMonth = {year: initMonth.year(), month: initMonth.month() + 1};
    const pickerLang = {
        months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월']
    }
    const [showMonthPicker, setShowMonthPicker] = useState()
    const [searchMonthValue, setSearchMonthValue] = useState({year: initMonth.year(), month: initMonth.month()})

    const [searchOkDate, setSearchOkDate] = useState(false) //조회구분: 구매확정일로 조회 여부 (기본: 주문일 조회 )
    const [showDetail, setShowDetail] = useState(false)

    useEffect(() => {
        async function fetch() {
            setTotal('조회중...') //addComma에서 null리턴됨.
            await fetchMoreData()
            setLoading(false)
        }
        fetch()
    }, [searchMonthValue, searchOkDate]) //조회구분도 반영

    const fetchMoreData = async () => {

        const {status, data} = await getOrderDetailListByLocalFarmerNo(producerNo, localFarmerNo, searchMonthValue.year, searchMonthValue.month, searchOkDate)
        // const filteredData = data.filter(item => item.payStatus !== "cancelled")//백엔드에서 처리.
        const filteredData = data.filter(item => !localReplaceMinusFlag(item))
        console.log(filteredData)

        if(filteredData.length > 0) {
            let totPrice = filteredData.reduce((acc, order) => acc + order.orderPrice , 0)
            setTotal(totPrice)
        } else {
            setTotal(0)
        }

        setList(filteredData)
    }

    const makeMonthText = (m) => {
        if (m && m.year && m.month) return (m.year + "년 " + pickerLang.months[m.month-1])
        return '?'
    }
    const handleClickMonthBox = () => {
        setShowMonthPicker(true)
    }
    const handleAMonthChange = (value, text) => {
        let data = {
            year: value,
            month: text
        }
        handleAMonthDismiss(data);
    }
    const handleAMonthDismiss= async (value) => {
        setShowMonthPicker(false)
        console.log(value)
        setSearchMonthValue(value)
        //이거 호출 없어도 되어야 하는데.. fetchMoreData()
    }

    const handleSearchChange = () => {
        setSearchOkDate(!searchOkDate)
    }


    const handleChange = () => {
        setShowDetail(!showDetail)
    }


    if(loading)
        return <Flex minHeight={400} justifyContent={'center'}><Spinner color={'success'} /></Flex>

    return (
        <div>
            <BackNavigation>샵블리 온라인 주문목록</BackNavigation>

            <Div fontSize={14} bg={'black'} fg={'veryLight'} px={16} py={8}>
                농가번호: <b>{localFarmerNo}</b>
            </Div>

            {/* TODO  월선택.  [월합계, 1~15일, 16~말일]  3가지 버튼 검색 */}


            <Flex p={16}>
                <div>
                {
                    showMonthPicker &&
                    <MonthPicker
                        show={true}
                        years={[2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030]}
                        value={searchMonthValue}
                        lang={pickerLang.months}
                        onChange={handleAMonthChange.bind(this)}
                        onDismiss={handleAMonthDismiss.bind(this)}
                    />
                }
                </div>

                <MonthBox width={100} value={makeMonthText(searchMonthValue)} onClick={handleClickMonthBox.bind(this)}/>
                {/*<Button ml={5} fontSize={12} px={5} bg={'darkBlack'} fg={'white'} onClick={onDayClick.bind(this,'first')}>1일-15일</Button>*/}
                {/*<Button ml={5} fontSize={12} px={5} bg={'darkBlack'} fg={'white'} onClick={onDayClick.bind(this,'last')}>16일-말일</Button>*/}

                {/*<Right> 일단잠깐 미사용 */}
                {/*    <Flex>*/}
                {/*        <div>구매확정일로 조회 &nbsp;</div>*/}
                {/*        <Switch checked={searchOkDate} onChange={handleSearchChange}></Switch>*/}
                {/*    </Flex>*/}
                {/*</Right>*/}

                <Right>총 {ComUtil.sum(list, 'orderCnt')} 건</Right>

            </Flex>
            <Hr />
            <Flex>
                <Div m={20}> 합계: {ComUtil.addCommas(total)}원 </Div>
                <Right>
                    <Flex p={16}>
                    <div>상세보기 &nbsp;</div>
                    <Switch checked={showDetail} onChange={handleChange}></Switch>
                    </Flex>
                </Right>
            </Flex>
            <Hr />

            <div>
                <FarmerOrderList orderList={list} showDetail={showDetail} searchOkDate={searchOkDate}/>
            </div>

        </div>
    )
}

export default FarmerSum;