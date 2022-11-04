import React, {useEffect, useRef, useState, Fragment} from "react";
import {Div, Flex, Hr, JustListSpace, Right, Space, Span} from "~/styledComponents/shared";
import ReactToPrint, { useReactToPrint } from "react-to-print";
import AdminLayouts from "~/styledComponents/shared/AdminLayouts";
import styled from "styled-components";
import {Spinner, Table} from "reactstrap";
import ComUtil from "~/util/ComUtil";
import {updateOrderSubGroupPrinted, getOrderSubGroupListByOrderSubGroupNos, getOrderDetailListByOrderSubGroupNos} from '~/lib/producerApi'
import {BsPrinter, IoRefresh} from "react-icons/all";
import { QRCode } from "react-qr-svg";
import {Server} from "~/components/Properties";
import Checkbox from "~/components/common/checkboxes/Checkbox";
import MathUtil from "~/util/MathUtil";

const DescRow = ({title, children}) => <Flex>
    <Div width={100}>{title}</Div>
    <Div fontSize={18}> : {children}</Div>
</Flex>

function OrderListModalContent({orderSubGroupNoList}) {

    const [subGroupOrdersObj, setSubGroupOrdersObj] = useState()
    const [subGroupCount, setSubGroupCount] = useState(0)
    const [objectUnitGoodsCount, setObjectUnitGoodsCount] = useState(0)

    const [isAllPrinted, setAllPrinted] = useState(false)
    const [showPrivateInfo, setShowPrivateInfo] = useState(false)
    const [loading, setLoading] = useState(true)

    const printSummaryRef = useRef()
    const printDetailRef = useRef()

    // const subGroupOrdersObj = {}
    // //서브 그룹 카운트
    // let subGroupCount = 0
    // //실물확인 상품 카운트
    // let objectUnitGoodsCount = 0

    useEffect(() => {
        searchSubGroupList()
        //checkAllPrinted
    }, [])

    const searchSubGroupList = async () => {

        try {
            setLoading(true)

            const res = await Promise.all([
                getOrderSubGroupListByOrderSubGroupNos(orderSubGroupNoList),
                getOrderDetailListByOrderSubGroupNos(orderSubGroupNoList)
            ])

            console.log({res})

            // if (status !== 200){
            //     alert('에러가 발생 하였습니다. 새로고침이나 로그인을 다시 시도 해 주세요.')
            //     return
            // }

            //서브그룹리스트 조회
            const groupData = res[0].data
            //주문상세 리스트
            const data = res[1].data
            // const {status: groupStatus, data: groupData} =  await getOrderSubGroupListByOrderSubGroupNos(orderSubGroupNoList)


            // //주문상세 조회
            // const {status, data} = await getOrderDetailListByOrderSubGroupNos(orderSubGroupNoList)

            console.log({data})

            // if (status !== 200){
            //     alert('에러가 발생 하였습니다. 새로고침이나 로그인을 다시 시도 해 주세요.')
            //     return
            // }

            const newSubGroupOrdersObj = {}

            //서브 그룹 카운트
            let newSubGroupCount = 0;

            //실물확인 상품 카운트
            let newObjectUnitGoodsCount = 0

            //주문상세 loop
            data.map(order => {

                //서브그룹
                const groupItem = groupData.find(group => group.orderSubGroupNo === order.orderSubGroupNo)

                if (!newSubGroupOrdersObj[order.orderSubGroupNo]) {
                    newSubGroupOrdersObj[order.orderSubGroupNo] = []
                    newSubGroupCount++
                }

                if (order.objectUniqueNo) {
                    newObjectUnitGoodsCount++
                }

                order.localKey = groupItem.localKey

                newSubGroupOrdersObj[order.orderSubGroupNo].push(order)
            })

            setSubGroupOrdersObj(newSubGroupOrdersObj)
            setSubGroupCount(newSubGroupCount)
            setObjectUnitGoodsCount(newObjectUnitGoodsCount)

            // setLoading(false)
        }catch (err) {
            // setLoading(false)
        }finally {
            setLoading(false)
        }
    }

    const handleSummaryPrint = useReactToPrint({
        // onAfterPrint: function () {
        // },
        removeAfterPrint: true,
        content: () => printSummaryRef.current,
    });

    const handleDetailPrint = useReactToPrint({
        // onAfterPrint: async function () {
        //     if (window.confirm('출력이 제대로 되었습니까?')) {
        //         await updateOrderSubGroupPrinted()
        //     }
        // },
        removeAfterPrint: true,
        content: () => printDetailRef.current,
    });

    //orderDetail printed 업데이트
    const updatePrinted = async () => {

        if (window.confirm('출력됨으로 처리 하시겠습니까? (되돌릴 수 없습니다)')) {

            const orderSubGroupNoList = Object.keys(subGroupOrdersObj)

            const {status, data} = await updateOrderSubGroupPrinted(orderSubGroupNoList)

            if (status !== 200 || !data) {
                alert('로그인을 다시 해 주세요')
                return
            }

            alert('출력됨으로 처리 되었습니다')

            await checkAllPrinted()
        }
    }

    useEffect(() => {

        //프린트 모두 되었는지 체크
        checkAllPrinted()

    }, [])


    //프린트 모두 되었는지 체크
    async function checkAllPrinted() {

        // const orderSubGroupNoList = Object.keys(subGroupOrdersObj)

        //orderSubGroup 목록 조회(orderSubGroupNo 로)
        const {status, data} = await getOrderSubGroupListByOrderSubGroupNos(orderSubGroupNoList)

        if (status !== 200 || !data) {
            alert('에러가 발생 하였습니다. 새로고침 해 주세요.')
            return
        }

        const printed = data.every(orderSubGroup => {
            if (!orderSubGroup.printed) {
                return false
            }
            return true
        })
        setAllPrinted(printed)
    }


    if (loading) return <Flex height={100} justifyContent={'center'}><Spinner color="success" /></Flex>

    return(
        <>

            <Flex>
                {
                    isAllPrinted && (<Div mb={16}>(주의) 모두 출력 된 상태 입니다. (중복 출력 주의)</Div>)
                }
                <Right>
                    <Checkbox bg={'green'} checked={showPrivateInfo} onChange={() => setShowPrivateInfo(!showPrivateInfo)}>별표(**) 해제</Checkbox>
                </Right>
            </Flex>

            <Space mb={16}>
                <AdminLayouts.MenuButton disabled={orderSubGroupNoList.length === 0} onClick={searchSubGroupList}><IoRefresh size={18} style={{marginRight:10}} />새로고침</AdminLayouts.MenuButton>
                <AdminLayouts.MenuButton bg={'green'} disabled={orderSubGroupNoList.length === 0} onClick={handleSummaryPrint}><BsPrinter style={{marginRight:10}} />집계(관리자용) 출력</AdminLayouts.MenuButton>
                <AdminLayouts.MenuButton bg={'green'} disabled={orderSubGroupNoList.length === 0} onClick={handleDetailPrint}><BsPrinter style={{marginRight:10}} />고객용 출력</AdminLayouts.MenuButton>
                <AdminLayouts.MenuButton disabled={isAllPrinted} onClick={updatePrinted} >{isAllPrinted ? '모두 출력됨' : '출력완료로 처리'}</AdminLayouts.MenuButton>

                {/* 주문집계 프린트하기 버튼 */}
                {/*<ReactToPrint*/}
                {/*    trigger={() => <AdminLayouts.MenuButton bg={'green'} disabled={selectedRows.length === 0}>집계(관리자용) 프린트</AdminLayouts.MenuButton>}*/}
                {/*    content={() => printSummaryRef.current}*/}
                {/*/>*/}

                {/* 주문상세 프린트하기 버튼 */}
                {/*<ReactToPrint*/}
                {/*    trigger={() => <AdminLayouts.MenuButton bg={'green'} disabled={selectedRows.length === 0}>고객용 프린트</AdminLayouts.MenuButton>}*/}
                {/*    content={() => printDetailRef.current}*/}
                {/*/>*/}
            </Space>

            <SummaryComponent showStatus={true} objectUnitGoodsCount={objectUnitGoodsCount} subGroupCount={subGroupCount} subGroupOrdersObj={subGroupOrdersObj} showPrivateInfo={showPrivateInfo} />

            {/*<div ref={printSummaryRef}>*/}
            {/*    <Div mb={16}>*/}
            {/*        <Div bold fg={'danger'} mb={16}>*출력 전 주문확인을 꼭 해 주세요. 포장 중 주문취소가 발생 할 수 있습니다!!</Div>*/}
            {/*        <h4>집계</h4>*/}
            {/*        주문 수량 : {subGroupCount}건<br/>*/}
            {/*        실물확인 상품 수량 : {objectUnitGoodsCount}건<br/>*/}
            {/*    </Div>*/}

            {/*    {*/}
            {/*        Object.values(subGroupOrdersObj).map(orderList =>*/}
            {/*            <>*/}
            {/*                <SubGroup orderList={orderList} showDesc={false} />*/}
            {/*                <Hr bc={'black'} my={20}/>*/}
            {/*            </>*/}
            {/*        )*/}
            {/*    }*/}

            {/*</div>*/}

            {/* 관리자용 집계 리스트 */}
            <div style={{display: 'none'}} >
                <div ref={printSummaryRef}>
                    <SummaryComponent showStatus={true} objectUnitGoodsCount={objectUnitGoodsCount} subGroupCount={subGroupCount} subGroupOrdersObj={subGroupOrdersObj} />
                </div>
            </div>

            {/* 고객용 낱장 리스트 */}
            <div style={{display: 'none'}}>
                <div ref={printDetailRef}>
                    <ConsumerComponent subGroupOrdersObj={subGroupOrdersObj} />
                </div>
            </div>
        </>
    )
}
export default OrderListModalContent



