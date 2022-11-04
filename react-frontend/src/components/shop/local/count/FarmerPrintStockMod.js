import React, {useState, useEffect, useRef, Fragment, useLayoutEffect, useContext} from 'react'
import {
    Button,
    Div,
    Flex,
    Hr,
    Right,
    Span,
    Space,
    Input,
    GridColumns,
    Grid,
    Img,
    Strong, Sticky
} from "~/styledComponents/shared";
import {useParams, withRouter} from "react-router-dom";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {LocalButton, LocalCountComponents, COLOR, LocalGoodsCard} from "./LocalCountComponents";

import {
    getGoodsListByLocalFarmerNo,
    getCountLogByID,
    getCountLogListByID,
    barcodePrintedDirect,
    productSold,
    goodsRefresh,
    getLocalFarmerByLocalFarmerNo,
    getGoodsListByFarmer, updateOptionCountZero,
} from "~/lib/localfoodApi";
import {EmptyBox} from "~/styledComponents/ShopBlyLayouts";
import {
    IoIosArrowBack,
    IoMdAdd,
    IoMdCheckmarkCircleOutline,
    IoMdInformationCircleOutline,
    IoMdRemove
} from "react-icons/io";
import styled from "styled-components";
import Switch from "react-switch";
import {Modal, ModalBody, ModalFooter, ModalHeader, Spinner} from "reactstrap";
import {useModal} from "~/util/useModal";
import ComUtil from "~/util/ComUtil";
import useInterval from "~/hooks/useInterval";
import NumPadModal from "~/components/common/modals/NumPadModal";
import {toast} from "react-toastify";
import {color} from "~/styledComponents/Properties";
import {getValue} from "~/styledComponents/Util";
import {Server} from "~/components/Properties";
import {MdDeleteForever, MdOutlineSettingsBackupRestore} from "react-icons/all";
import {FlexButton} from "~/components/producer/mobile/common/Style";
import SpinnerLoading from "~/components/common/Spinner/SpinnerLoading";
import ProducerFeeRateReg from "~/components/admin/producerFeeRate/ProducerFeeRateReg";
import {addLocalFarmerQnA} from "~/lib/producerApi";
import useImg from "~/hooks/useImg";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import NoImageDefault from "~/images/noimage-300x267.png";
import {FarmerrintCountContext} from "~/components/shop/local/count/FarmerPrintCount";

//TYPE_OF_IMAGE.SMALL_SQUARE
const Image = ({images, type = TYPE_OF_IMAGE.SMALL_SQUARE, errorImage = NoImageDefault, ...rest}) => {
    const {imageUrl, onError} = useImg(images, type, errorImage)
    return <Img {...rest} src={imageUrl} onError={onError}/>
}

const FarmerPrintStockMod = (props) => {

    const {farmer,} = useContext(FarmerrintCountContext)

    useEffect(() => {
    }, [])

    return (
        <div>
            <GoodsList localfoodFarmerNo={farmer && farmer.localfoodFarmerNo} />
        </div>
    )
}
export default withRouter(FarmerPrintStockMod);

const GoodsList = ({localfoodFarmerNo}) => {
    const [goodsList, setGoodsList] = useState()
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen, selected, setSelected, setModalState, toggle] = useModal()

    useEffect(() => {
        if (localfoodFarmerNo) {
            fetchGoodsList()
        }
    }, [localfoodFarmerNo])

    const fetchGoodsList = async () => {
        try{
            const {status, data} = await getGoodsListByFarmer(localfoodFarmerNo)
            console.log({GoodsList: data})

            setGoodsList(data)

            setLoading(false)
        }catch (err) {
            console.error(err.message)
        }
    }

    //문의하기
    const onContactClick = (goods) => {
        setSelected(goods)
        toggle()
    }

    //재고없음
    const onOptionCountZeroClick = async (goods, option) => {
        try{

            const msg = `${goods.goodsNm} 옵션(${option.optionName})`

            if (!window.confirm(`${msg} 상품을 품절 처리 하시겠습니까?`)) {
                return
            }

            const {status, data: errRes} = await updateOptionCountZero(goods.goodsNo, option.optionIndex)
            if (status === 200) {
                if (errRes.resCode === 0) {
                    toast.warn(`${goods.goodsNm} ${option.optionName} 상품을 품절 처리 했습니다.`, {
                        position: toast.POSITION.TOP_RIGHT
                    })

                    await fetchGoodsList()
                }else{
                    toast.warn(errRes.errMsg, {
                        position: toast.POSITION.TOP_RIGHT
                    })
                }
            }
        }catch (err) {
            console.error(err.message)
        }
    }

    if (loading) return <SpinnerLoading />

    return(
        <>
            <GridColumns repeat={1} colGap={0} rowGap={65}>
                {
                    goodsList.map(goods =>
                        <GoodsItem
                            key={'goods_'+goods.goodsNo}
                            goods={goods}
                            onContactClick={onContactClick.bind(this, goods)}
                            onOptionCountZeroClick={onOptionCountZeroClick}
                            // onZeroRemainedCntClick={onZeroRemainedCntClick.bind(this, option.optionIndex, goods.goodsNo)}
                        />
                    )
                }
            </GridColumns>
            <Modal isOpen={modalOpen} toggle={toggle} >
                <ModalHeader toggle={toggle}>문의하기</ModalHeader>
                <ModalBody>
                    {selected && <ContactModalContent localfoodFarmerNo={localfoodFarmerNo} goodsNo={selected.goodsNo} onClose={toggle}/>}
                </ModalBody>
            </Modal>
        </>
    )
}

