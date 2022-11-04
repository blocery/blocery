import React, {useState, useEffect} from 'react'
import {Div, Space, Flex, Button, Hr, Right, Span, Img, GridColumns} from "~/styledComponents/shared";
import {Col, FormGroup, Input, Label, Modal, ModalBody, ModalFooter, ModalHeader, Row, Spinner} from "reactstrap";
import {useParams} from "react-router-dom";
import BasicNavigation from "~/components/common/navs/BasicNavigation";

import {
    getCountLogListAll,
    checkSafeIp,
    getGoodsListByLocalFarmerNo,
    getLocalfoodFarmerBySeq,
} from "~/lib/localfoodApi"
import ComUtil from "~/util/ComUtil";
import NumPadModal from "~/components/common/modals/NumPadModal"
import styled, {keyframes} from "styled-components";
import {Server} from "~/components/Properties";
import NoImageDefault from "~/images/noimage-300x267.png";
import {useModal} from "~/util/useModal";
import useInterval from "~/hooks/useInterval";
import moment from "moment-timezone";
import {BsCoin} from "react-icons/all";
import {TYPE_OF_IMAGE} from "~/lib/bloceryConst";
import useImg from "~/hooks/useImg";
import {addLocalFarmerQnA} from "~/lib/producerApi";
import {toast} from "react-toastify";
import useImageViewer from "~/hooks/useImageViewer";
import {LocalGoodsCard, COLOR, LocalButton} from "./LocalCountComponents";

const primary = '#1db691'

const ImageWrapper = styled.div`
    flex-shrink: 0;
    width: 108px;
    height: 108px;
    margin-right: 16px;
    border-radius: 8px;
    
    ${({theme}) => theme.tablet`
        width: 60px;
        height: 60px;
    `}
    
    ${({theme}) => theme.mobile`
        width: 50px;
        height: 50px;
        margin-right: 8px;
    `}
    
`
//TYPE_OF_IMAGE.SMALL_SQUARE
const Image = ({images, type = TYPE_OF_IMAGE.SMALL_SQUARE, errorImage = NoImageDefault, ...rest}) => {
    const {imageUrl, onError} = useImg(images, type, errorImage)
    return <Img {...rest} src={imageUrl} onError={onError}/>
}