const PrintWrapper = styled.div`
    @page {size:21cm 29.7cm;margin: 15px}

    @media all {
        .page-break {
            display: none;
        }
    }
    
    @media print {
        html, body {
            height: initial !important;
            overflow: initial !important;
            -webkit-print-color-adjust: exact;
        }
    }
    
    @media print {
        .page-break {
            margin: 10rem;
            display: block;
            page-break-before: auto;
        }
    }
    
    //중요
    // 항상 프린트의 설정이 우선시 되며 
    // 프린트 설정 > 기본 여백 일 경우 아래가 적용 됨
    @page {
        size: auto;
        margin: 10mm;
        
        @bottom-left {
            content: counter(page) ' of ' counter(pages);
        }
    }
`

const SummaryComponent = ({showStatus, subGroupCount, objectUnitGoodsCount, subGroupOrdersObj, showPrivateInfo}) => {
    return(
        <div>
            <Div mb={16}>
                <Div bold fg={'danger'} mb={16}>*출력 전 주문확인을 꼭 해 주세요. 포장 중 주문취소가 발생 할 수 있습니다!!</Div>
                <h4>집계</h4>
                주문 수량 : {subGroupCount}건<br/>
                실물확인 상품 수량 : {objectUnitGoodsCount}건<br/>
            </Div>
            {
                Object.values(subGroupOrdersObj).map(orderList =>
                    <Fragment key={orderList[0].orderSubGroupNo}>
                        <SubGroup showStatus={showStatus} orderList={orderList} showDesc={false} showPrivateInfo={showPrivateInfo}/>
                        <Hr bc={'black'} my={20}/>
                    </Fragment>
                )
            }
        </div>
    )
}

