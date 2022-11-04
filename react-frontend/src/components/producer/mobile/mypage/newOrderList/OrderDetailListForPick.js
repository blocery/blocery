import React, {useEffect, useLayoutEffect, useState, useRef} from 'react';
import {getOrderDetailByOrderSeq, getOrderDetailListSorted, updateAddGoodsToBoxFlag} from '~/lib/producerApi'
import {Button, Div, Flex, Hr, Img, Right, Space, Span} from "~/styledComponents/shared";
import {Modal, ModalBody, ModalFooter, ModalHeader, Spinner} from "reactstrap";
import {Server} from "~/components/Properties";
import ComUtil from "~/util/ComUtil";
import {IoIosBarcode, IoMdRefresh} from "react-icons/io";
import BarcodeInput from "~/components/producer/mobile/common/BarcodeInput";
import OrderFunctionality from "~/components/producer/mobile/common/OrderFunctionality";
import styled from "styled-components";
import {useModal} from "~/util/useModal";
import {AiFillFilter, AiOutlineFilter, BsImage, BsImages, GrRefresh, MdExpandLess, MdExpandMore} from "react-icons/all";
import GoodsImagesSwiper from "~/components/shop/goods/components/GoodsImagesSwiper";
import GoodsImages from "~/components/producer/mobile/common/GoodsImages";
import {color} from "~/styledComponents/Properties";
import {FlexButton} from "~/components/producer/mobile/common/Style";
import Skeleton from "~/components/common/cards/Skeleton";
import InfiniteScroll from "react-infinite-scroll-component";
import Tel from "~/components/producer/mobile/common/LocalFarmerTelModal";
import LocalFarmerContent from "~/components/outside/producer/dashboard/LocalFarmerContent";
import LocalFarmerTelModal from "~/components/producer/mobile/common/LocalFarmerTelModal";
import SpinnerLoading from "~/components/common/Spinner/SpinnerLoading";
import LocalKeySelector from "~/components/producer/mobile/common/LocalKeySelector";
import {Badge} from "~/styledComponents/mixedIn";

const OPEN_KIND = {
    IMAGES: 'images',
    FUNCTIONALITY: 'functionality'
}

const Center = ({children, ...rest}) => <Flex justifyContent={'center'} minHeight={400} {...rest}>{children}</Flex>

