import React, {useState, useEffect, useRef, Fragment} from 'react'
import {Button, Div, Flex, Hr, Img, Right} from "~/styledComponents/shared";
import {useParams} from "react-router-dom";
import BasicNavigation from "~/components/common/navs/BasicNavigation";
import DeliveryStatusCard from "./DeliveryStatusCard"
import { getOrderDetailListBySeqsPublic, updateOrderTrackingInfo, updateDeliveryDoneImage, updateOrderTrackingInfoByOrderSubGroupNo } from "~/lib/producerApi";
import SingleImageUploader from "~/components/common/ImageUploader/SingleImageUploader";
import {getOrderSubGroup} from "~/lib/shopApi"
import ComUtil from "~/util/ComUtil";
import {EmptyBox} from "~/styledComponents/ShopBlyLayouts";
import {color} from "~/styledComponents/Properties";
import {toast} from "react-toastify";
import {Spinner, Modal, ModalHeader, ModalBody, ModalFooter} from "reactstrap";
import {useModal} from "~/util/useModal";
import {Server} from "~/components/Properties";
import {BsFillTelephoneFill, MdSms} from "react-icons/all";

const DeliveryList = ({orderList}) => {
    if (orderList.length <= 0) {
        return <EmptyBox>조회 내역이 없습니다.</EmptyBox>
    }

    return orderList.map((orderDetail, index, orderDetailList) => {
            return(
                <Fragment key = {orderDetail.orderSeq}>
                    <DeliveryStatusCard
                        key={orderDetail.orderSeq}
                        orderDetail = {orderDetail}
                    />
                </Fragment>
            )
        }
    )
};