//계란,유정란,달걀 주문이 있는지 체크.
const existEggOrder = (orderList) => {
    let eggOrders = orderList.filter((order) => order.goodsOptionNm.indexOf('유정란') >= 0||order.goodsOptionNm.indexOf('계란') >= 0||order.goodsOptionNm.indexOf('달걀') >= 0)
    if (eggOrders.length > 0) {
        return true;
    }
    return false;
}

//프린트 고객용 될 컴포넌트
const ConsumerComponent = ({subGroupOrdersObj = {}}) => {
    return (
        <PrintWrapper>
            {
                Object.values(subGroupOrdersObj).map((orderList, index) => {
                    const cancelledList = orderList.filter( orderDetail => (orderDetail.payStatus ==='cancelled' || orderDetail.payStatus==='revoked') );
                    const bAllCancel = orderList.length == cancelledList.length ? true:false;
                    return(
                        <div key={orderList[0].orderSubGroupNo}>
                            <Div //className="page-break"
                                custom={`page-break-after: always;`}/>
                            {
                                existEggOrder(orderList) && //상품명에 유정란/계란 포함시 주의 문구 추가.
                                <Div fontSize={80} mb={20}>
                                    계란-파손주의
                                </Div>
                            }
                            <Div fontSize={80} mb={20}>
                                <span>({orderList[0].localKey})</span>
                                {
                                    orderList[0].receiverRoadAddr != null ?
                                        <span style={{textDecoration: bAllCancel === true && 'line-through'}}>({orderList[0].receiverZipNo}) {orderList[0].receiverRoadAddr} {orderList[0].receiverAddrDetail}</span>
                                        :
                                        <span style={{textDecoration: bAllCancel === true && 'line-through'}}>({orderList[0].receiverZipNo}) {orderList[0].receiverAddr} {orderList[0].receiverAddrDetail}</span>
                                }
                            </Div>
                            <SubGroup orderList={orderList} showDesc={true} />
                        </div>
                    )
                })
            }
        </PrintWrapper>
    )
};