const OrderDetailListForPick = (props) => {
    const orgListRef = useRef([]);
    const [list, setList] = useState([])
    // const [filteredList, setFilteredList] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        search()
    }, [])

    // useLayoutEffect(() => {
    //
    // }, [list])

    const search = async () => {
        console.log("search====================")
        try {
            const {status, data} = await getOrderDetailListSorted()
            if (status === 200) {
                if (data) {

                    //원본 보관
                    orgListRef.current = data

                    const filteredList = getFilteredList()

                    setList(filteredList)

                    //orderSubGroupNo 키 추출
                    const subGroupNoObj = {}
                    const subGroupNoList = []
                    data.map(order => {
                        if (!subGroupNoObj[order.localKey]) {
                            subGroupNoObj[order.localKey] = order.localKey
                            subGroupNoList.push({orderSubGroupNo: order.orderSubGroupNo, localKey: order.localKey})
                        }
                    })

                    setOrderSubGroupNoList(subGroupNoList)

                }else{
                    //로그인 만료
                    alert('로그인이 세션이 만료 되었습니다.')
                }
            }else{
                //status = 0 : 서버에러
            }
            setLoading(false)
        }catch (err) {
            console.error(err.message)
            alert(err.message)
            setLoading(false)
        }
    }

    const [isOpenLocalKey, setIsOpenLocalKey] = useState(false)
    const [orderSubGroupNoList, setOrderSubGroupNoList] = useState([])
    const [selectedSubGroupNoList, setSelectedSubGroupNoList] = useState([])

    const toggleLocalKeySelector = () => {
        setIsOpenLocalKey(prev => !prev)
    }

    const onLocalKeySelectorChange = (orderSubGroupNoList) => {
        console.log({orderSubGroupNoList: orderSubGroupNoList})
        setSelectedSubGroupNoList(orderSubGroupNoList)
    }

    const getFilteredList = () => {

        if (selectedSubGroupNoList.length <= 0)
            return orgListRef.current

        return orgListRef.current.filter(item => selectedSubGroupNoList.includes(item.orderSubGroupNo))

        // setFilteredList(filteredList)
    }

    useLayoutEffect(() => {
        const filteredList = getFilteredList()
        setList(filteredList)
    }, [selectedSubGroupNoList])

    const onOrderDetailChange = async (params) => {
        try {
            if (params.action === 'refresh') {
                await search()
            }
        }catch (err) {
            console.error(err.message)
        }

    }

    return (
        <div>
            <Div px={16} py={10} mx={16} bc={'light'} bg={'veryLight'} fontSize={13} rounded={2}>
                주문목록은 1일 기준(전일 16시 ~ 금일 16시)으로 조회 됩니다. <br/>
            </Div>
            {
                loading ? <SpinnerLoading /> : (
                    <>
                        <Space p={16}>
                            <FlexButton bg={'white'} bc={'light'} onClick={toggleLocalKeySelector}>
                                {
                                    selectedSubGroupNoList.length > 0 ? <AiFillFilter color={color.primary} /> : <AiOutlineFilter />
                                }
                                <span>필터</span>
                                {
                                    isOpenLocalKey ? <MdExpandLess size={15} /> : <MdExpandMore size={15} />
                                }
                            </FlexButton>

                            <Space overflow={'auto'} flexGrow={1} minHeight={32}>
                                {
                                    selectedSubGroupNoList.map(orderSubGroupNo => {
                                        const item = orderSubGroupNoList.find(item => item.orderSubGroupNo === orderSubGroupNo)
                                        return item ? <div>{item.localKey}</div> : null
                                    })
                                }
                            </Space>

                        </Space>
                        <LocalKeySelector isOpen={isOpenLocalKey} initialLimit={orderSubGroupNoList.length > 6 ? 6 : orderSubGroupNoList.length} orderSubGroupList={orderSubGroupNoList} selectedOrderSubGroupNoList={selectedSubGroupNoList} onChange={onLocalKeySelectorChange} onClose={toggleLocalKeySelector} />
                        <Div mt={16}>
                            <div>

                                <InfiniteScroll
                                    // scrollableTarget={'infinite-for-pick'}
                                    dataLength={list.length}
                                    next={search}
                                    hasMore={false}
                                    loader={<SpinnerLoading isMore={true} />}
                                    refreshFunction={search}
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
                                        (!loading && list.length === 0) ? <Center><div>주문 내역이 없습니다. <p><small>아래로 당겨 새로고침 하세요.</small></p> </div></Center> :
                                            list.map((orderDetail, index, arr) => {
                                                const nextOrder = arr[index+1]
                                                const key = `${orderDetail.itemName}${orderDetail.optionName}${orderDetail.localfoodFarmerNo}${orderDetail.currentPrice}`
                                                let nextKey;
                                                if(nextOrder) {
                                                    nextKey = `${nextOrder.itemName}${nextOrder.optionName}${nextOrder.localfoodFarmerNo}${nextOrder.currentPrice}`
                                                }

                                                let filteredArr;

                                                let summaryInfo;
                                                if (key !== nextKey) {

                                                    filteredArr = arr.filter(item =>
                                                        item.itemName === orderDetail.itemName &&
                                                        item.optionName === orderDetail.optionName &&
                                                        item.localfoodFarmerNo === orderDetail.localfoodFarmerNo &&
                                                        item.currentPrice === orderDetail.currentPrice
                                                    )

                                                    summaryInfo = getSummaryInfo(filteredArr)
                                                }

                                                return(
                                                    <div key={orderDetail.orderSeq}>
                                                        <OrderDetailCard orderDetail={orderDetail} onChange={onOrderDetailChange}/>
                                                        {
                                                            summaryInfo &&
                                                            <Div mb={20} px={16} pb={20} bc={'light'} bt={0} bl={0} br={0} >
                                                                <Flex fontSize={18} fg={'black'} fw={900} justifyContent={'space-between'}>
                                                                    <Div fg={'darkBlack'}>
                                                                        총 상품수량
                                                                    </Div>
                                                                    <div>{summaryInfo.orderCnt}개</div>
                                                                </Flex>
                                                                {
                                                                    filteredArr.length === summaryInfo.addedCnt ?
                                                                        <Div fg={'green'} fontSize={13} textAlign={'right'}>주문 {filteredArr.length}건 모두 담기 완료!</Div> :
                                                                        <Div fg={'danger'} fontSize={13} textAlign={'right'}>{`주문 ${filteredArr.length}건 중 ${summaryInfo.notAddedCnt}건 미 담음`}</Div>
                                                                }
                                                            </Div>

                                                        }
                                                    </div>
                                                )
                                            })
                                    }
                                </InfiniteScroll>


                            </div>
                        </Div>
                    </>
                )
            }
        </div>
    );
};

