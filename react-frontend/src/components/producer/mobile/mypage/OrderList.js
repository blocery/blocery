import React, {useState, useEffect, Fragment, useRef} from 'react'
import {Div, Span, Flex, Button, Right, Space} from "~/styledComponents/shared";
import { withRouter} from 'react-router-dom'

import {getProducerOrderList, setLastSeenOrder, setOrderAllConfirm, producerReplaceOrderCheck, producerReplaceOrder, getReqOrderCancelCnt} from '~/lib/producerApi'

import BackNavigation from "~/components/common/navs/BackNavigation";
import ProducerOrderCard from "~/components/producer/mobile/common/ProducerOrderCard";
import {HrThin} from "~/styledComponents/mixedIn";
import Skeleton from "~/components/common/cards/Skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import {color} from "~/styledComponents/Properties";
import {EmptyBox} from "~/styledComponents/ShopBlyLayouts";
import SubGroupLabel from "~/components/producer/mobile/common/SubGroupLabel";
import ComUtil from "~/util/ComUtil";
import {Webview} from "~/lib/webviewApi";
import useInterval from "~/hooks/useInterval";
import SpinnerLoading from "~/components/common/Spinner/SpinnerLoading";

//private
const ProducerOrderList = ({data, refreshCallback}) => {
    if (data.length <= 0) {
        return <EmptyBox>조회 내역이 없습니다.</EmptyBox>
        // <Div textAlign={'center'} p={16}>조회 내역이 없습니다.</Div>
    }

    return data.map((orderDetail, index, orderDetailList) => {
            return(
                <Fragment key={orderDetail.orderSeq}>
                    {
                        ComUtil.isNewGroup('orderSubGroupNo', orderDetail, index, orderDetailList) &&
                        <SubGroupLabel orderSubGroupNo={orderDetail.orderSubGroupNo} />
                    }
                    <ProducerOrderCard
                        key={orderDetail.orderSeq}
                        orderDetail = {orderDetail}
                        refreshCallback={refreshCallback}
                        // onRequestReplaceOrderClick={onRequestReplaceOrderClick}
                    />
                </Fragment>
            )
        }

    )
};

const CountInfo = ({refreshDate}) => {
    const [delay, setDelay] = useState(null)
    const [countInfo, setCountInfo] = useState({
        reqOrderCancel: {name: '주문취소요청', value: 0},
    })
    useEffect(() => {
        fetchCountInfo()
    }, [refreshDate])

    useInterval(() => {
        fetchCountInfo()
    }, delay)

    const fetchCountInfo = async () => {
        setDelay(null)


        const res = await Promise.all([
            getReqOrderCancelCnt(),     //주문취소요청 카운트
        ])

        setCountInfo({
            reqOrderCancel: {name: '주문취소요청', value: res[0].data},
        })

        setDelay(1000 * 30)
    }

    return(
        <Space px={16} overflow={'hidden'}>
            {
                Object.values(countInfo).map(item =>
                    item.value <= 0 ? null :
                        <Div rounded={25} px={10} py={5} bg={'danger'} fg={'white'} fontSize={14}>
                            {item.name} {item.value}건
                        </Div>
                )
            }
        </Space>
    )
}

