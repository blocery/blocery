import React, {useState, useEffect, useRef, Fragment} from 'react'
import {Button, Div, Flex, Hr, Right, Span, Space, Input} from "~/styledComponents/shared";
import {useParams} from "react-router-dom";
import BackNavigation from "~/components/common/navs/BackNavigation";
import { getGoodsListByLocalFarmerNo, barcodePrintedDirect, productSold, goodsRefresh, getLocalFarmerByLocalFarmerNo, updateLocalFarmerManualFlag, updateLocalFarmerBarcodeRatio} from "~/lib/localfoodApi";
import {EmptyBox} from "~/styledComponents/ShopBlyLayouts";
import {IoMdAdd, IoMdRemove} from "react-icons/io";
import styled from "styled-components";
import Switch from "react-switch";
import {Modal, ModalBody, ModalFooter, ModalHeader, Spinner} from "reactstrap";
import {useModal} from "~/util/useModal";
import ComUtil from "~/util/ComUtil";
import useInterval from "~/hooks/useInterval";

const FlexButton = styled(Button)`
    display: flex;
    align-items: center;
    justify-content: center;
`
const FarmerCount = (props) => {

    const useDelay = false; //자동 새로고침 사용하기
    const SECOND = 1000;
    const DELAY = SECOND * 60;  //자동 새로고침 딜레이 시간 1분
    const [delay, setDelay] = useState(null)
    const [fetchedDate, setFetchedDate] = useState(null)

    const {localFarmerNo, producerNo} = useParams()

    //농가 설정
    const [farmer, setFarmer] = useState()
    const [manualFlag, setManualFlag] = useState()
    const [barcodeRatio, setBarcodeRatio] = useState()
    const [modalOpen, setModalOpen, selected, setSelected, setModalState, toggle] = useModal()
    const [radioBarcodeRatio, setRadioBarcodeRatio] = useState(70)

    const [goodsList, setGoodsList] = useState([])

    const [selectedGoods, setSelectedGoods] = useState(null)

    const [showDeletedOption, setShowDeletedOption] = useState(false)

    useEffect(() => {
        async function fetch() {

            let {data} = await getGoodsListByLocalFarmerNo(producerNo, localFarmerNo)
            setGoodsList(data)
            if (useDelay) {
                setDelay(DELAY)
                setFetchedDate(new Date())
            }

            if (data.length > 0) {
                setSelectedGoods(data[0])
            }

            let {data:farmerData} = await getLocalFarmerByLocalFarmerNo(producerNo, localFarmerNo)
            setFarmer(farmerData)
            setManualFlag(farmerData.manualFlag)
            setBarcodeRatio(farmerData.barcodeRatio)
            setRadioBarcodeRatio(farmerData.barcodeRatio)
            console.log(farmerData)
        }
        fetch()
    }, [])

    //조회용 인터벌
    useInterval(() =>{
        refreshSearch()
    }, delay)

    const refreshSearch = async () => {
        //조회되는 시간차를 없애기 위해 딜레이는 항상 클리어
        if (useDelay) {
            setDelay(null)
        }
        let {data} = await getGoodsListByLocalFarmerNo(producerNo, localFarmerNo)
        setGoodsList(data)

        if (useDelay) {
            setDelay(DELAY)
            setFetchedDate(new Date())
        }
    }

    useEffect(() => {
        //just Refresh
    }, [showDeletedOption, manualFlag, barcodeRatio, radioBarcodeRatio])

    const onClickGoods = (idx) => {
        setSelectedGoods(goodsList[idx])
    }

    const refreshSelectedGoods = (data) => {
        // console.log("refreshSelectedGoods==data==",data)
        //const objGoodsList = Object.assign([], goodsList)
        const newList = goodsList.map((item)=>{
            let {realRemainedCnt, remainedCnt, options} = item
            if(item.goodsNo === data.goodsNo) {
                realRemainedCnt = data.realRemainedCnt;
                remainedCnt = data.remainedCnt;
                options = data.options;
            }
            return {
                ...item,
                realRemainedCnt: realRemainedCnt,
                remainedCnt: remainedCnt,
                options: options
            }
        });
        setSelectedGoods(data)
        setGoodsList(newList);
    }

    const handleShowDeletedOptionChange = () => {
        setShowDeletedOption(!showDeletedOption)
    }


    const onManualFlagChange = async (e) => {
        // console.log('onManualFlagChange', e.target.value)
        if(e.target.value === 'true') {

            if (!window.confirm('[숨겨진 상품보기]를 활용해 매장에 입고되는 재고수를 수동으로 관리하게 됩니다. 항상 수동으로 재고입고를 하시겠습니까? ')) {
                return;
            }
            await updateLocalFarmerManualFlag(farmer.localfoodFarmerNo, true)
            setManualFlag(true)
        }
        else if(e.target.value === 'false') {

            await updateLocalFarmerManualFlag(farmer.localfoodFarmerNo, false)
            setManualFlag(false)
        }
    }

    const onBarcodeRatioButton = () => {
        setModalOpen(true)
    }

    const onRadioBarcodeChange = (e) => {
        // console.log('onRadioBarcodeChange', e.target.value)
        setRadioBarcodeRatio(Number(e.target.value))

        // if(e.target.value === '1.0') {
        //     setRadioBarcodeRatio(1.0)
        // }else if (e.target.value === '0.7') {
        //
        // }else if (e.target.value === '0.5') {
        //
        // }else if (e.target.value === '0.3') {
        //
        // }
    }

    const onSaveModal = async() => {

        await updateLocalFarmerBarcodeRatio(farmer.localfoodFarmerNo, radioBarcodeRatio)
        setBarcodeRatio(radioBarcodeRatio)
        setModalOpen(false)
    }

    return (
        <div>
            <BackNavigation>
                <Div pl={16}>
                    <Flex justifyContent={'space-between'}>
                        <Span mr={5}>온라인 재고현황</Span>
                        {/*<Spinner color={'primary'} size={'sm'} />*/}
                    </Flex>
                </Div>
            </BackNavigation>

            <Div fontSize={14} bg={'black'} fg={'veryLight'} px={16} py={8}>
                농가번호: <b>{localFarmerNo}</b>
                {farmer && <b> {farmer.farmerName} </b>}
            </Div>
            <Hr />

            <Flex mr={20}>
                <Div p={16}> 농가 입고설정 </Div>
                <Right>
                    <Div p={10}>
                        <Space>
                            <Flex mb={10}>
                                <input checked={!manualFlag} type="radio" id="state1" name="state" onChange={onManualFlagChange} value={'false'}/>
                                <Div ml={10} >
                                    <Div>바코드연동 재고입고</Div>
                                    <Div fontSize={12}>(바코드 출력수 <Span bold fg={'danger'}>x {barcodeRatio}%</Span> 자동입고) </Div>
                                </Div>
                                <Button bc={'light'} bg={'danger'} fg={'white'} fontSize={10} onClick={onBarcodeRatioButton}>
                                    변경
                                </Button>
                            </Flex>
                        </Space>
                        <Space>
                            <input checked={manualFlag} type="radio" id="state2" name="state" onChange={onManualFlagChange} value={'true'}/>
                            <Div ml={10} >
                                <Div>항상 수동으로 재고입고</Div>
                                <Div fontSize={12}> (폰으로도 재고수정 가능)</Div>
                            </Div>
                        </Space>
                    </Div>
                </Right>
            </Flex>
            <Hr />

            {/*<Div p={16}> 상품목록 </Div>*/}
            <Flex flexWrap={'wrap'}>
                { goodsList.map ((goods,idx) =>
                    <Button bg={(selectedGoods && selectedGoods.goodsNo === goods.goodsNo)?'green':'darkgray'}
                                onClick={onClickGoods.bind(this, idx)} p={5} m={5} fg={'white'}>
                        {goods.objectUniqueFlag?'[실물확인 상품]':''}{goods.goodsNm}({goods.remainedCnt}개)
                    </Button>
                  )
                }
            </Flex>

            <Hr />

            <Flex mr={10}>
                <Div p={16}> 단위별 재고 </Div>
                {/*: [{selectedGoods && selectedGoods.goodsNm}] 상품 */}
                <Right>
                    <Flex>
                        <div>숨겨진상품 보기 &nbsp;</div>
                        <Switch checked={showDeletedOption} onChange={handleShowDeletedOptionChange}></Switch>
                    </Flex>
                </Right>
            </Flex>
            <div>
                { (!selectedGoods || selectedGoods.options.length <= 0)?
                    <EmptyBox>조회 내역이 없습니다.</EmptyBox>
                    :
                    selectedGoods.options
                        .filter((option) => showDeletedOption?true:!option.deleted)
                        .map((option) =>
                        <FarmerCountItem option={option} selectedGoods={selectedGoods} onChange={refreshSelectedGoods} />
                    )
                }
            </div>

            {/* ration변경 모달 */}
            <Modal size="lg" isOpen={modalOpen}
                   toggle={toggle} >
                <ModalHeader toggle={toggle}>
                    바코드 연동비율 변경
                </ModalHeader>
                <ModalBody>
                    <Flex flexDirection={'column'}  alignItems={'flex-start'}>
                        <Space>
                            <input checked={radioBarcodeRatio==100} type="radio" id="stateRadio1" name="stateRadio" onChange={onRadioBarcodeChange} value={100}/>
                            <label>100% (정확하게 바코드 출력하는 농가, 비추천)</label>
                        </Space>

                        <Space>
                            <input checked={radioBarcodeRatio==90} type="radio" id="stateRadio1" name="stateRadio" onChange={onRadioBarcodeChange} value={90}/>
                            <label>90% </label>
                        </Space>

                        <Space>
                            <input checked={radioBarcodeRatio==70} type="radio" id="stateRadio2" name="stateRadio" onChange={onRadioBarcodeChange} value={70}/>
                            <label>70% (일반적인 농가, 추천)</label>
                        </Space>

                        <Space>
                            <input checked={radioBarcodeRatio==50} type="radio" id="stateRadio3" name="stateRadio" onChange={onRadioBarcodeChange} value={50}/>
                            <label>50% (일반적인 농가 - 매장판매가 많은경우)</label>
                        </Space>

                        <Space>
                            <input checked={radioBarcodeRatio==30} type="radio" id="stateRadio4" name="stateRadio" onChange={onRadioBarcodeChange} value={30}/>
                            <label>30% (바코드를 여유있게 출력하는 농가)</label>
                        </Space>

                    </Flex>
                </ModalBody>
                <ModalFooter>
                    <Button primary onClick={onSaveModal}>저장</Button>
                    <Button color="secondary" onClick={toggle}>취소</Button>
                </ModalFooter>
            </Modal>

        </div>
    )
}