const getSummaryInfo = (arr) => {
    let orderCnt = 0;
    let addedCnt = 0;    //담기 한 카운트
    let notAddedCnt = 0; //담지 못한 카운트
    arr.map(item => {
        orderCnt += item.orderCnt

        //담기 카운트 증가
        if (item.addGoodsToBoxFlag) {
            addedCnt++
        }else{
            notAddedCnt++
        }
    })
    return {
        orderCnt,
        addedCnt,
        notAddedCnt
    }
}

export default OrderDetailListForPick;


const Grid = styled.div`
    display: grid;
    grid-template-columns: 1fr max-content;
    align-items: flex-start;
    grid-columns-gap: 8px;
    margin-bottom: 12px;
`




//TODO hook 이 없는 컴포넌트
function OrderDetailCard({orderDetail, onChange}) {
    // const [orderDetail, setOrderDetail] = useState(od)
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()

    const toggle = (kind) => {
        if (selected !== kind) {
            setModalState(true)
            setSelected(kind)
        }else{
            setModalState(false)
            setSelected('')
        }
    }

    // useEffect(() => {
    //     setOrderDetail(od)
    // }, [od])

    //주문상세 재 조회
    const refreshOrderDetail = async () => {
        // const {data} = await getOrderDetailByOrderSeq(orderDetail.orderSeq)
        // setOrderDetail(data)
        onChange({
            action: 'refresh',
            payload: orderDetail
        })
    }

    //담기 클릭
    const onPickClick = async () => {
        try {
            const {status, data: errRes} = await updateAddGoodsToBoxFlag(orderDetail.orderSeq)
            if (status === 200) {
                if (errRes) {
                    if (errRes.resCode !== 0) {
                        alert(errRes.errMsg)
                    }
                }
            }

            //부모에게 새로고침 요청
            onChange({
                action: 'refresh',
                payload: {}
            })

        }catch (err) {
            console.error(err.message)
        }
    }

    return(
        <Div mb={18}>
            <Div px={16}>
                <Flex mb={10}>
                    <Img width={40} height={40} src={Server.getThumbnailURL() + orderDetail.orderImg} onClick={toggle.bind(this, OPEN_KIND.IMAGES)}/>
                    <Div px={8} minWidth={40} textAlign={'center'}>{orderDetail.localKey}</Div>
                    {
                        (orderDetail.refundFlag || orderDetail.payStatus === 'cancelled' || orderDetail.replaceFlag) && (
                            <Badge ml={'auto'} flexShrink={0} bg={'danger'} fg={'white'} fontSize={14}>
                                {orderDetail.refundFlag ? '환불' :
                                    orderDetail.payStatus === 'cancelled' ?
                                        orderDetail.cancelType === 0 ?
                                            orderDetail.dpCancelReason ? `생산자취소(${orderDetail.dpCancelReason})` : '소비자취소' :
                                            orderDetail.cancelType === 1 ? '소비자취소' : `생산자취소(${orderDetail.dpCancelReason})` : '대체됨'}
                            </Badge>
                        )
                    }
                </Flex>

                <Space spaceGap={8} flexWrap={'wrap'} mb={10}>
                    <LocalFarmerTelModal localfoodFarmerNo={orderDetail.localfoodFarmerNo} localFarmerName={orderDetail.localFarmerName} />
                    <div style={{textDecoration: (orderDetail.payStatus === 'cancelled' || orderDetail.replaceFlag) && 'line-through'}}>{orderDetail.goodsNm}</div>
                    <div style={{textDecoration: (orderDetail.payStatus === 'cancelled' || orderDetail.replaceFlag) && 'line-through'}}><b>{orderDetail.optionName}</b></div>
                </Space>

                <Space ml={'auto'} spaceGap={8} mb={10} bold>
                    <span>{ComUtil.addCommas(orderDetail.currentPrice)}</span>
                    <span>×</span>
                    <Span fg={'#0032ff'}>{orderDetail.orderCnt}개</Span>
                </Space>

                <Space>
                    <FlexButton bg={'white'} bc={'light'} fontSize={13} width={50} disabled={orderDetail.addGoodsToBoxFlag} onClick={onPickClick}>담기</FlexButton>
                    <FlexButton bg={'white'} bc={'light'} fontSize={13} fg={selected ===  OPEN_KIND.IMAGES && 'primary'} onClick={toggle.bind(this, OPEN_KIND.IMAGES)}>
                        <BsImages />
                        <Div mr={4}>이미지</Div>
                        {
                            (modalOpen && selected ===  OPEN_KIND.IMAGES) ? <MdExpandLess size={15} /> : <MdExpandMore size={15} />
                        }
                    </FlexButton>
                    <FlexButton bg={'white'} bc={'light'} fg={selected ===  OPEN_KIND.FUNCTIONALITY && 'primary'} fontSize={13} onClick={toggle.bind(this, OPEN_KIND.FUNCTIONALITY)}>
                        <Div mr={4} >추가기능</Div>
                        {
                            (modalOpen && selected ===  OPEN_KIND.FUNCTIONALITY) ? <MdExpandLess size={15} /> : <MdExpandMore size={15} />
                        }
                    </FlexButton>
                </Space>
            </Div>
            {/*<Flex px={16} alignItems={'flex-start'}>*/}
            {/*    <Img width={40} height={40} src={Server.getThumbnailURL() + orderDetail.orderImg} onClick={toggle.bind(this, OPEN_KIND.IMAGES)}/>*/}
            {/*    <Div px={8} minWidth={40} textAlign={'center'}>{orderDetail.localKey}</Div>*/}
            {/*    <Div flexGrow={1}>*/}
            {/*        <Grid>*/}
            {/*            <Space spaceGap={8} flexWrap={'wrap'}>*/}
            {/*                <LocalFarmerTelModal localfoodFarmerNo={orderDetail.localfoodFarmerNo} localFarmerName={orderDetail.localFarmerName} />*/}
            {/*                {*/}
            {/*                    orderDetail.replaceFlag && <Div fg={'danger'}>[대체됨]</Div>*/}
            {/*                }*/}
            {/*                <div style={{textDecoration: orderDetail.replaceFlag && 'line-through'}}>{orderDetail.goodsNm}</div>*/}
            {/*                <div style={{textDecoration: orderDetail.replaceFlag && 'line-through'}}><b>{orderDetail.optionName}</b></div>*/}
            {/*            </Space>*/}
            {/*            <Space ml={'auto'} spaceGap={8}>*/}
            {/*                <span>{ComUtil.addCommas(orderDetail.currentPrice)}</span>*/}
            {/*                <span>×</span>*/}
            {/*                <span><b>{orderDetail.orderCnt}개</b></span>*/}
            {/*            </Space>*/}
            {/*        </Grid>*/}
            {/*        <Space>*/}
            {/*            <FlexButton bg={'white'} bc={'light'} fontSize={13} width={50} disabled={orderDetail.addGoodsToBoxFlag} onClick={onPickClick}>담기</FlexButton>*/}
            {/*            <FlexButton bg={'white'} bc={'light'} fontSize={13} fg={selected ===  OPEN_KIND.IMAGES && 'primary'} onClick={toggle.bind(this, OPEN_KIND.IMAGES)}>*/}
            {/*                <BsImages />*/}
            {/*                <Div mr={4}>이미지</Div>*/}
            {/*                {*/}
            {/*                    (modalOpen && selected ===  OPEN_KIND.IMAGES) ? <MdExpandLess size={15} /> : <MdExpandMore size={15} />*/}
            {/*                }*/}
            {/*            </FlexButton>*/}
            {/*            <FlexButton bg={'white'} bc={'light'} fg={selected ===  OPEN_KIND.FUNCTIONALITY && 'primary'} fontSize={13} onClick={toggle.bind(this, OPEN_KIND.FUNCTIONALITY)}>*/}
            {/*                <Div mr={4} >추가기능</Div>*/}
            {/*                {*/}
            {/*                    (modalOpen && selected ===  OPEN_KIND.FUNCTIONALITY) ? <MdExpandLess size={15} /> : <MdExpandMore size={15} />*/}
            {/*                }*/}
            {/*            </FlexButton>*/}
            {/*        </Space>*/}
            {/*    </Div>*/}
            {/*</Flex>*/}
            {
                (modalOpen && selected === OPEN_KIND.IMAGES) && (
                    <Div mt={10}>
                        <GoodsImages goodsNo={orderDetail.goodsNo} />
                    </Div>
                )
            }
            {
                (modalOpen && selected === OPEN_KIND.FUNCTIONALITY) && (
                    <Div mt={10} px={16}>
                        <Div p={16} rounded={3} bc={'secondary'}>
                            <OrderFunctionality orderDetail={orderDetail} refresh={refreshOrderDetail} />
                        </Div>
                    </Div>
                )
            }
        </Div>
    )
}