function SubGroup({orderList, showStatus = false, showDesc = true, showPrivateInfo = false}) {
    const item = orderList[0]
    const cancelledList = orderList.filter( orderDetail => (orderDetail.payStatus ==='cancelled' || orderDetail.payStatus==='revoked') );
    const bAllCancel = orderList.length == cancelledList.length ? true:false;
    const totDeliveryFee = orderList ? orderList.reduce(function(total,currentValue){return total+currentValue.adminDeliveryFee;},0):0;
    return(
        <div>
            {
                showDesc && (
                    <Flex mb={16}>
                        <Div>
                            <b>꼭! 확인해 주세요!</b><br/>
                            * 받으신 상품에 이상이 있거나 주문내역과 다를 경우 <b><u>마이페이지</u> > <u>주문목록</u></b>에서 확인해 주시기 바랍니다.<br/>
                            * 아래 내역은 결제시 적용된 할인 내역을 포함하고 있지 않습니다.<br/>
                            * 담으신 상품이 없을 경우 자동 부분취소 됩니다.
                        </Div>
                        <Right>
                            <QRCode
                                bgColor="#FFFFFF"
                                fgColor="#000000"
                                level="Q"
                                style={{width: 130}}
                                value={`${Server.getServerURL()}/local/delivery/${orderList[0].orderSubGroupNo}`}
                            />
                        </Right>
                    </Flex>

                )
            }

            <Flex mb={16}>
                <Space fontSize={22} spaceGap={16}>
                    <div>
                        주문상세
                    </div>
                    <div>주문그룹번호 {item.orderSubGroupNo} ({item.localKey})</div>
                    {
                        bAllCancel === true && (
                            <Span fg={'red'}>(취소완료)</Span>
                        )
                    }
                </Space>
                <Space ml={'auto'}>
                    <Span>주문일시 : {ComUtil.utcToString(item.orderDate, 'YYYY-MM-DD HH:mm')}</Span>
                    {/*<Span>주문그룹번호 : <b>{item.orderSubGroupNo}</b></Span>*/}
                </Space>
            </Flex>
            <Table responsive>
                <thead>
                <tr>
                    <th style={{width: 50, textAlign: 'center'}}>
                        번호
                    </th>
                    {
                        showStatus && (
                            <th style={{width:80}}>
                                상태
                            </th>
                        )
                    }

                    <th style={{width: 140}}>
                        농가
                    </th>
                    <th>
                        상품명
                    </th>
                    <th>
                        옵션
                    </th>
                    <th style={{width: 50}}>
                        수량
                    </th>
                    <th style={{width: 100}}>
                        단가
                    </th>
                    <th style={{width: 100}}>
                        금액
                    </th>
                </tr>
                </thead>
                <tbody>
                {
                    orderList.map((order, index) =>
                        <tr key={order.orderSeq}>
                            <th scope="row">
                                {index+1}
                            </th>
                            {
                                showStatus && (
                                    <td>
                                        {
                                            order.payStatus === 'paid' && (
                                                <>
                                                    {order.orderConfirm === 'confirmed' && '배송대기'}
                                                    {order.orderConfirm === 'shipping' && '출하완료'}
                                                </>
                                            )
                                        }
                                        {order.payStatus === 'cancelled' && '취소완료'}
                                    </td>
                                )
                            }
                            <td style={{textDecoration: order.payStatus === 'cancelled' && 'line-through'}}>
                                {order.localFarmerName}
                            </td>
                            <td>
                                <span style={{textDecoration: order.payStatus === 'cancelled' && 'line-through'}}>
                                {order.goodsNm}
                                </span>
                            </td>
                            <td style={{fontWeight: order.objectUniqueNo ? 'bold' : null, textDecoration: order.payStatus === 'cancelled' && 'line-through'}}>
                                {
                                    // order.payStatus !== 'cancelled' ?

                                }

                                <span style={{textDecoration: order.payStatus === "cancelled" && 'line-through'}}>
                                    {order.objectUniqueNo ? <u>*(실물확인) </u> : ''}
                                    {order.optionName}
                                </span>
                                {
                                    (order.payStatus === "cancelled" && order.producerCancelReason) && (
                                        <Span ml={5}>
                                            ({order.producerCancelReason})
                                        </Span>
                                    )
                                }

                            </td>
                            <td style={{textDecoration: order.payStatus === 'cancelled' && 'line-through'}}>
                                {order.orderCnt}
                            </td>
                            <td style={{textDecoration: order.payStatus === 'cancelled' && 'line-through'}}>
                                {ComUtil.addCommas(order.currentPrice)}
                            </td>
                            <td style={{textDecoration: order.payStatus === 'cancelled' && 'line-through'}}>
                                {ComUtil.addCommas(MathUtil.multipliedBy(order.currentPrice,order.orderCnt))}
                            </td>
                        </tr>
                    )
                }
                </tbody>
            </Table>

            <div>
                {
                    showPrivateInfo ? <DescRow title={'수령자'}>{item.receiverName} ({item.receiverPhone})</DescRow> :
                        <DescRow title={'수령자'}>
                            <Span style={{textDecoration: bAllCancel === true && 'line-through'}}>
                                {(item.receiverName && item.receiverName.length > 1) ? item.receiverName.substr(0,1) + '***' : '***'}
                            </Span>
                            <Span ml={10} style={{textDecoration: bAllCancel === true && 'line-through'}}>
                                ({ComUtil.maskingPhone(item.receiverPhone)})
                            </Span>
                        </DescRow>
                }

                <DescRow title={'주소'}>
                    {
                        item.receiverRoadAddr != null ?
                            <span style={{textDecoration: bAllCancel === true && 'line-through'}}>({item.receiverZipNo}) {item.receiverRoadAddr} {item.receiverAddrDetail}</span>
                            :
                            <span style={{textDecoration: bAllCancel === true && 'line-through'}}>({item.receiverZipNo}) {item.receiverAddr} {item.receiverAddrDetail}</span>
                    }
                </DescRow>
                <DescRow title={'배송메세지'}><span style={{textDecoration: bAllCancel === true && 'line-through'}}>{item.deliveryMsg}</span></DescRow>
                {
                    item.commonEnterPwd &&
                        <DescRow title={'공동현관출입번호'}><span style={{textDecoration: bAllCancel === true && 'line-through'}}>{item.commonEnterPwd}</span></DescRow>
                }
                <DescRow title={'배송비'}>
                    <span style={{textDecoration: bAllCancel === true && 'line-through'}}>{ComUtil.addCommas(totDeliveryFee)}원</span>
                </DescRow>
            </div>
        </div>
    )
}

