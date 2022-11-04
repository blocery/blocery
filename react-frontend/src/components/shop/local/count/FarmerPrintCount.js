import React, {useState, useEffect, useRef, Fragment, useLayoutEffect, createContext} from 'react'
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
import {Switch, Route, useParams, withRouter} from "react-router-dom";
import BackNavigation from "~/components/common/navs/BackNavigation";
import {LocalButton, LocalCountComponents, COLOR} from "./LocalCountComponents";

import {
    getGoodsListByLocalFarmerNo,
    getCountLogByID,
    getCountLogListByID,
    barcodePrintedDirect,
    productSold,
    goodsRefresh,
    getLocalFarmerByLocalFarmerNo,
    getLocalfoodFarmerBySeq,
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
import FarmerPrintInputMod from "~/components/shop/local/count/FarmerPrintInputMod";
import FarmerPrintStockMod from "~/components/shop/local/count/FarmerPrintStockMod";

const MINUTE = 1 * 60
const BACK_DELAY = MINUTE * 5 //300초 : 5분

const GridPad = styled.div`
    display: grid;
    grid-template-columns: 50px 50px;
    grid-column-gap: 1px;
    grid-row-gap: 1px;
    cursor: pointe;
    background-color: ${color.light};
    border: 1px solid ${color.secondary};
    overflow: hidden;
    border-radius: ${getValue(4)};
    bg={'light'} bc={'secondary'} 
    & > div:first-child {
        grid-column-start: 1;
        grid-column-end: 3;
    }
`
const Item = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 34.5px;
  font-weight: 900;
  cursor: pointer;
  color: #535353;
  
  ${props => props.active && `
        background-color: #535353;
        box-shadow: 0 0 0 4.5px #535353;
        color: white;
  `}
`




//TYPE_OF_IMAGE.SMALL_SQUARE
const Image = ({images, type = TYPE_OF_IMAGE.SMALL_SQUARE, errorImage = NoImageDefault, ...rest}) => {
    const {imageUrl, onError} = useImg(images, type, errorImage)
    return <Img {...rest} src={imageUrl} onError={onError}/>
}

export const FarmerrintCountContext = createContext()

const FarmerPrintCount = (props) => {

    const params = useParams()
    const seq = Number(params.seq)

    const [tabId, setTabId] = useState(Number(params.tabId))

    //농가 설정
    const [farmer, setFarmer] = useState()
    const [logList, setLogList] = useState([])
    const [goods, setGoods] = useState()
    const [loading, setLoading] = useState(true)

    useEffect(() => {

        fetchLogList()

        //자동 뒤로가기 위한 body 이벤트 설정
        document.body.addEventListener('click', onBodyClick );

        return function cleanup() {
            window.removeEventListener('click', onBodyClick );
        }

    }, [])

    const fetchLogList = async () => {
        try {

            setLoading(true)

            const {status, data} = await getLocalfoodFarmerBySeq(seq)
            console.log({fetchLogList: data})
            if (status === 200) {
                if (data){
                    setFarmer(data)
                }
            }

            setLoading(false)

        }catch (error) {
            console.error(error.message)
            setLoading(false)
        }
    }



    // useEffect(() => {
    //     //just Refresh
    // }, [])

    // const refreshSelectedLog = async (seq) => {
    //     let {data:clickedLog} = await getCountLogByID(seq)
    //     setSelectedLog(clickedLog)
    // }

    const [isModified, setIsModified] = useState(false)

    const onCountChange = (params) => {
        console.log({params: params})

        const newLogList = [...logList]
        const log = newLogList.find(item => item.seq === params.seq)
        log.count = params.count
        log.__inputCount = params.__inputCount

        setLogList(newLogList)

        //저장 할 수 있는지 여부 판단하여 저장 disabled
        updateIsModified(newLogList)
    }

    const updateIsModified = (logList) => {
        //저장 할 수 있는지 여부 판단하여 저장 disabled
        const modifiedLogList = logList.filter(item => item.printedCount != item.__inputCount)

        if (modifiedLogList.length > 0) {
            setIsModified(true)
        }else{
            setIsModified(false)
        }
    }

    const onManualSoldoutClick = async (log) => {//log
        if (window.confirm("입고를 0으로 처리하시겠습니까?")) {
            //producerNo, farmerNo, productNo, sizeNo, localGoodsName, count, price
            let {data: errRes} = await productSold(log.producerNo, log.farmerNo, log.localGoodsNo, log.sizeNo, "수동 감소", log.printedCount, log.price, log.seq)
            if (errRes.resCode) {
                alert(errRes.errMsg)
                return
            }

            const newLogList = logList.filter(item => item.seq !== log.seq)
            setLogList(newLogList)
        }
    }
    const onSaveClick = async () => {
        try{
            const modifiedLogList = logList.filter(item => item.printedCount != item.__inputCount)
            const promises = modifiedLogList.map(item => productSold(
                item.producerNo, item.farmerNo, item.localGoodsNo,
                item.sizeNo, "수동 감소", item.printedCount - item.__inputCount, item.price, item.seq
            ))

            const res = await Promise.all(promises)

            console.log({res: res})

            await fetchLogList()

            toast.warn(`반영 되었습니다.`, {
                position: toast.POSITION.TOP_RIGHT
            })

        }catch(err) {
            console.log(err.message)
        }
    }

    //원래대로
    const onRestoreClick = ({seq}) => {

        const newLogList = [...logList]
        const newLog = newLogList.find(item => item.seq === seq)
        newLog.count = 0
        newLog.__inputCount = newLog.printedCount
        console.log({newLogList})
        setLogList(newLogList)

        //저장 할 수 있는지 여부 판단하여 저장 disabled
        updateIsModified(newLogList)
    }

    /** 뒤로가기 위한 이벤트 START **/

    const [backDelay, setBackDelay] = useState(1000)
    const [backCount, setBackCount] = useState(BACK_DELAY)

    //body 터치 했을 때 시간연장(뒤로 돌아가는)
    const onBodyClick = () => {
        setBackCount(BACK_DELAY)
    }

    useEffect(() => {
        //5분 뒤 뒤로가기 됨
        if (backCount <= 0) {
            props.history.goBack()
        }
    }, [backCount])

    //1초씩 증가
    useInterval(() => {
        setBackCount(prev => prev - 1)
    }, backDelay)

    /** 뒤로가기 위한 이벤트 END **/

    const onBackClick = () => {
        if (isModified) {
            if (!window.confirm("입고수량 변경된 내역이 존재 합니다. 저장하지 않고 뒤로 가시겠어요?")) {
                return
            }
        }

        props.history.goBack()
    }

    const onTabClick = (tabId) => setTabId(tabId)

    return (
        <FarmerrintCountContext.Provider value={{farmer, isModified, setIsModified}} >
            <div>

                <Sticky top={0} zIndex={4}>
                    <Flex bg={'white'} bc={'light'} bl={0} br={0} bt={0} fontSize={20} height={99} px={20} bg={COLOR.MAIN}>
                        <Space spaceGap={20} px={16}>
                            <LocalButton dark onClick={onBackClick} bg={COLOR.SUB} style={{marginTop:3}}>
                                <IoIosArrowBack size={30}/>
                                <div>뒤로가기</div>
                            </LocalButton>
                            {/*<Button height={44} bg={'primary'} fg={'white'} rounded={8} pl={16} pr={29} height={50} onClick={onBackClick}>*/}
                            {/*    <IoIosArrowBack size={30}/>*/}

                            {/*    <Span ml={8}>뒤로가기</Span>*/}
                            {/*</Button>*/}
                            <Div fontSize={40} fg={'white'} fw={900}>수량 변경</Div>
                        </Space>
                        <Right>
                            {backCount <= 0 && backCount}
                        </Right>
                    </Flex>
                </Sticky>


                {
                    loading ? <SpinnerLoading /> : (
                        <div>
                            <Div bg={'white'} pb={30}>
                                <Flex px={50} height={120}>
                                    <Image images={farmer.farmerImages} width={60} height={60} rounded={'50%'} mr={16} bc={'light'}/>
                                    {/*<Img src={ComUtil.getFirstImageSrc(farmer.farmerImages)} width={60} height={60} rounded={'50%'} mr={16}/>*/}
                                    <Div fontSize={25}>{`${farmer?farmer.farmerName : ''} ${farmer?farmer.localFarmerNo : ''}`}</Div>
                                </Flex>
                                <Div px={30}>
                                    <GridColumns repeat={2} bg={'#e2e5e8'} colGap={0} height={111} rounded={10}>
                                        <Item active={tabId === 0} onClick={onTabClick.bind(this, 0)}>수량 변경</Item>
                                        <Item active={tabId === 1} onClick={onTabClick.bind(this, 1)}>기존 상품 재고 관리</Item>
                                    </GridColumns>
                                </Div>
                            </Div>
                            <Div bg={'#D7D9DC'} py={30} px={20} height={`calc(100vh - ${getValue(99)} - ${getValue(261)})`}>
                                <div style={{display: tabId === 0 ? 'block' : 'none'}}><FarmerPrintInputMod /></div>
                                <div style={{display: tabId === 1 ? 'block' : 'none'}}><FarmerPrintStockMod /></div>
                            </Div>
                        </div>
                    )
                }
            </div>
        </FarmerrintCountContext.Provider>
    )
}

export default withRouter(FarmerPrintCount);