const Delivery = (props) => {
    const {orderSubGroupNo} = useParams()

    const [orderSubGroup, setOrderSubGroup] = useState()
    const [list, setList] = useState()
    const [consumerInfo, setConsumerInfo] = useState()
    const [deliveryImages, setDeliveryImages] = useState()
    const [loading, setLoading] = useState(true)

    const [modalOpen, setModalOpen, selected, setSelected, setModalState, toggle] = useModal()

    useEffect(() => {
        async function fetch() {
            await fetchMoreData()
            setLoading(false)
        }
        fetch()
    }, [])

    //TODO: 배송완료 처리 중, 한건 이라도 에러 났을 경우는 배송완료가 안 되어야 할텐데.. 그리고 앞으로 orderSubGroup.progressState === 3 (배송완료) 구분자로 해야 할 듯
    const fetchMoreData = async () => {
        const {data:orderSubGroup} = await getOrderSubGroup(orderSubGroupNo)
        setOrderSubGroup(orderSubGroup)

        console.log(orderSubGroup)

        const {status, data} = await getOrderDetailListBySeqsPublic(orderSubGroup.orderSeqList)

        const filteredData = data.filter(item => item.payStatus === "paid")

        if(filteredData.length > 0) {
            setList(filteredData)
            setConsumerInfo(filteredData[0])
        } else {
            alert('배송할 주문이 없습니다.')
        }

    }

    // 배송완료 버튼 클릭
    const deliveryFinish = async () => {

        //소비자 푸쉬 백엔드에서 바로 호출하도록 변경함
        const {status, data} = await updateOrderTrackingInfoByOrderSubGroupNo(list[0].orderSubGroupNo)

        // 아래의 주문이 이미 취소된 케이스는 나올 수가 없음. (생산자가 임의로 배송완료 처리전 소비자가 주문취소하지 않는 이상)
        // list.map(async (order) => {
        //     order.trackingNumber = "업체기사 직접배송"
        //     order.transportCompanyName = "기타배송"
        //     order.transportCompanyCode = "99"
        //     const {status, result} = await updateOrderTrackingInfo(order)
        //     if(status !== 200){
        //         toast.error('처리중 에러가 발생하였습니다.')
        //         return
        //     }
        //     if(result == false)
        //     {
        //         toast.error('주문이 취소되었거나 미배송 처리되어서 송장 정보를 저장할 수 없습니다.')
        //         return
        //     }
        // })

        if (status === 200 && data) {
            // await sendDeliveryDonePush(orderSubGroupNo) //소비자에게 push 발송.
            toast.success('배송완료되었습니다.')

        }else{
            toast.error('주문이 취소되었거나 미배송 처리되어서 송장 정보를 저장할 수 없습니다.')
        }

        await fetchMoreData()

    }

    //배송완료 사진 업로드
    const onImageChange = (images) => {
        setDeliveryImages(images)
    }

    //배송사진 저장
    const onSaveClick = async () => {
        orderSubGroup.deliveryImages = deliveryImages;
        const {data} = await updateDeliveryDoneImage(orderSubGroup)

        if(data) {
            alert('사진이 업로드되었습니다.')
            toggle()
        } else {
            alert('사진 업로드를 실패했습니다. 다시 시도해주세요.')
        }
    }

    if(loading)
        return <Flex minHeight={400} justifyContent={'center'}><Spinner color={'success'} /></Flex>

    return (
        <Div>
            <BasicNavigation><Div pl={16}>배송상태</Div></BasicNavigation>
            <Div fontSize={14} bg={'black'} fg={'veryLight'} px={16} py={8}>
                주문 그룹번호 <b>{orderSubGroupNo}</b>
            </Div>
            <Flex p={16}>
                <Div>
                    배송상태 :
                    {
                        consumerInfo.trackingNumber && consumerInfo.transportCompanyCode === "99" ? ' 배송완료' : ' 배송대기'
                    }
                </Div>
                <Right>주문일시 : {ComUtil.utcToString(consumerInfo.orderDate, 'MM/DD HH:mm')}</Right>
            </Flex>
            {
                orderSubGroup.deliveryImages.length > 0 &&
                <Div px={16} py={8}>
                    <Img src={Server.getThumbnailURL() + orderSubGroup.deliveryImages[0].imageUrl} />
                </Div>
            }

            {
                (!consumerInfo.trackingNumber || orderSubGroup.deliveryImages.length <= 0) &&
                <Flex px={15} pb={15} width={'100%'} justifyContent={'center'}>
                    <Button mr={10} px={10} bg={'green'} fg={'white'} disabled={orderSubGroup.deliveryImages.length > 0} onClick={toggle}>사진업로드</Button>
                    <Button mr={10} px={10} bg={'green'} fg={'white'} disabled={orderSubGroup.deliveryImages.length == 0 || consumerInfo.trackingNumber} onClick={deliveryFinish}>배송완료</Button>
                    {/*{*/}
                    {/*    orderSubGroup.deliveryImages.length > 0 ? <Button px={10} disabled>사진업로드 완료</Button>*/}
                    {/*        :*/}
                    {/*        <Button px={10} bg={'green'} fg={'white'} onClick={toggle}>배송사진 업로드</Button>*/}
                    {/*}*/}
                </Flex>
            }
            <Hr />
            <Div px={15} py={20} fontSize={12} flexGrow={1} lineHeight={'1.5'}>
                <Div fontSize={20}>
                    <p>
                        {consumerInfo.consumerNm}
                    </p>
                    <p>
                        <Div mb={5}>
                            <BsFillTelephoneFill style={{marginRight: 10}} />
                            <a href={`tel:${consumerInfo.consumerPhone}`} style={{color: color.primary, textDecoration: 'underline'}}>{consumerInfo.consumerPhone}</a>
                        </Div>
                        <div>
                            <MdSms style={{marginRight: 10}} />
                            <a href={`sms:${consumerInfo.consumerPhone}`} style={{color: color.primary, textDecoration: 'underline'}}>{consumerInfo.consumerPhone}</a>
                        </div>
                    </p>
                    <p>
                        {`(${consumerInfo.receiverZipNo || '없음'}) ${consumerInfo.receiverAddr} ${consumerInfo.receiverAddrDetail}`}
                    </p>
                </Div>

                <Div fontSize={17}>배송메시지: {consumerInfo.deliveryMsg}</Div>
                {
                    consumerInfo.trackingNumber && <div>송장번호: <b>{consumerInfo.trackingNumber}</b></div>
                }
            </Div>
            <Hr />
            <div>
                <DeliveryList orderList={list} />
            </div>

            <Modal isOpen={modalOpen} title={'배송사진'} toggle={toggle}>
                <ModalHeader toggle={toggle}>
                    <div>배송완료 사진 업로드</div>
                </ModalHeader>
                <ModalBody>
                    <SingleImageUploader defaultCount={1} onChange={onImageChange} quality={0.5} />
                </ModalBody>
                <ModalFooter>
                    <Button bg={'green'} fg={'white'} px={10} onClick={onSaveClick}>저장</Button>
                </ModalFooter>
            </Modal>


        </Div>
    )
}

export default Delivery;