const FarmerCountItem = ({selectedGoods, option, onChange}) => {

    const [selectedGoodsData, setSelectedGoodsData] = useState(selectedGoods);
    const [optionData, setOptionData] = useState(option);
    const [manualCnt,setManualCnt] = useState(0)

    useEffect(() => {
        setSelectedGoodsData(selectedGoods)
        setOptionData(option)
    }, [selectedGoods, option])

    //재고입력완료 후 refresh
    const goodsSearch = async () => {
        //setSelectedGoods(goodsList[idx])
        const {data} = await goodsRefresh(selectedGoodsData.goodsNo);
        // console.log("goodsSearch===",data);
        const vOption = data.options && data.options.find(option => option.optionIndex === optionData.optionIndex);
        // console.log("goodsSearch==option==",vOption)
        //selectedGoodsData 갱신
        //option 값과 비교하여 정보 갱신
        setSelectedGoodsData(data);
        setOptionData(vOption);
        onChange(data);
    }

    const onManualChangeCountButtonClick = (gubun) => {
        if(gubun === "minus"){
            setManualCnt(manualCnt - 1);
        } else if (gubun === "plus"){
            setManualCnt(manualCnt + 1);
        }
    }

    const onManualChangeCountConfirmButtonClick = async () => {
        if(manualCnt < 0){
            const minusCnt = manualCnt * -1;
            //재고감소 -1
            if(minusCnt > optionData.remainedCnt) {
                alert("재고보다 숫자가 큽니다")
                return
            }

            //producerNo, farmerNo, productNo, sizeNo, localGoodsName, count, price
            let {data:errRes} = await productSold(selectedGoodsData.producerNo, selectedGoodsData.localFarmerNo, selectedGoodsData.localGoodsNo,
                optionData.sizeNo, "수동 감소", minusCnt, optionData.optionPrice)

            if (errRes.resCode) {
                alert(errRes.errMsg)
                return
            }

            //새로검색
            await goodsSearch()

        }else if (manualCnt > 0){
            //재고증가
            //producerNo, farmerNo,productNo, sizeNo, localGoodsName, price, printedCount
            let {data:errRes} = await barcodePrintedDirect(selectedGoodsData.producerNo, selectedGoodsData.localFarmerNo, selectedGoodsData.localGoodsNo,
                optionData.sizeNo, "수동 증가", optionData.optionPrice, manualCnt)

            if (errRes.resCode) {
                alert(errRes.errMsg)
                return
            }

            //새로검색
            await goodsSearch()
        }
    }

    const manualSoldOut = async () => {
        if (window.confirm("품절처리하시겠습니까?")) {
            //producerNo, farmerNo, productNo, sizeNo, localGoodsName, count, price
            let {data: errRes} = await productSold(selectedGoodsData.producerNo, selectedGoodsData.localFarmerNo, selectedGoodsData.localGoodsNo,
                optionData.sizeNo, "수동 감소", optionData.remainedCnt, optionData.optionPrice)

            if (errRes.resCode) {
                alert(errRes.errMsg)
                return
            }
            //새로검색
            await goodsSearch()
        }
    }

    return(
        <Div ml={10} mr={10} fontSize={15} lineHeight={20} flexGrow={1}>
            <Flex flexWrap={'wrap'} p={10} mb={5} bc={'light'}>
                <Div>
                    <Span fg={'darkgray'}> {optionData.optionName}, </Span>
                    <Span fg={'black'}> {ComUtil.addCommas(optionData.optionPrice)}원, </Span>
                    <Span fg={'green'}>  재고:{ComUtil.addCommas(optionData.realRemainedCnt)}개 </Span>
                </Div>
                <Right>
                    <Flex>
                        <Space>
                            {optionData.objectUniqueNo == 0 && //개체인식은 제외
                            <Fragment>
                                <Flex bg={'light'} bc={'light'} height={40}>
                                    <FlexButton height={'100%'}
                                                onClick={onManualChangeCountButtonClick.bind(this, "minus")}
                                    ><IoMdRemove/></FlexButton>
                                    <Div height={'100%'} width={90}>
                                        <Input p={0} height={'100%'} type={'number'} placeholder={'수량'} width={"100%"}
                                               style={{textAlign: 'center'}} readOnly={true}
                                               value={manualCnt}/>
                                    </Div>
                                    <FlexButton height={'100%'}
                                                onClick={onManualChangeCountButtonClick.bind(this, "plus")}
                                    ><IoMdAdd/></FlexButton>
                                </Flex>
                                <Button bc={'light'} bg={'green'} fg={'white'} fontSize={13} height={50}
                                        onClick={onManualChangeCountConfirmButtonClick}>
                                    <div>{manualCnt !== 0 && optionData.realRemainedCnt + manualCnt}</div>
                                    <div>반영</div>
                                </Button>
                            </Fragment>
                            }

                            {
                                optionData.realRemainedCnt > 0 &&
                                <Button bc={'light'} bg={'danger'} fg={'white'} fontSize={13} height={50} onClick={manualSoldOut}>
                                    <div></div>
                                    <div>품절</div>
                                </Button>
                            }
                        </Space>
                    </Flex>
                </Right>
            </Flex>
        </Div>
    )
}

export default FarmerCount;