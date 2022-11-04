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
import {LocalButton, LocalGoodsCard, COLOR} from "./LocalCountComponents";
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

const MINUTE = 1 * 60
const BACK_DELAY = MINUTE * 5 //300초 : 5분

const GridPad = styled.div`
    display: grid;
    grid-template-columns: 44px 1fr 44px;
    & > div {
        text-align: center;
        transition: 0.2s;
        
        -webkit-touch-callout: none; /* iOS Safari */
        -webkit-user-select: none; /* Safari */
         -khtml-user-select: none; /* Konqueror HTML */
           -moz-user-select: none; /* Old versions of Firefox */
            -ms-user-select: none; /* Internet Explorer/Edge */
                user-select: none; /* Non-prefixed version, currently
                                      supported by Chrome, Edge, Opera and Firefox */
        
    }
    
    & > div:active {
        background-color: ${color.veryLight};
    }
`

const GridPad2 = styled.div`
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
  color: #A1A4A8;
  
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

const SaveButton = ({disabled, onClick}) => <FlexButton disabled={disabled} rounded={8} width={600} height={120} fg={'white'} rounded={60}
                                                        bg={COLOR.MAIN}
                                                        fg={'white'}
                                                        onClick={onClick} fontSize={45}>확인</FlexButton>

const FarmerPrintInputMod = (props) => {

    const params = useParams()
    const seq = Number(params.seq)

    const {isModified, setIsModified} = useContext(FarmerrintCountContext)

    //농가 설정
    const [logList, setLogList] = useState([])
    const [goods, setGoods] = useState()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLogList()
    }, [])

    const fetchLogList = async () => {

        //오늘자 리스트
        let {data} = await getCountLogListByID(seq)

        //선택된 seq에 해당하는건 최상단으로 올려 준다
        const selectedIndex = data.findIndex(item => item.seq === seq)
        const item = data.splice(selectedIndex, 1)[0]
        data.unshift(item)

        //inputCount 속성을 추가
        data.map(item => item.__inputCount = item.printedCount)

        console.log('getCountLogListByID',data)
        setLogList(data)

        //let clickedLog = data.find( oneLog => oneLog.seq === seq)
        // let {data:clickedLog} = await getCountLogByID(seq)
        // console.log('getCountLogByID',clickedLog)
        //setSelectedLog(clickedLog)

        let {data:goodsData} = await goodsRefresh(item.goodsNo)
        console.log('goodsRefresh',goodsData)
        setGoods(goodsData)

        // if (data.length > 0) {
        //     setSelectedGoods(data[0])
        // }

        if (loading)
            setLoading(false)
    }



    // useEffect(() => {
    //     //just Refresh
    // }, [])

    // const refreshSelectedLog = async (seq) => {
    //     let {data:clickedLog} = await getCountLogByID(seq)
    //     setSelectedLog(clickedLog)
    // }

    // const [isModified, setIsModified] = useState(true)

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

    const onBackClick = () => {
        if (isModified) {
            if (!window.confirm("입고수량 변경된 내역이 존재 합니다. 저장하지 않고 뒤로 가시겠어요?")) {
                return
            }
        }

        props.history.goBack()
    }

    return (
        <div>

            <Div py={30}>
                <Flex justifyContent={'center'}>
                    <SaveButton disabled={!isModified} onClick={onSaveClick}>수정 반영</SaveButton>
                </Flex>
            </Div>


            {
                loading ? <SpinnerLoading /> : (
                    <div>
                        <div>
                            { (!goods || logList.length <= 0)?
                                <EmptyBox>최근 입고내역이 없습니다.</EmptyBox>
                                :
                                <GridColumns repeat={1} colGap={0} rowGap={20}>
                                    {logList.map((log) =>
                                        <LogCountItem key={log.seq}
                                                      log={log} goods={goods} clickedSeq={seq}
                                                      isModified={log.printedCount != log.__inputCount}
                                                      onCountChange={onCountChange}
                                            // onDecreaseClick={onCountChange.bind(this, log.seq, -1)}
                                            // onIncreaseClick={onCountChange.bind(this, log.seq, 1)}
                                                      onManualSoldoutClick={onManualSoldoutClick.bind(this, log)}
                                                      onRestoreClick={onRestoreClick.bind(this, log)}


                                        />

                                    )}
                                </GridColumns>
                            }
                        </div>
                    </div>
                )
            }
            <Div py={30}>
                <Flex justifyContent={'center'}>
                    <SaveButton disabled={!isModified} onClick={onSaveClick}>수정 반영</SaveButton>
                </Flex>
            </Div>

        </div>
    )
}

const LogCountItem = ({log, goods,
                          isModified,
                          onCountChange,
                          onIncreaseClick,
                          onDecreaseClick,
                          onManualSoldoutClick,
                          onRestoreClick
                      }) => {

    const [modalOpen, setModalOpen, selected, setSelected, setModalState, toggle] =  useModal()

    // const [] = useState(log.printedCount)
    const [option, setOption] = useState({optionName: ''})

    useEffect(() => {
        const retOption = goods.options && goods.options.find(option => option.sizeNo === log.sizeNo && option.optionPrice === log.price);
        setOption(retOption)
    }, [])

    const findOption = () => {
        const retOption = goods.options && goods.options.find(option => option.sizeNo === log.sizeNo && option.optionPrice === log.price);
        //console.log('retOption:', retOption)
        return retOption;
    }

    const onHandleChange = (num) => {

        //printedCount : 54
        //__inputCount : 54 -1 = 53
        //count : 1

        const __inputCount = log.__inputCount + ComUtil.toNum(num)
        if (__inputCount <= log.printedCount) {
            onCountChange({
                seq: log.seq,
                __inputCount: __inputCount,
                count: log.printedCount - __inputCount
            })
        }

        // const value = e.target.value
        // const log = logList.find(log => log.seq === seq)

    }

    //넘버패드 변경시
    const onNumberPadChange = (num) => {
        const __inputValue = ComUtil.toNum(num)
        if (__inputValue > log.printedCount) {
            toast.warn(`${option.optionName} 상품은 ${log.printedCount}개를 초과 할 수 없습니다.`, {
                position: toast.POSITION.TOP_RIGHT
            })
            return
        }else{
            onCountChange({
                seq: log.seq,
                __inputCount: num,
                count: log.printedCount - __inputValue
            })

            toggle()
        }


    }


    return (
        <>
        <LocalGoodsCard
            bodyStyle={{py: 41}}
            goodsImages={goods.goodsImages}
            // onImageClick={onImageClick.bind(this, log.optionImages)}
            // farmerName={log.errType === 1 ? `미등록 농가(${log.farmerNo})` : log.farmerName}
            // visibleFarmerName={true}
            optionName={option.optionName}
            price={log.price}
            printedCount={log.printedCount}
            timestamp={log.timestamp}
            isModified={isModified}
            rightContent={
                <div>
                    <GridPad>
                        <Div width={44} height={44} cursor={1}
                             bg={'white'}
                             fg={log.__inputCount <= 0 ? 'light' : COLOR.MAIN}
                             onClick={log.__inputCount <= 0 ? null : onHandleChange.bind(this, -1)}
                        >
                            <IoMdRemove size={40}/>
                        </Div>
                        <Flex height={44} justifyContent={'center'} fontSize={30} fw={900} onClick={toggle} fg={'black'}>
                            {log.__inputCount}개
                        </Flex>
                        <Div width={44} height={44} cursor={1}
                             bg={'white'}
                             fg={log.__inputCount >= log.printedCount ? 'light' : COLOR.MAIN}
                             onClick={log.__inputCount >= log.printedCount ? null : onHandleChange.bind(this, 1)}
                        >
                            <IoMdAdd size={40}/>
                        </Div>
                        {/*<FlexButton height={44} rounded={0}*/}
                        {/*            bg={'white'}*/}
                        {/*            disabled={log.__inputCount >= log.printedCount}*/}
                        {/*            onClick={onHandleChange.bind(this, 1)}*/}
                        {/*><IoMdAdd/></FlexButton>*/}
                    </GridPad>
                    {/*<LocalButton mt={29} mb={10} onClick={onRestoreClick}>원래대로</LocalButton>*/}
                    <LocalButton mt={29} bordered onClick={onManualSoldoutClick}>입고취소</LocalButton>

                    {/*<FlexButton bg={'white'} bc={'secondary'} width={85} height={89} px={16} onClick={onRestoreClick} rounded={4}>*/}
                    {/*    <div>*/}
                    {/*        <MdOutlineSettingsBackupRestore size={25} style={{marginBottom: 4}}/>*/}
                    {/*        <div>원래대로</div>*/}
                    {/*    </div>*/}
                    {/*</FlexButton>*/}
                    {/*<FlexButton bg={'white'} bc={'secondary'} fg={'danger'} width={85} height={89} rounded={4} mr={16} px={16}*/}
                    {/*            onClick={onManualSoldoutClick}*/}
                    {/*>*/}
                    {/*    <div>*/}
                    {/*        <MdDeleteForever size={25} style={{marginBottom: 4}}/>*/}
                    {/*        <div>입고취소</div>*/}
                    {/*    </div>*/}
                    {/*</FlexButton>*/}
                </div>
            }
        />
            <NumPadModal title={`수량변경`} modalOpen={modalOpen} toggle={toggle} onChange={onNumberPadChange} >
                <Div p={16} fontSize={24}>
                    <Div fg={'dark'} fontSize={20}>
                        {ComUtil.utcToString(log.timestamp, 'MM-DD HH:mm')}
                    </Div>
                    <Div fw={900}>{option.optionName}</Div>
                    <Space>
                        <Span>{ComUtil.addCommas(log.price)}원</Span>
                        <span>×</span>
                        <Strong fg={'#1a43f3'}>{ComUtil.addCommas(log.printedCount)}개</Strong>
                    </Space>

                </Div>
            </NumPadModal>
        </>
    )


    return(
        <Flex
            rounded={8}
            bc={isModified ? 'primary':'light'}
            overflow={'hidden'}
            bw={'2px'}
        >
            {/*<Image images={option.optionImages} width={140} height={'100%'} cover/>*/}
            <Image images={goods.goodsImages} width={140} height={'100%'} cover/>

            <Flex
                flexGrow={1}
                flexWrap={'wrap'}
                px={16}
                py={20}

                alignItems={'flex-start'}
            >


                <div>
                    {/*<Space>*/}
                    {/*<Span fg={'darkgray'}> {selectedLog.localGoodsName } TODO goods.optionName으로 치환, </Span>*/}
                    {/*{findOption(goods, log) &&*/}
                    {/*<Div fw={900}>{findOption(goods, log).optionName}</Div>*/}
                    {/*}*/}
                    <Div fontSize={18} fw={900}>{option.optionName}</Div>
                    {/*</Space>*/}
                    <Space fontSize={16}>
                        <Span>{ComUtil.addCommas(log.price)}원</Span>
                        <span>×</span>
                        <Span>{ComUtil.addCommas(log.printedCount)}개</Span>
                    </Space>
                    <Div fg={'dark'} fontSize={13}>
                        {ComUtil.utcToString(log.timestamp, 'MM-DD HH:mm')}
                    </Div>
                </div>
                <Space ml={'auto'} flexShrink={0} spaceGap={20}>
                    <GridPad>
                        <Flex height={44} justifyContent={'center'} bg={'veryLight'} fontSize={20} fw={900} onClick={toggle} fg={isModified ? 'primary' : 'black'}>
                            {log.__inputCount}
                        </Flex>
                        <FlexButton height={44} rounded={0}
                                    bg={'white'}
                            // onClick={onIncreaseClick}
                                    disabled={log.__inputCount <= 0}
                                    onClick={onHandleChange.bind(this, -1)}
                        ><IoMdRemove/></FlexButton>

                        <FlexButton height={44} rounded={0}
                                    bg={'white'}
                            // onClick={onDecreaseClick}
                                    disabled={log.__inputCount >= log.printedCount}
                                    onClick={onHandleChange.bind(this, 1)}
                        ><IoMdAdd/></FlexButton>
                    </GridPad>
                    <FlexButton bg={'white'} bc={'secondary'} width={85} height={89} px={16} onClick={onRestoreClick} rounded={4}>
                        <div>
                            <MdOutlineSettingsBackupRestore size={25} style={{marginBottom: 4}}/>
                            <div>원래대로</div>
                        </div>
                    </FlexButton>
                    <FlexButton bg={'white'} bc={'secondary'} fg={'danger'} width={85} height={89} rounded={4} mr={16} px={16}
                                onClick={onManualSoldoutClick}
                    >
                        <div>
                            <MdDeleteForever size={25} style={{marginBottom: 4}}/>
                            <div>입고취소</div>
                        </div>
                    </FlexButton>
                </Space>
                <NumPadModal title={`수량변경`} modalOpen={modalOpen} toggle={toggle} onChange={onNumberPadChange} >
                    <Div bg={'veryLight'} p={16}>
                        <Space fontSize={35}>
                            <Div fw={900}>{option.optionName}</Div>
                            <Span>{ComUtil.addCommas(log.price)}원</Span>
                            <span>×</span>
                            <Span>{ComUtil.addCommas(log.printedCount)}개</Span>
                        </Space>
                        <Div fg={'dark'} fontSize={13}>
                            {ComUtil.utcToString(log.timestamp, 'MM-DD HH:mm')}
                        </Div>
                    </Div>
                </NumPadModal>
            </Flex>
        </Flex>
    )
}

export default withRouter(FarmerPrintInputMod);