const OrderList = () => {

    const [list, setList] = useState([])

    //  @param  type=0 주문확인필요 (default)
    //          type=1 배송대기 orderConfrim="confirmed"
    //          type=2 출고완료 orderConfrim="shipping"
    const [type, setType] = useState('0')
    const [hasMore, setHasMore] = useState(true)
    const [page, setPage] = useState(0)

    //즉시상품, 쑥쑥상품 탭 추가.
    const [tabId, setTabId] = useState('1');

    //2208멀티대체, 웹에서 바코드대체 지정.
    const [webBarcodeMode, setWebBarcodeMode] = useState(false)

    useEffect(() => {

        // android 수신 이벤트(android)
        window.document.addEventListener('message', onMessageListener);

        // ios 수신 이벤트(ios)
        window.addEventListener('message', onMessageListener );

        return(() => {
            // android 수신 이벤트(android)
            window.document.removeEventListener('message', onMessageListener );

            // ios 수신 이벤트(ios)
            window.removeEventListener('message', onMessageListener );
        })

    }, [])

    const orderSeqRef = useRef();
    const [replaceOrderInfo, setReplaceOrderInfo] = useState()



    const readyReplaceOrder = async ({orderSeq, barcode}) => {
        const {status, data} = await producerReplaceOrderCheck(orderSeq, barcode)

        if (status === 200) {
            //로그인 오류
            if (data.resCode === -1) {
                alert('다시 로그인 해 주세요.');
                return
                // setReplaceOrderInfo({[orderSeq]: barcode})
            }

            setReplaceOrderInfo({
                [orderSeq]: {
                    isSuccess: data.resCode === 0,
                    errMsg: data.errMsg, //isSuccess true 일 경우만 errMsg 존재
                    replaceOrderSeq: orderSeq,
                    replaceBarcode: barcode,
                    replaceGoodsDesc: data.retData
                }
            })
        }
    }

    //native 콜백함수
    const onMessageListener = (e) => {

        try{

            // console.log(e);
            const data = JSON.parse(e.data);
            const barcode = data.accountFromPhone
            const orderSeq = orderSeqRef.current


            readyReplaceOrder({orderSeq, barcode})



            //
            // const newBarcodeList = [...barcodeList]
            //
            // const barcodeInfo = newBarcodeList.find(item => item.orderSeq === orderSeqRef.current)
            //
            // //없으면 추가
            // if (!barcodeInfo) {
            //     newBarcodeList.push({
            //         orderSeq: orderSeqRef.current,
            //         barcode: data.accountFromPhone,
            //     })
            // }else{//있으면 업데이트
            //     barcodeInfo.barcode = barcode
            // }
            // setBarcodeList(newBarcodeList)

            // Webview.appLog(data.accountFromPhone);

            // this.checkErcAccount(data.accountFromPhone)
            //
            // this.setState({
            //     ercAccount: data.accountFromPhone,
            //     // withdrawOk: (this.checkErcAccount(data.accountFromPhone) && this.state.withdrawAmount >= 100)
            // })
        } catch(e) {}
    }

    // 대체상품 요청
    const onRequestReplaceOrderClick = async (orderDetail) => {
        console.log({orderDetail: orderDetail})

        if(ComUtil.isMobileApp()) {

            //마지막으로 찍은 QR 코드 기억
            orderSeqRef.current = orderDetail.orderSeq

            //Native에 QR 호출
            Webview.qrcodeScan();

        } else {
            // alert('폰에서만 가능합니다')

            //2208멀티대체: web에서는 textBox로 바코드 19자리(옥천 case: 157) 읽기.
            orderSeqRef.current = orderDetail.orderSeq
            console.log('web에서 클릭:' + orderSeqRef.current)
            setWebBarcodeMode(true)
        }
    }

    //2208 웹용 바코드INPUT 처리
    const onWebBarcodeReadDone = async (orderSeq, barcode) => {

        console.log('onWebBarcodeReadDone', barcode, orderSeq)
        readyReplaceOrder({orderSeq, barcode})

        //if success
        setWebBarcodeMode(false)
    }

    //2208 웹용 바코드INPUT cancel
    const onWebBarcodeReadCancel = () => {
        setWebBarcodeMode(false)
    }

    //대체상품 취소
    const onReplaceOrderCancelClick = () => {
        orderSeqRef.current = ''
        setReplaceOrderInfo(null)

        setWebBarcodeMode(false) //2208
    }

    ////onTypeChange 시에도 호출
    useEffect(() => {
        fetchMoreData(true)
    }, [type, tabId])

    // const fetch = async () => {
    //     fetchMoreData(true);
    //
    //     if (type == 0) {
    //         setLastSeenOrder();
    //     }
    //
    // }

    const fetchMoreData = async (isNewSearch) => {

        if (isNewSearch && type == 0)
            setLastSeenOrder()

        let params = { dealGoods:(tabId==1)?false:true, isPaging: true, limit: 10, type: type, withOrderConfirm: true}


        if (isNewSearch) {
            params.page = 1
        }else{
            params.page = page + 1
        }

        const {data} = await getProducerOrderList(params); //by producerNo

        // const {data} = await getOrderCancelList(params); //by producerNo
        console.log(data);

        const tempList = isNewSearch ? [] : list
        const newList = tempList.concat(data.orderDetailList)

        setList(newList)
        setPage(params.page)

        //더이상 로딩 되지 않도록
        if (newList.length >= data.totalCount) {
            setHasMore(false)
        }else{
            setHasMore(true)
        }
    }

    const onHeaderClick = (pTabId) => {
        setTabId(pTabId);
    }

    const onTypeChange = (e) => {
        // console.log("onTypeChange");
        setType(e.target.value); //강제 렌더링- 반영시간 필요해서
        //search()  //=> useEffect (type)이용 호출
    }

    const onOrderAllConfirm = async () => {
        //backend 저장.
        if (!window.confirm('전체목록을 주문확인 하시겠습니까?')) {
            return;
        }

        let {data} = await setOrderAllConfirm((tabId==='1')?false:true);
        if (data == 1) {  //list refresh
            fetchMoreData(true)
        }
    }

    const onReplaceOrderClear = (clearOrderSeq) => {
        if (orderSeqRef.current === clearOrderSeq) {
            onReplaceOrderCancelClick()
        }
    }

    const [refreshDate, setRefreshDate] = useState(null)

    //카운트 업데이트
    const refreshCountInfo = () => {
        setRefreshDate(new Date());
    }

    return (
        <Div pb={200}>
            <BackNavigation>주문통합목록</BackNavigation>
            {/*<pre>*/}
            {/*    {JSON.stringify(replaceOrderInfo, null, 2)}*/}
            {/*</pre>*/}
            <Flex bg={'white'} px={16} py={16} custom={`
                    & > div:nth-child(1){
                        border-right: 0;
                        border-top-right-radius: 0;
                        border-bottom-right-radius: 0;
                    }
                    & > div:nth-child(2){
                        border-left: 0;
                        border-top-left-radius: 0;
                        border-bottom-left-radius: 0;
                    }
                `}>
                <HeaderButton active={tabId === '1'} onClick={onHeaderClick.bind(this, '1')} >즉시상품</HeaderButton>
                <HeaderButton active={tabId === '2'} onClick={onHeaderClick.bind(this, '2')} >쑥쑥-예약상품</HeaderButton>
            </Flex>

            <CountInfo refreshDate={refreshDate} />

            <Flex px={16} minHeight={60} custom={`
                border-bottom: 1px solid ${color.veryLight};
            `}>
                {/*<Span className='textBoldLarge f3'>주문상태 </Span>*/}
                <span>
                    <input defaultChecked type="radio" id="type0" name="typeRadio" onChange={onTypeChange} value={'0'}/>
                    <label htmlFor="type0" className='pl-1 mr-3 mb-0'>신규주문</label>
                    <input type="radio" id="type1" name="typeRadio" onChange={onTypeChange} value={'1'} />
                    <label htmlFor="type1" className='pl-1 mr-3 mb-0'>배송대기</label>
                    <input type="radio" id="type2" name="typeRadio" onChange={onTypeChange} value={'2'} />
                    <label htmlFor="type2" className='pl-1 mr-3 mb-0'>출하</label>
                </span>


                {
                    (type === '0' && list.length > 0) &&
                    <Right>
                        <Button fg={'white'} bg={'green'} fontSize={12} onClick={onOrderAllConfirm}>전체 주문확인</Button>
                    </Right>
                }

            </Flex>
            <div>
                {
                    !list ? <Skeleton.List count={4}/> :
                        <InfiniteScroll
                            dataLength={list.length}
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
                            {/*<ProducerOrderList data={list} refreshCallback={fetch}/>*/}


                            {
                                list.map((orderDetail, index, orderDetailList) =>
                                    <Fragment key={orderDetail.orderSeq}>
                                        {
                                            ComUtil.isNewGroup('orderSubGroupNo', orderDetail, index, orderDetailList) &&
                                            <SubGroupLabel orderSubGroupNo={orderDetail.orderSubGroupNo} />
                                        }
                                        <ProducerOrderCard
                                            key={orderDetail.orderSeq}
                                            orderDetail = {orderDetail}
                                            //대체상품 정보 (바코드 찍힌 정보)
                                            replaceOrderInfo={(replaceOrderInfo && replaceOrderInfo[orderDetail.orderSeq]) ? replaceOrderInfo[orderDetail.orderSeq] : null}
                                            //대체상품 요청 (native에 바코드 요청)
                                            onRequestReplaceOrderClick={onRequestReplaceOrderClick.bind(this, orderDetail)}
                                            //대체상품 바코드 정보 front 변수 클리어
                                            onReplaceOrderCancelClick={onReplaceOrderCancelClick.bind(this, orderDetail)}
                                            //대체상품 바코드 정보 front 변수 클리어(구분해서)
                                            onReplaceOrderClear={onReplaceOrderClear}
                                            refreshCountInfo={refreshCountInfo}

                                            //2208 웹에서 바코드 읽는 Input
                                            // webBarcodeRead = {(!ComUtil.isMobileApp() && webBarcodeMode && orderSeqRef.current===orderDetail.orderSeq)?true:false}
                                            onWebBarcodeReadDone={onWebBarcodeReadDone}
                                            onWebBarcodeReadCancel={onWebBarcodeReadCancel}

                                        />
                                    </Fragment>
                                )
                            }

                        </InfiniteScroll>
                }
            </div>
        </Div>
    )

}

const HeaderButton = ({children, active, onClick, disabled}) => {
    return(
        <Div flexGrow={1} py={10}
             textAlign={'center'} cursor={1}
             fg={active ? 'black':'secondary'}
             custom={`
                border-bottom: 2px solid ${active ? color.dark : color.white};
             `}
            // style={{borderBottom:active?'solid':''}}
             onClick={disabled ? null:onClick}
        >{children}</Div>
    )
}

export default withRouter(OrderList);