// import React, {useEffect, useRef, useState} from "react";
// import {Div, Flex, Hr, JustListSpace, Right, Space, Span} from "~/styledComponents/shared";
// import ReactToPrint, { useReactToPrint } from "react-to-print";
// import AdminLayouts from "~/styledComponents/shared/AdminLayouts";
// import styled from "styled-components";
// import {Table} from "reactstrap";
// import ComUtil from "~/util/ComUtil";
// import moment from 'moment-timezone'
// import {updateOrderSubGroupPrinted, getOrderSubGroupListByOrderSubGroupNos} from '~/lib/producerApi'
// import {BsPrinter} from "react-icons/all";
// import { QRCode } from "react-qr-svg";
// import {Server} from "~/components/Properties";
// import Checkbox from "~/components/common/checkboxes/Checkbox";
//
// const DescRow = ({title, children}) => <Flex>
//     <Div width={100}>{title}</Div>
//     <div> : {children}</div>
// </Flex>
//
// function OrderListModalContent({selectedRows}) {
//
//     const [isAllPrinted, setAllPrinted] = useState(false)
//     const [showPrivateInfo, setShowPrivateInfo] = useState(false)
//
//     const printSummaryRef = useRef()
//     const printDetailRef = useRef()
//
//     const subGroupOrdersObj = {}
//     //서브 그룹 카운트
//     let subGroupCount = 0
//     //실물확인 상품 카운트
//     let objectUnitGoodsCount = 0
//
//     selectedRows.map(order => {
//         if (!subGroupOrdersObj[order.orderSubGroupNo]) {
//             subGroupOrdersObj[order.orderSubGroupNo] = []
//             subGroupCount++
//         }
//
//         if (order.objectUniqueNo) {
//             objectUnitGoodsCount++
//         }
//         subGroupOrdersObj[order.orderSubGroupNo].push(order)
//     })
//
//     const handleSummaryPrint = useReactToPrint({
//         // onAfterPrint: function () {
//         // },
//         removeAfterPrint: true,
//         content: () => printSummaryRef.current,
//     });
//
//     const handleDetailPrint = useReactToPrint({
//         // onAfterPrint: async function () {
//         //     if (window.confirm('출력이 제대로 되었습니까?')) {
//         //         await updateOrderSubGroupPrinted()
//         //     }
//         // },
//         removeAfterPrint: true,
//         content: () => printDetailRef.current,
//     });
//
//     //orderDetail printed 업데이트
//     const updatePrinted = async () => {
//
//         if (window.confirm('출력됨으로 처리 하시겠습니까? (되돌릴 수 없습니다)')) {
//
//             const orderSubGroupNoList = Object.keys(subGroupOrdersObj)
//
//             const {status, data} = await updateOrderSubGroupPrinted(orderSubGroupNoList)
//
//             if (status !== 200 || !data) {
//                 alert('로그인을 다시 해 주세요')
//                 return
//             }
//
//             alert('출력됨으로 처리 되었습니다')
//
//             await checkAllPrinted()
//         }
//     }
//
//     useEffect(() => {
//
//         //프린트 모두 되었는지 체크
//         checkAllPrinted()
//
//     }, [])
//
//
//     //프린트 모두 되었는지 체크
//     async function checkAllPrinted() {
//
//         const orderSubGroupNoList = Object.keys(subGroupOrdersObj)
//
//         //orderSubGroup 목록 조회(orderSubGroupNo 로)
//         const {status, data} = await getOrderSubGroupListByOrderSubGroupNos(orderSubGroupNoList)
//
//         if (status !== 200 || !data) {
//             alert('에러가 발생 하였습니다. 새로고침 해 주세요.')
//             return
//         }
//
//         const printed = data.every(orderSubGroup => {
//             if (!orderSubGroup.printed) {
//                 return false
//             }
//             return true
//         })
//         setAllPrinted(printed)
//     }
//
//
//     return(
//         <>
//
//             <Flex>
//                 {
//                     isAllPrinted && (<Div mb={16}>(주의) 모두 출력 된 상태 입니다. (중복 출력 주의)</Div>)
//                 }
//                 <Right>
//                     <Checkbox bg={'green'} checked={showPrivateInfo} onChange={() => setShowPrivateInfo(!showPrivateInfo)}>별표(**) 해제</Checkbox>
//                 </Right>
//             </Flex>
//
//             <Space mb={16}>
//                 <AdminLayouts.MenuButton bg={'green'} disabled={selectedRows.length === 0} onClick={handleSummaryPrint}><BsPrinter /> 집계(관리자용) 출력</AdminLayouts.MenuButton>
//                 <AdminLayouts.MenuButton bg={'green'} disabled={selectedRows.length === 0} onClick={handleDetailPrint}><BsPrinter /> 고객용 출력</AdminLayouts.MenuButton>
//                 <AdminLayouts.MenuButton disabled={isAllPrinted} onClick={updatePrinted} >{isAllPrinted ? '모두 출력됨' : '출력완료로 처리'}</AdminLayouts.MenuButton>
//
//                 {/* 주문집계 프린트하기 버튼 */}
//                 {/*<ReactToPrint*/}
//                 {/*    trigger={() => <AdminLayouts.MenuButton bg={'green'} disabled={selectedRows.length === 0}>집계(관리자용) 프린트</AdminLayouts.MenuButton>}*/}
//                 {/*    content={() => printSummaryRef.current}*/}
//                 {/*/>*/}
//
//                 {/* 주문상세 프린트하기 버튼 */}
//                 {/*<ReactToPrint*/}
//                 {/*    trigger={() => <AdminLayouts.MenuButton bg={'green'} disabled={selectedRows.length === 0}>고객용 프린트</AdminLayouts.MenuButton>}*/}
//                 {/*    content={() => printDetailRef.current}*/}
//                 {/*/>*/}
//             </Space>
//
//             <SummaryComponent objectUnitGoodsCount={objectUnitGoodsCount} printRef={printSummaryRef} subGroupCount={subGroupCount} subGroupOrdersObj={subGroupOrdersObj} showPrivateInfo={showPrivateInfo} />
//
//             {/*<div ref={printSummaryRef}>*/}
//             {/*    <Div mb={16}>*/}
//             {/*        <Div bold fg={'danger'} mb={16}>*출력 전 주문확인을 꼭 해 주세요. 포장 중 주문취소가 발생 할 수 있습니다!!</Div>*/}
//             {/*        <h4>집계</h4>*/}
//             {/*        주문 수량 : {subGroupCount}건<br/>*/}
//             {/*        실물확인 상품 수량 : {objectUnitGoodsCount}건<br/>*/}
//             {/*    </Div>*/}
//
//             {/*    {*/}
//             {/*        Object.values(subGroupOrdersObj).map(orderList =>*/}
//             {/*            <>*/}
//             {/*                <SubGroup orderList={orderList} showDesc={false} />*/}
//             {/*                <Hr bc={'black'} my={20}/>*/}
//             {/*            </>*/}
//             {/*        )*/}
//             {/*    }*/}
//
//             {/*</div>*/}
//
//             {/* 관리자용 집계 리스트 */}
//             <div style={{display: 'none'}} >
//                 <div ref={printSummaryRef}>
//                     <SummaryComponent objectUnitGoodsCount={objectUnitGoodsCount} printRef={printSummaryRef} subGroupCount={subGroupCount} subGroupOrdersObj={subGroupOrdersObj} />
//                 </div>
//             </div>
//
//             {/* 고객용 낱장 리스트 */}
//             <div style={{display: 'none'}}>
//                 <div ref={printDetailRef}>
//                     <ConsumerComponent subGroupOrdersObj={subGroupOrdersObj} />
//                 </div>
//             </div>
//         </>
//     )
// }
// export default OrderListModalContent
//
//
//
// const PrintWrapper = styled.div`
//     @page {size:21cm 29.7cm;margin: 15px}
//
//     @media all {
//         .page-break {
//             display: none;
//         }
//     }
//
//     @media print {
//         html, body {
//             height: initial !important;
//             overflow: initial !important;
//             -webkit-print-color-adjust: exact;
//         }
//     }
//
//     @media print {
//         .page-break {
//             margin: 10rem;
//             display: block;
//             page-break-before: auto;
//         }
//     }
//
//     //중요
//     // 항상 프린트의 설정이 우선시 되며
//     // 프린트 설정 > 기본 여백 일 경우 아래가 적용 됨
//     @page {
//         size: auto;
//         margin: 10mm;
//
//         @bottom-left {
//             content: counter(page) ' of ' counter(pages);
//         }
//     }
// `
//
// const SummaryComponent = ({subGroupCount, objectUnitGoodsCount, subGroupOrdersObj, showPrivateInfo}) => {
//     return(
//         <div>
//             <Div mb={16}>
//                 <Div bold fg={'danger'} mb={16}>*출력 전 주문확인을 꼭 해 주세요. 포장 중 주문취소가 발생 할 수 있습니다!!</Div>
//                 <h4>집계</h4>
//                 주문 수량 : {subGroupCount}건<br/>
//                 실물확인 상품 수량 : {objectUnitGoodsCount}건<br/>
//             </Div>
//
//             {
//                 Object.values(subGroupOrdersObj).map(orderList =>
//                     <>
//                         <SubGroup orderList={orderList} showDesc={false} showPrivateInfo={showPrivateInfo}/>
//                         <Hr bc={'black'} my={20}/>
//                     </>
//                 )
//             }
//
//         </div>
//     )
// }
//
// //프린트 고객용 될 컴포넌트
// const ConsumerComponent = ({subGroupOrdersObj = {}}) => {
//     return (
//             <PrintWrapper>
//                 {
//                     Object.values(subGroupOrdersObj).map((orderList, index) =>
//                         <div key={index}>
//                             <Div //className="page-break"
//                                 custom={`page-break-after: always;`}/>
//                             <SubGroup orderList={orderList} showDesc={true} />
//                         </div>
//                     )
//                 }
//             </PrintWrapper>
//     )
// };
//
//
// function SubGroup({orderList, showDesc = true, showPrivateInfo = false}) {
//     const item = orderList[0]
//     return(
//         <div>
//             {
//                 showDesc && (
//                     <Flex mb={16}>
//                         <Div>
//                             <b>꼭! 확인해 주세요!</b><br/>
//                             * 받으신 상품에 이상이 있거나 주문내역과 다를 경우 <b><u>마이페이지</u> > <u>주문목록</u></b>에서 확인해 주시기 바랍니다.<br/>
//                             * 아래 내역은 결제시 적용된 할인 내역을 포함하고 있지 않습니다.<br/>
//                             * 담으신 상품이 없을 경우 자동 부분취소 됩니다.
//                         </Div>
//                         <Right>
//                             <QRCode
//                                 bgColor="#FFFFFF"
//                                 fgColor="#000000"
//                                 level="Q"
//                                 style={{width: 130}}
//                                 value={`${Server.getServerURL()}/delivery?orderSubGroupNo=${orderList[0].orderSubGroupNo}`}
//                             />
//                         </Right>
//                     </Flex>
//
//                 )
//             }
//
//             <Flex mb={16}>
//                 <h4>주문상세</h4>
//                 <Space ml={'auto'}>
//                     <Span>주문일시 : {ComUtil.utcToString(item.orderDate, 'YYYY-MM-DD HH:mm')}</Span>
//                     <Span>주문그룹번호 : {item.orderSubGroupNo}</Span>
//                 </Space>
//             </Flex>
//             <Table responsive>
//                 <thead>
//                 <tr>
//                     <th style={{width: 50, textAlign: 'center'}}>
//                         번호
//                     </th>
//                     <th style={{width: 100}}>
//                         농가
//                     </th>
//                     <th>
//                         상품명
//                     </th>
//                     <th>
//                         옵션
//                     </th>
//                     <th style={{width: 50}}>
//                         수량
//                     </th>
//                     <th style={{width: 100}}>
//                         단가
//                     </th>
//                     <th style={{width: 100}}>
//                         금액
//                     </th>
//                 </tr>
//                 </thead>
//                 <tbody>
//                 {
//                     orderList.map((order, index) =>
//                         <tr>
//                             <th scope="row">
//                                 {index+1}
//                             </th>
//
//                             <td>
//                                 {order.localFarmerName}
//                             </td>
//                             <td>
//                                 <span style={{textDecoration: order.payStatus === 'cancelled' && 'line-through'}}>
//                                 {order.goodsNm}
//                                 </span>
//                             </td>
//                             <td style={{fontWeight: order.objectUniqueNo ? 'bold' : null}}>
//                                 {
//                                     // order.payStatus !== 'cancelled' ?
//
//                                 }
//
//                                 <span style={{textDecoration: order.payStatus === 'cancelled' && 'line-through'}}>
//                                     {order.objectUniqueNo ? <u>*(실물확인) </u> : ''}
//                                     {order.optionName}
//                                 </span>
//                                 {
//                                     order.payStatus === 'cencelled' && (
//                                         <Span ml={5}>
//                                             ({order.producerCancelReason})
//                                         </Span>
//                                     )
//                                 }
//
//                             </td>
//                             <td>
//                                 {order.orderCnt}
//                             </td>
//                             <td>
//                                 {ComUtil.addCommas(order.currentPrice)}
//                             </td>
//                             <td>
//                                 {ComUtil.addCommas(order.currentPrice * order.orderCnt)}
//                             </td>
//                         </tr>
//                     )
//                 }
//                 </tbody>
//             </Table>
//
//             <div>
//                 {
//                     showPrivateInfo ? <DescRow title={'수령자'}>{item.receiverName} ({item.receiverPhone})</DescRow> :
//                         <DescRow title={'수령자'}>
//                             <Span>
//                                 {(item.receiverName && item.receiverName.length > 1) ? item.receiverName.substr(0,1) + '***' : '***'}
//                             </Span>
//                             <Span ml={10}>
//                                 ({ComUtil.maskingPhone(item.receiverPhone)})
//                             </Span>
//
//
//                         </DescRow>
//                 }
//
//                 <DescRow title={'주소'}>({item.receiverZipNo}) {item.receiverAddr} {item.receiverAddrDetail}</DescRow>
//                 <DescRow title={'배송메세지'}>{item.deliveryMsg}</DescRow>
//                 <DescRow title={'배송비'}>{ComUtil.addCommas(item.adminDeliveryFee)}원</DescRow>
//             </div>
//         </div>
//     )
// }
//
//
// function getPrivatePhoneNumber(phone) {
//     const spPhone = phone.split('-')
//     if (spPhone.length > 0) {
//         return '******'+spPhone[spPhone.length-1]
//     }
// }