//TODO orderDetail 만 hook으로 관리하는 컴포넌트. summaryInfo 같은 경우 연결시키기가 힘들어 아래 컴포넌트를 사용하지 않고, 변경시 전체 리스트를 조회하는 위의 컴포넌트로 변경 함

// function OrderDetailCard({orderDetail: od}) {
//     const [orderDetail, setOrderDetail] = useState(od)
//     const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
//
//     const toggle = (kind) => {
//         if (selected !== kind) {
//             setModalState(true)
//             setSelected(kind)
//         }else{
//             setModalState(false)
//             setSelected('')
//         }
//     }
//
//     useEffect(() => {
//         setOrderDetail(od)
//     }, [od])
//
//     //주문상세 재 조회
//     const refreshOrderDetail = async () => {
//         const {data} = await getOrderDetailByOrderSeq(orderDetail.orderSeq)
//         setOrderDetail(data)
//     }
//
//     //담기 클릭
//     const onPickClick = async () => {
//         try {
//             const {status, data: errRes} = await updateAddGoodsToBoxFlag(od.orderSeq)
//             if (status === 200) {
//                 if (errRes) {
//                     if (errRes.resCode !== 0) {
//                         alert(errRes.errMsg)
//                     }
//                 }
//             }
//             await refreshOrderDetail()
//         }catch (err) {
//             console.error(err.message)
//         }
//     }
//
//     return(
//         <Div mb={18}>
//             <Flex px={16} alignItems={'flex-start'}>
//                 <Img width={40} height={40} src={Server.getThumbnailURL() + orderDetail.orderImg} onClick={toggle.bind(this, OPEN_KIND.IMAGES)}/>
//                 <Div px={8} minWidth={40} textAlign={'center'}>{orderDetail.localKey}</Div>
//                 <Div flexGrow={1}>
//                     <Grid>
//                         <Space spaceGap={8} flexWrap={'wrap'}>
//                             <LocalFarmerTelModal localfoodFarmerNo={orderDetail.localfoodFarmerNo} localFarmerName={orderDetail.localFarmerName} />
//                             {
//                                 orderDetail.replaceFlag && <Div fg={'danger'}>[대체됨]</Div>
//                             }
//                             <div style={{textDecoration: orderDetail.replaceFlag && 'line-through'}}>{orderDetail.goodsNm}</div>
//                             <div style={{textDecoration: orderDetail.replaceFlag && 'line-through'}}><b>{orderDetail.optionName}</b></div>
//                         </Space>
//                         <Space ml={'auto'} spaceGap={8}>
//                             <span>{ComUtil.addCommas(orderDetail.currentPrice)}</span>
//                             <span>×</span>
//                             <span><b>{orderDetail.orderCnt}개</b></span>
//                         </Space>
//                     </Grid>
//                     <Space>
//                         <FlexButton bg={'white'} bc={'light'} fontSize={13} width={50} disabled={orderDetail.addGoodsToBoxFlag} onClick={onPickClick}>담기</FlexButton>
//                         <FlexButton bg={'white'} bc={'light'} fontSize={13} fg={selected ===  OPEN_KIND.IMAGES && 'primary'} onClick={toggle.bind(this, OPEN_KIND.IMAGES)}>
//                             <BsImages />
//                             <Div mr={4}>이미지</Div>
//                             {
//                                 (modalOpen && selected ===  OPEN_KIND.IMAGES) ? <MdExpandLess size={15} /> : <MdExpandMore size={15} />
//                             }
//                         </FlexButton>
//                         <FlexButton bg={'white'} bc={'light'} fg={selected ===  OPEN_KIND.FUNCTIONALITY && 'primary'} fontSize={13} onClick={toggle.bind(this, OPEN_KIND.FUNCTIONALITY)}>
//                             <Div mr={4} >추가기능</Div>
//                             {
//                                 (modalOpen && selected ===  OPEN_KIND.FUNCTIONALITY) ? <MdExpandLess size={15} /> : <MdExpandMore size={15} />
//                             }
//                         </FlexButton>
//                     </Space>
//                 </Div>
//             </Flex>
//             {
//                 (modalOpen && selected === OPEN_KIND.IMAGES) && (
//                     <Div mt={10}>
//                         <GoodsImages goodsNo={orderDetail.goodsNo} />
//                     </Div>
//                 )
//             }
//             {
//                 (modalOpen && selected === OPEN_KIND.FUNCTIONALITY) && (
//                     <Div mt={10} px={16}>
//                         <Div p={16} rounded={3} bc={'secondary'}>
//                             <OrderFunctionality orderDetail={orderDetail} refresh={refreshOrderDetail} />
//                         </Div>
//                     </Div>
//                 )
//             }
//         </Div>
//     )
// }