const LocalCount = (props) => {

    const useDelay = true; //자동 새로고침 사용하기
    const SECOND = 1000;
    const DELAY = SECOND * 30;  //자동 새로고침 딜레이 시간 30초
    const [delay, setDelay] = useState(null)
    const [fetchedDate, setFetchedDate] = useState(null)

    const {producerNo} = useParams()

    const [numPadIsOpen, setNumPadIsOpen, , , , numPadToggle] = useModal()

    const [list, setList] = useState()

    const [safeIpMsg, setSafeIpMsg] = useState('IP checking...')

    const isSafeIpFlag = () => {
        if (safeIpMsg == '') return true;
        return false;
    }

    useEffect(() => {

        async function fetch(){

            let {data: ipRes} = await checkSafeIp()
            if (ipRes.resCode == 0) { //안전한 IP
                setSafeIpMsg('') //안전한 IP 일때 ''임.

                let {data} = await getCountLogListAll(producerNo)
                setList(data)

            }else{ //위험한 IP
                setSafeIpMsg(ipRes.errMsg)
            }

            if (useDelay) {
                setDelay(DELAY)
                setFetchedDate(new Date())
            }
        }

        fetch()

    }, [])

    //조회용 인터벌
    useInterval(() =>{
        refreshSearch()
    }, delay)

    const refreshSearch = async () => {
        //조회되는 시간차를 없애기 위해 딜레이는 항상 클리어
        if (useDelay)
            setDelay(null)

        if (isSafeIpFlag()) { //안전한 IP일때만 수행.
            let {data} = await getCountLogListAll(producerNo)
            setList(data)
        }

        if (useDelay) {
            setDelay(DELAY)
            setFetchedDate(new Date())
        }
    }


    //TODO 재고관리용 주석 (나중에 쓸 수 있음)
    // const onChangeNumPad = (keyValue) => {
    //     setNumPadIsOpen(false);
    //     if(keyValue != "" && parseInt(keyValue) > 0) {
    //         onClickFarm(keyValue);
    //     }
    // }
    //TODO 재고관리용 주석 (나중에 쓸 수 있음)
    // const onClickFarm = (localFarmerNo) => {
    //     props.history.push(`/localCount/localFarmer/${producerNo}/${localFarmerNo}`)
    // }

    const onClickFarmPrint = async (log) => {

        try{
            if (log.errType === 0) {
                /* /localCount/farmerPrint/:tabId/:seq */
                props.history.push(`/localCount/farmerPrint/0/${log.seq}`)
            }else{

                const {status, data: farmer} = await getLocalfoodFarmerBySeq(log.seq)
                console.log({farmer: farmer})

                if (log.errType === 1) {

                    //농가 등록 요청
                    const params = {
                        localfoodFarmerNo: farmer ? farmer.localfoodFarmerNo : 0,
                        producerNo: log.producerNo,
                        qaKind: '미등록 농가등록 요청',
                        goodsNo: log.goodsNo,
                        localFarmerQns: `미등록 농가 (${log.farmerNo}) 등록 요청`
                    }

                    await contact(params, `미등록 농가 (${log.farmerNo}) 등록 요청을 하였습니다.`)

                }else{

                    //품목코드 등록 요청
                    const params = {
                        localfoodFarmerNo: farmer ? farmer.localfoodFarmerNo : 0,
                        producerNo: log.producerNo,
                        qaKind: '미등록 품목코드 등록 요청',
                        goodsNo: 0,
                        localFarmerQns: `${log.farmerName}(${log.farmerNo})의 미등록 품목코드 (${log.localGoodsNo}) 등록 요청, 상품명:(${log.localGoodsName})`
                    }
                    await contact(params, `미등록 품목코드 (${log.localGoodsNo}) 등록 요청을 하였습니다.`)
                }

            }



        }catch (err) {
            console.error(err.message)
        }
    }

    const contact = async (params, kindMessage) => {
        const {status, data:errRes} = await addLocalFarmerQnA(params)

        if (status === 200) {
            //성공
            if (errRes.resCode === 0) {
                toast.success(kindMessage, {
                    position: toast.POSITION.TOP_RIGHT
                })
            }else{
                toast.warn(`에러가 발생 하였습니다. 다시 시도 해 주세요.`, {
                    position: toast.POSITION.TOP_RIGHT
                })
            }
        }
    }

    const onErrorImg = (e) => {
        e.target.src = NoImageDefault;
    }

    const {openImageViewer} = useImageViewer()

    const onImageClick = (images) => {
        openImageViewer(images, 0)
    }

    if (!isSafeIpFlag()) {
        return (<Div> {safeIpMsg} </Div>) //관리자에서 IP를 등록하세요 등...
    }

    return (
        <div>

            {/*<BasicNavigation rightContent={*/}
            {/*    <Space pr={16} spaceGap={8} fontSize={14} fg={'dark'}>*/}
            {/*        <div>업데이트 {fetchedDate && moment(fetchedDate).format("HH:mm:ss")}</div>*/}
            {/*        <Spinner color={'primary'} size={'md'} />*/}
            {/*    </Space>*/}
            {/*}>*/}
            {/*    <Div px={16}>온라인 입고 현황 (바코드 취소 가능)</Div>*/}
            {/*</BasicNavigation>*/}

            <Flex bg={primary} height={99} px={30} fg={'white'}>
                <Div fontSize={40} fw={900}>
                    샵블리 상품 바코드 현황
                </Div>
                <Flex ml={19} bg={COLOR.SUB} fontSize={19} fw={500} fg={'white'} px={16} height={34} rounded={16}>바코드 취소 가능</Flex>
                <Flex ml='auto' fw={500} fontSize={20}>
                    <div>업데이트 {fetchedDate && moment(fetchedDate).format("HH:mm:ss")}</div>
                    <Spinner style={{color: 'white', marginLeft: 15}} size={30} />
                </Flex>
            </Flex>

            {/*<Space bg={'green'} fg={'white'} rounded={8} fontSize={20} m={16} px={16} py={4} height={54} bold relative>*/}
            {/*    <Coin />*/}
            {/*    <span>농가분들, 재고관리 해서 현금 받아가세요~!</span>*/}
            {/*</Space>*/}

            {
                list &&
                <GridColumns colGap={0} rowGap={15} px={20} py={35} bg={'#E3E6E8'}>
                    {
                        list.map((log, index) =>
                            <LocalGoodsCard
                                key={log.seq}
                                goodsImages={log.errType === 0 ? log.optionImages : null}
                                onImageClick={onImageClick.bind(this, log.optionImages)}
                                farmerName={log.errType === 1 ? `미등록 농가(${log.farmerNo})` : log.farmerName}
                                visibleFarmerName={true}
                                optionName={
                                    log.errType === 0 ? `${log.goodsNm} ${log.optionName} ${log.sizeNo}` :
                                        log.errType === 1 ? log.localGoodsName : `미등록 품목코드(${log.localGoodsNo})`
                                }
                                price={log.price}
                                printedCount={log.printedCount}
                                timestamp={log.timestamp}
                                // buttonText={log.errType === 1 ? '농가 등록요청' : log.errType === 2 ? '상품 등록요청' : '상품 수정'}
                                // onButtonClick={onClickFarmPrint.bind(this, log)}

                                // rightContent={<LocalButton onClick={onClickFarmPrint.bind(this, log)}>{log.errType === 1 ? '농가 등록요청' : log.errType === 2 ? '상품 등록요청' : '수량 변경'}</LocalButton>}
                                rightContent={<StateButton seq={log.seq} errType={log.errType} onClick={onClickFarmPrint.bind(this, log)}>{log.errType === 1 ? '농가 등록요청' : log.errType === 2 ? '상품 등록요청' : '수량 변경'}</StateButton>}
                            />)
                    }
                </GridColumns>
            }
            {/*<NumPadModal title={"나의 재고관리 (농가번호)"} modalOpen={numPadIsOpen} toggle={numPadToggle} onChange={onChangeNumPad} />*/}
        </div>
    )
}