const GoodsItem = ({goods, onContactClick, onOptionCountZeroClick}) => {
    return (
        <GridColumns repeat={1} rowGap={10}>
            {
                goods.options.filter(op => op.remainedCnt > 0).map((op, index) =>
                    <LocalGoodsCard
                        key={'option_'+op.optionIndex}
                        goodsImages={goods.goodsImages}
                        // onImageClick={onImageClick.bind(this, log.optionImages)}
                        // farmerName={log.errType === 1 ? `미등록 농가(${log.farmerNo})` : log.farmerName}
                        visibleHeader={index === 0}
                        // visibleFarmerName={true}
                        goodsName={goods.goodsNm}
                        optionName={op.optionName}
                        price={op.optionPrice}
                        // printedCount={log.printedCount}
                        // timestamp={log.timestamp}
                        // isModified={isModified}
                        onQaClick={onContactClick}
                        rightContent={
                            <LocalButton rounded onClick={onOptionCountZeroClick.bind(this, goods, op)}>입고취소</LocalButton>
                        }
                    />
                )
            }
        </GridColumns>
    )
}


const CONTACT_REASONS = [
    {value: '0', label: '농가사진 문의'},
    {value: '1', label: '상품사진 문의'},
    {value: '2', label: '상품가격 문의'},
    {value: '3', label: '기타 문의'}
]

const ContactModalContent = ({localfoodFarmerNo, goodsNo, onClose}) => {
    const [selectedItem, setSelectedItem] = useState()
    const [isFetching, setIsFetching] = useState(false)

    const onReasonClick = async (item) => {
        try{

            const params = {
                localfoodFarmerNo: localfoodFarmerNo,
                qaKind: item.label,
                goodsNo: goodsNo,
                localFarmerQns: item.label
            }

            setIsFetching(true)

            const {status,data} = await addLocalFarmerQnA(params);
            if (status === 200) {
                if (data.resCode === 0) {   //성공
                    setSelectedItem(item)
                }else{ //실패
                    alert(data.errMsg)
                }
            }


            await ComUtil.delay(1000)

            setIsFetching(false)

        }catch (err) {
            console.error(err.message)
            setIsFetching(false)
        }
    }

    if (isFetching) {
        return (
            <Div textAlign={'center'} fontSize={20}>
                <div>문의 접수중</div>
                <SpinnerLoading isMore={true} />
            </Div>

        )
    }

    if (selectedItem) {
        return (
            <Flex flexDirection={'column'} justifyContent={'center'} py={30}>
                <Space fontSize={22} fw={900} mb={20}>
                    <IoMdCheckmarkCircleOutline size={25} color={color.primary} />
                    <span><Strong fg={'primary'}>{selectedItem.label}</Strong>를 접수 하였습니다.</span>
                </Space>
                <Div fontSize={17} mb={30}>
                    <Strong fg={'primary'}>등록 되어있는 연락처로 최대한 빠르게 연락</Strong> 드리겠습니다.
                </Div>
                <FlexButton bg={'white'} bc={'primary'} fg={'primary'} height={50} fontSize={20} bold onClick={onClose} px={20} bw={'2px'} rounded={4} width={100}>닫기</FlexButton>
            </Flex>
        )
    }

    return(
        <Div py={20}>
            <h3>문의할 항목이 무엇인가요?</h3>
            <h6>등록되어 있는 연락처로 연락 드리겠습니다.</h6>
            <GridColumns repeat={1} rowGap={16} mt={4}>
                {
                    CONTACT_REASONS.map(item =>
                        <Flex key={item.value} bc={'primary'} fg={'primary'} bg={'white'} doActive rounded={8} bw={'2px'} py={30} fontSize={22} justifyContent={'center'}
                              onClick={onReasonClick.bind(this, item)}
                        >{item.label}</Flex>
                    )
                }
            </GridColumns>
        </Div>
    )
}