export default LocalCount


function getLocalStorage(key) {
    if (localStorage.getItem(key)) {
        return JSON.parse(localStorage.getItem(key))
    }

    return []
}

const StateButton = ({seq = 0, errType, children, onClick}) => {

    const seqList = ComUtil.getLocalStorage("localCountContactedSeqList", [])

    const [isContacted, setContacted] = useState(seqList.includes(seq))

    console.log({seqList: seqList})

    // const [isClicked, setClicked] = useState(false)
    const onHandleClick = () => {
        //농가등록, 상품등록 요청 일때만 버튼 비활성화(한번만 요청 하도록)
        if (seq && [1,2].includes(errType)) {

            if (!seqList.includes(seq)) {
                if (seqList.length > 10) {
                    //첫번째 제거
                    seqList.shift(0)
                }
                seqList.push(seq)
                setContacted(true)
            }

            localStorage.setItem("localCountContactedSeqList", JSON.stringify(seqList))
        }

        onClick()
    }
    return (<LocalButton disabled={isContacted} onClick={onHandleClick}>
        {children}
    </LocalButton>)
    return(
        <Button rounded={8} bw={'2px'} width={108} height={108} bg={'white'} bold fg={seq ? 'danger' : 'primary'} bc={seq ? 'danger' : 'primary'} disabled={isContacted} onClick={onHandleClick} px={10} fontSize={20}>
            {children}
        </Button>
    )
}



const CoinWrapper = styled.div`
    position: relative;
    perspective: 500px;
        
`

const rotation = keyframes`
    from{}
    to{transform: rotateY(360deg);}
`

const AnimatedCoin = styled(BsCoin)`
  transform-style: preserve-3d;
  animation: ${rotation} 3s ease-in-out infinite;
  // border-radius: 5px;
  // padding: 5px;
  font-size: 24px;
`


const Coin = () =>
    <CoinWrapper>
        <AnimatedCoin />
    </CoinWrapper>